"""
Media Management Service - Handle file uploads, storage, and gallery
"""
import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import Optional, List
from pathlib import Path
from bson import ObjectId

class MediaService:
    def __init__(self, db):
        self.db = db
        self.media_base_path = Path("/app/backend/media")
        self.allowed_image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
        self.allowed_video_extensions = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}
        self.max_image_size = 10 * 1024 * 1024  # 10MB
        self.max_video_duration = 90 * 60  # 90 minutes in seconds
        
        # Create media directories if they don't exist
        self.categories = ['events', 'programs', 'facilities', 'general']
        for category in self.categories:
            (self.media_base_path / category).mkdir(parents=True, exist_ok=True)
    
    def get_file_extension(self, filename: str) -> str:
        """Get file extension"""
        return Path(filename).suffix.lower()
    
    def is_valid_image(self, filename: str) -> bool:
        """Check if file is a valid image"""
        return self.get_file_extension(filename) in self.allowed_image_extensions
    
    def is_valid_video(self, filename: str) -> bool:
        """Check if file is a valid video"""
        return self.get_file_extension(filename) in self.allowed_video_extensions
    
    async def upload_media(self, file_data: bytes, filename: str, category: str, 
                          title: str = "", description: str = "", 
                          uploaded_by: str = "", tags: List[str] = []):
        """Upload media file and save metadata"""
        
        # Validate category
        if category not in self.categories:
            raise ValueError(f"Invalid category. Must be one of: {', '.join(self.categories)}")
        
        # Check file type and size
        is_image = self.is_valid_image(filename)
        is_video = self.is_valid_video(filename)
        
        if not is_image and not is_video:
            raise ValueError("Invalid file type. Must be image (jpg, png, gif) or video (mp4, mov, avi)")
        
        if is_image and len(file_data) > self.max_image_size:
            raise ValueError(f"Image size exceeds {self.max_image_size / (1024*1024)}MB limit")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        extension = self.get_file_extension(filename)
        new_filename = f"{file_id}{extension}"
        
        # Save file to disk
        category_path = self.media_base_path / category
        file_path = category_path / new_filename
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        # Save metadata to database
        media_doc = {
            "id": file_id,
            "filename": new_filename,
            "original_filename": filename,
            "title": title or filename,
            "description": description,
            "category": category,
            "file_type": "image" if is_image else "video",
            "file_size": len(file_data),
            "file_path": str(file_path),
            "url": f"/api/media/{category}/{new_filename}",
            "tags": tags,
            "uploaded_by": uploaded_by,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "views": 0
        }
        
        await self.db.media.insert_one(media_doc)
        
        return {
            "id": file_id,
            "url": media_doc["url"],
            "filename": new_filename,
            "file_type": media_doc["file_type"]
        }
    
    async def get_media(self, media_id: str):
        """Get media metadata"""
        media = await self.db.media.find_one({"id": media_id}, {"_id": 0})
        return media
    
    async def get_media_by_category(self, category: str, skip: int = 0, limit: int = 50):
        """Get all media in a category"""
        if category not in self.categories and category != 'all':
            raise ValueError(f"Invalid category")
        
        query = {} if category == 'all' else {"category": category}
        
        media_list = await self.db.media.find(query, {"_id": 0})\
            .sort("uploaded_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(length=limit)
        
        total = await self.db.media.count_documents(query)
        
        return {
            "media": media_list,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    async def update_media(self, media_id: str, title: Optional[str] = None, 
                          description: Optional[str] = None, 
                          tags: Optional[List[str]] = None,
                          category: Optional[str] = None):
        """Update media metadata"""
        media = await self.get_media(media_id)
        if not media:
            raise ValueError("Media not found")
        
        update_fields = {}
        if title is not None:
            update_fields["title"] = title
        if description is not None:
            update_fields["description"] = description
        if tags is not None:
            update_fields["tags"] = tags
        
        # If category changed, move the file
        if category and category != media["category"]:
            if category not in self.categories:
                raise ValueError(f"Invalid category")
            
            old_path = Path(media["file_path"])
            new_path = self.media_base_path / category / media["filename"]
            
            shutil.move(str(old_path), str(new_path))
            
            update_fields["category"] = category
            update_fields["file_path"] = str(new_path)
            update_fields["url"] = f"/api/media/{category}/{media['filename']}"
        
        if update_fields:
            update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
            await self.db.media.update_one(
                {"id": media_id},
                {"$set": update_fields}
            )
        
        return await self.get_media(media_id)
    
    async def delete_media(self, media_id: str):
        """Delete media file and metadata"""
        media = await self.get_media(media_id)
        if not media:
            raise ValueError("Media not found")
        
        # Delete file from disk
        file_path = Path(media["file_path"])
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database
        await self.db.media.delete_one({"id": media_id})
        
        return {"message": "Media deleted successfully"}
    
    async def increment_views(self, media_id: str):
        """Increment view count"""
        await self.db.media.update_one(
            {"id": media_id},
            {"$inc": {"views": 1}}
        )
    
    async def search_media(self, query: str, category: Optional[str] = None):
        """Search media by title, description, or tags"""
        search_filter = {
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"tags": {"$in": [query]}}
            ]
        }
        
        if category and category != 'all':
            search_filter["category"] = category
        
        results = await self.db.media.find(search_filter, {"_id": 0})\
            .sort("uploaded_at", -1)\
            .to_list(length=100)
        
        return {"results": results, "count": len(results)}
