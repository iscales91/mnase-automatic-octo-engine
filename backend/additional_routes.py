"""
Additional Routes for Media Management, Recurring Events, and Email Queue
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field
import os
import uuid
import jwt

# Import services
from media_service import MediaService
from email_queue_service import EmailQueueService

router = APIRouter(prefix="/api")

# Pydantic Models
class RecurringEventCreate(BaseModel):
    title: str
    description: str
    location: str
    start_date: str  # ISO format
    start_time: str
    end_time: str
    recurring: bool = False
    recurrence_frequency: Optional[str] = None  # daily, weekly, monthly
    recurrence_end_date: Optional[str] = None
    recurrence_days: Optional[List[str]] = []  # For weekly: ['monday', 'wednesday']
    capacity: Optional[int] = None
    price: float = 0
    category: str = "other"
    
class MediaUpdate(BaseModel):
    media_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class EmailQueue(BaseModel):
    to_email: str
    subject: str
    body: str
    priority: str = "normal"

# Dependency functions
async def get_current_user(request: Request):
    """Get authenticated user from request"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET", "your-secret-key"), algorithms=["HS256"])
        user_id = payload.get("user_id")
        db = request.app.state.db
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request):
    """Verify admin access"""
    user = await get_current_user(request)
    admin_roles = ['super_admin', 'admin', 'manager']
    if user.get('role') not in admin_roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ===== RECURRING EVENTS ENDPOINTS =====

@router.post("/events/recurring")
async def create_recurring_event(
    event: RecurringEventCreate,
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Create recurring event instances"""
    db = await get_db(request)
    
    if not event.recurring:
        # Create single event
        event_doc = {
            "id": str(uuid.uuid4()),
            "title": event.title,
            "description": event.description,
            "date": event.start_date,
            "time": event.start_time,
            "end_time": event.end_time,
            "location": event.location,
            "capacity": event.capacity,
            "price": event.price,
            "category": event.category,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": admin["id"]
        }
        await db.calendar_events.insert_one(event_doc)
        return {"message": "Event created", "event_id": event_doc["id"]}
    
    # Create recurring events
    start_date = datetime.fromisoformat(event.start_date)
    end_date = datetime.fromisoformat(event.recurrence_end_date) if event.recurrence_end_date else start_date + timedelta(days=365)
    
    created_events = []
    current_date = start_date
    
    while current_date <= end_date:
        should_create = False
        
        if event.recurrence_frequency == "daily":
            should_create = True
        elif event.recurrence_frequency == "weekly":
            day_name = current_date.strftime("%A").lower()
            should_create = day_name in [d.lower() for d in (event.recurrence_days or [])]
        elif event.recurrence_frequency == "monthly":
            should_create = current_date.day == start_date.day
        
        if should_create:
            event_doc = {
                "id": str(uuid.uuid4()),
                "title": event.title,
                "description": event.description,
                "date": current_date.strftime("%Y-%m-%d"),
                "time": event.start_time,
                "end_time": event.end_time,
                "location": event.location,
                "capacity": event.capacity,
                "price": event.price,
                "category": event.category,
                "is_recurring": True,
                "recurrence_group": None,  # Can add group ID later
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": admin["id"]
            }
            await db.calendar_events.insert_one(event_doc)
            created_events.append(event_doc["id"])
        
        # Increment date
        if event.recurrence_frequency == "daily":
            current_date += timedelta(days=1)
        elif event.recurrence_frequency == "weekly":
            current_date += timedelta(days=1)
        elif event.recurrence_frequency == "monthly":
            # Move to next month, same day
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
    
    return {
        "message": f"Created {len(created_events)} recurring event instances",
        "event_ids": created_events,
        "count": len(created_events)
    }

# ===== MEDIA MANAGEMENT ENDPOINTS =====

@router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    category: str = Form(...),
    title: str = Form(""),
    description: str = Form(""),
    tags: str = Form(""),  # Comma-separated
    request: Request = None,
    user: dict = Depends(get_admin_user)
):
    """Upload media file (admin only)"""
    db = await get_db(request)
    media_service = MediaService(db)
    
    # Read file data
    file_data = await file.read()
    
    # Parse tags
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    
    result = await media_service.upload_media(
        file_data=file_data,
        filename=file.filename,
        category=category,
        title=title,
        description=description,
        uploaded_by=user["id"],
        tags=tag_list
    )
    
    return result

@router.get("/media/{category}/{filename}")
async def get_media_file(category: str, filename: str, request: Request):
    """Serve media file"""
    media_path = f"/app/backend/media/{category}/{filename}"
    
    if not os.path.exists(media_path):
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Increment view count
    db = await get_db(request)
    media_service = MediaService(db)
    file_id = filename.split('.')[0]
    await media_service.increment_views(file_id)
    
    return FileResponse(media_path)

@router.get("/media/category/{category}")
async def get_media_by_category(
    category: str,
    skip: int = 0,
    limit: int = 50,
    request: Request = None
):
    """Get all media in category"""
    db = await get_db(request)
    media_service = MediaService(db)
    return await media_service.get_media_by_category(category, skip, limit)

@router.put("/media/update")
async def update_media(
    update: MediaUpdate,
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Update media metadata (admin only)"""
    db = await get_db(request)
    media_service = MediaService(db)
    return await media_service.update_media(
        update.media_id,
        update.title,
        update.description,
        update.tags,
        update.category
    )

@router.delete("/media/{media_id}")
async def delete_media(
    media_id: str,
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Delete media (admin only)"""
    db = await get_db(request)
    media_service = MediaService(db)
    return await media_service.delete_media(media_id)

@router.get("/media/search/{query}")
async def search_media(
    query: str,
    category: Optional[str] = None,
    request: Request = None
):
    """Search media"""
    db = await get_db(request)
    media_service = MediaService(db)
    return await media_service.search_media(query, category)

# ===== EMAIL QUEUE ENDPOINTS =====

@router.post("/admin/email-queue/add")
async def add_to_email_queue(
    email: EmailQueue,
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Add email to queue (admin only)"""
    db = await get_db(request)
    queue_service = EmailQueueService(db)
    return await queue_service.queue_email(
        email.to_email,
        email.subject,
        email.body,
        email.priority
    )

@router.post("/admin/email-queue/process")
async def process_email_queue(
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Process email queue (admin only)"""
    db = await get_db(request)
    queue_service = EmailQueueService(db)
    return await queue_service.process_queue()

@router.get("/admin/email-queue/status")
async def get_email_queue_status(
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Get email queue status (admin only)"""
    db = await get_db(request)
    queue_service = EmailQueueService(db)
    return await queue_service.get_queue_status()

@router.post("/admin/email-queue/retry")
async def retry_failed_emails(
    request: Request,
    admin: dict = Depends(get_admin_user)
):
    """Retry failed emails (admin only)"""
    db = await get_db(request)
    queue_service = EmailQueueService(db)
    return await queue_service.retry_failed_emails()
