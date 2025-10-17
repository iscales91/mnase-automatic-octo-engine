"""
Image Upload Service for MNASE Basketball League
Handles profile photos, team logos, and event images
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
import shutil

class ImageService:
    """
    Service for handling image uploads and storage
    Supports profile photos, team logos, and event images
    """
    
    def __init__(self, upload_dir: str = "/app/uploads"):
        self.upload_dir = Path(upload_dir)
        self.max_file_size = 5 * 1024 * 1024  # 5MB
        self.allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        
        # Create upload directories
        self.profile_dir = self.upload_dir / "profiles"
        self.team_dir = self.upload_dir / "teams"
        self.event_dir = self.upload_dir / "events"
        self.gallery_dir = self.upload_dir / "gallery"
        
        for directory in [self.profile_dir, self.team_dir, self.event_dir, self.gallery_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        print(f"✅ ImageService initialized - Upload directory: {self.upload_dir}")
    
    def validate_image(self, file: UploadFile) -> bool:
        """
        Validate image file
        
        Args:
            file: Uploaded file
            
        Returns:
            bool: True if valid
            
        Raises:
            HTTPException: If validation fails
        """
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(self.allowed_extensions)}"
            )
        
        # Check file size (if possible)
        if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset to beginning
            
            if file_size > self.max_file_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {self.max_file_size / (1024*1024):.1f}MB"
                )
        
        return True
    
    def save_profile_image(self, file: UploadFile, user_id: str) -> str:
        """
        Save user profile image
        
        Args:
            file: Uploaded image file
            user_id: User ID
            
        Returns:
            str: Path to saved image (relative to upload_dir)
        """
        self.validate_image(file)
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower()
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}{file_ext}"
        filepath = self.profile_dir / filename
        
        # Save file
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return relative path
        relative_path = f"profiles/{filename}"
        print(f"✅ Profile image saved: {relative_path}")
        return relative_path
    
    def save_team_logo(self, file: UploadFile, team_id: str) -> str:
        """
        Save team logo image
        
        Args:
            file: Uploaded image file
            team_id: Team ID
            
        Returns:
            str: Path to saved image (relative to upload_dir)
        """
        self.validate_image(file)
        
        file_ext = Path(file.filename).suffix.lower()
        filename = f"team_{team_id}_{uuid.uuid4().hex[:8]}{file_ext}"
        filepath = self.team_dir / filename
        
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        relative_path = f"teams/{filename}"
        print(f"✅ Team logo saved: {relative_path}")
        return relative_path
    
    def save_event_image(self, file: UploadFile, event_id: str) -> str:
        """
        Save event image
        
        Args:
            file: Uploaded image file
            event_id: Event ID
            
        Returns:
            str: Path to saved image (relative to upload_dir)
        """
        self.validate_image(file)
        
        file_ext = Path(file.filename).suffix.lower()
        filename = f"event_{event_id}_{uuid.uuid4().hex[:8]}{file_ext}"
        filepath = self.event_dir / filename
        
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        relative_path = f"events/{filename}"
        print(f"✅ Event image saved: {relative_path}")
        return relative_path
    
    def save_gallery_image(self, file: UploadFile, category: str = "general") -> str:
        """
        Save gallery image
        
        Args:
            file: Uploaded image file
            category: Image category (general, tournament, camp, etc.)
            
        Returns:
            str: Path to saved image (relative to upload_dir)
        """
        self.validate_image(file)
        
        file_ext = Path(file.filename).suffix.lower()
        filename = f"{category}_{uuid.uuid4().hex}{file_ext}"
        filepath = self.gallery_dir / filename
        
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        relative_path = f"gallery/{filename}"
        print(f"✅ Gallery image saved: {relative_path}")
        return relative_path
    
    def delete_image(self, image_path: str) -> bool:
        """
        Delete an image file
        
        Args:
            image_path: Relative path to image (e.g., "profiles/user123.jpg")
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            filepath = self.upload_dir / image_path
            if filepath.exists():
                filepath.unlink()
                print(f"✅ Image deleted: {image_path}")
                return True
            else:
                print(f"⚠️  Image not found: {image_path}")
                return False
        except Exception as e:
            print(f"❌ Failed to delete image: {str(e)}")
            return False
    
    def get_image_url(self, image_path: Optional[str], base_url: str = "") -> Optional[str]:
        """
        Get full URL for an image
        
        Args:
            image_path: Relative path to image
            base_url: Base URL for the application
            
        Returns:
            Optional[str]: Full URL to image or None
        """
        if not image_path:
            return None
        
        return f"{base_url}/uploads/{image_path}"


# Global image service instance
image_service = ImageService()
