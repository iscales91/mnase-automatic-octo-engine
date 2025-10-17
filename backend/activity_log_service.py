"""
Activity Log Service for MNASE Basketball League
Tracks all significant user actions and system events
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, Dict
import uuid

class ActivityLogService:
    def __init__(self):
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        self.db = client[os.environ['DB_NAME']]
        print("✅ ActivityLogService initialized")
    
    async def log_activity(
        self,
        action: str,
        resource_type: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict] = None,
        ip_address: Optional[str] = None,
        status: str = "success",
        error_message: Optional[str] = None
    ):
        """
        Log an activity to the database
        
        Args:
            action: The action performed (e.g., "login", "create_user", "update_role")
            resource_type: Type of resource affected (e.g., "user", "event", "role")
            user_id: ID of user performing the action
            user_email: Email of user for reference
            resource_id: ID of the resource affected
            details: Additional context/metadata
            ip_address: IP address of the request
            status: Status of the action (success, failure, error)
            error_message: Error message if status is failure/error
        """
        try:
            log_entry = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "user_email": user_email,
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "details": details or {},
                "ip_address": ip_address,
                "status": status,
                "error_message": error_message,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.activity_logs.insert_one(log_entry)
            return True
        except Exception as e:
            print(f"❌ Failed to log activity: {e}")
            return False
    
    async def get_logs(
        self,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ):
        """
        Retrieve activity logs with optional filters
        """
        try:
            query = {}
            
            if user_id:
                query["user_id"] = user_id
            if action:
                query["action"] = action
            if resource_type:
                query["resource_type"] = resource_type
            if status:
                query["status"] = status
            if start_date or end_date:
                query["created_at"] = {}
                if start_date:
                    query["created_at"]["$gte"] = start_date.isoformat()
                if end_date:
                    query["created_at"]["$lte"] = end_date.isoformat()
            
            logs = await self.db.activity_logs.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
            return logs
        except Exception as e:
            print(f"❌ Failed to retrieve logs: {e}")
            return []
    
    async def get_user_activity(self, user_id: str, limit: int = 50):
        """Get recent activity for a specific user"""
        return await self.get_logs(user_id=user_id, limit=limit)
    
    async def get_recent_logs(self, limit: int = 100):
        """Get most recent logs across all users"""
        return await self.get_logs(limit=limit)
    
    async def get_failed_actions(self, limit: int = 50):
        """Get recent failed/error actions"""
        return await self.get_logs(status="failure", limit=limit) + await self.get_logs(status="error", limit=limit)
    
    async def get_stats(self):
        """Get activity statistics"""
        try:
            total_logs = await self.db.activity_logs.count_documents({})
            
            # Count by status
            success_count = await self.db.activity_logs.count_documents({"status": "success"})
            failure_count = await self.db.activity_logs.count_documents({"status": "failure"})
            error_count = await self.db.activity_logs.count_documents({"status": "error"})
            
            # Most common actions
            pipeline = [
                {"$group": {"_id": "$action", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            common_actions = await self.db.activity_logs.aggregate(pipeline).to_list(10)
            
            return {
                "total_logs": total_logs,
                "success_count": success_count,
                "failure_count": failure_count,
                "error_count": error_count,
                "common_actions": common_actions
            }
        except Exception as e:
            print(f"❌ Failed to get stats: {e}")
            return {}

# Initialize service
activity_log_service = ActivityLogService()
