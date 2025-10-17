"""
Search Service for MNASE Basketball League
Provides search and filtering capabilities across all content types
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import re


class SearchService:
    """
    Service for searching and filtering content
    Supports full-text search, date ranges, categories, and more
    """
    
    def __init__(self):
        print("✅ SearchService initialized")
    
    def create_text_search_query(self, search_term: str, fields: List[str]) -> Dict[str, Any]:
        """
        Create a MongoDB query for text search across multiple fields
        
        Args:
            search_term: The search term
            fields: List of field names to search in
            
        Returns:
            MongoDB query dict
        """
        if not search_term:
            return {}
        
        # Create case-insensitive regex pattern
        pattern = re.compile(search_term, re.IGNORECASE)
        
        # Search across all specified fields
        return {
            "$or": [
                {field: {"$regex": pattern}} for field in fields
            ]
        }
    
    def build_event_search_query(
        self,
        search: Optional[str] = None,
        event_type: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        location: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Build search query for events
        
        Args:
            search: Text search term
            event_type: Filter by event type
            date_from: Start date (YYYY-MM-DD)
            date_to: End date (YYYY-MM-DD)
            location: Filter by location
            min_price: Minimum price
            max_price: Maximum price
            
        Returns:
            MongoDB query dict
        """
        query = {}
        conditions = []
        
        # Text search
        if search:
            text_query = self.create_text_search_query(
                search,
                ["title", "description", "location"]
            )
            conditions.append(text_query)
        
        # Event type filter
        if event_type:
            query["type"] = event_type
        
        # Date range filter
        if date_from:
            query["date"] = query.get("date", {})
            query["date"]["$gte"] = date_from
        
        if date_to:
            query["date"] = query.get("date", {})
            query["date"]["$lte"] = date_to
        
        # Location filter
        if location:
            location_pattern = re.compile(location, re.IGNORECASE)
            query["location"] = {"$regex": location_pattern}
        
        # Price range filter
        if min_price is not None:
            query["price"] = query.get("price", {})
            query["price"]["$gte"] = min_price
        
        if max_price is not None:
            query["price"] = query.get("price", {})
            query["price"]["$lte"] = max_price
        
        # Combine conditions
        if conditions:
            if "$and" in query:
                query["$and"].extend(conditions)
            else:
                query["$and"] = conditions
        
        return query
    
    def build_program_search_query(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        age_group: Optional[str] = None,
        skill_level: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Build search query for programs
        
        Args:
            search: Text search term
            category: Program category (camp, clinic, workshop)
            age_group: Age group filter
            skill_level: Skill level filter
            min_price: Minimum price
            max_price: Maximum price
            
        Returns:
            MongoDB query dict
        """
        query = {}
        conditions = []
        
        # Text search
        if search:
            text_query = self.create_text_search_query(
                search,
                ["name", "description", "location"]
            )
            conditions.append(text_query)
        
        # Category filter
        if category:
            query["category"] = category
        
        # Age group filter
        if age_group:
            query["age_group"] = age_group
        
        # Skill level filter
        if skill_level:
            query["skill_level"] = skill_level
        
        # Price range filter
        if min_price is not None:
            query["price"] = query.get("price", {})
            query["price"]["$gte"] = min_price
        
        if max_price is not None:
            query["price"] = query.get("price", {})
            query["price"]["$lte"] = max_price
        
        # Combine conditions
        if conditions:
            if "$and" in query:
                query["$and"].extend(conditions)
            else:
                query["$and"] = conditions
        
        return query
    
    def build_facility_search_query(
        self,
        search: Optional[str] = None,
        facility_type: Optional[str] = None,
        amenities: Optional[List[str]] = None,
        available_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Build search query for facilities
        
        Args:
            search: Text search term
            facility_type: Type of facility
            amenities: List of required amenities
            available_date: Check availability for specific date
            
        Returns:
            MongoDB query dict
        """
        query = {}
        conditions = []
        
        # Text search
        if search:
            text_query = self.create_text_search_query(
                search,
                ["name", "description", "location"]
            )
            conditions.append(text_query)
        
        # Facility type filter
        if facility_type:
            query["type"] = facility_type
        
        # Amenities filter (must have all specified amenities)
        if amenities and len(amenities) > 0:
            query["amenities"] = {"$all": amenities}
        
        # Combine conditions
        if conditions:
            if "$and" in query:
                query["$and"].extend(conditions)
            else:
                query["$and"] = conditions
        
        return query
    
    def build_team_search_query(
        self,
        search: Optional[str] = None,
        division: Optional[str] = None,
        age_group: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Build search query for teams
        
        Args:
            search: Text search term
            division: Division filter
            age_group: Age group filter
            
        Returns:
            MongoDB query dict
        """
        query = {}
        conditions = []
        
        # Text search
        if search:
            text_query = self.create_text_search_query(
                search,
                ["name", "coach_name"]
            )
            conditions.append(text_query)
        
        # Division filter
        if division:
            query["division"] = division
        
        # Age group filter
        if age_group:
            query["age_group"] = age_group
        
        # Combine conditions
        if conditions:
            if "$and" in query:
                query["$and"].extend(conditions)
            else:
                query["$and"] = conditions
        
        return query
    
    def parse_sort_param(self, sort: Optional[str] = None) -> List[tuple]:
        """
        Parse sort parameter into MongoDB sort format
        
        Args:
            sort: Sort string like "date_asc", "price_desc", "name_asc"
            
        Returns:
            List of (field, direction) tuples
        """
        if not sort:
            return [("created_at", -1)]  # Default: newest first
        
        sort_mapping = {
            "date_asc": [("date", 1)],
            "date_desc": [("date", -1)],
            "price_asc": [("price", 1)],
            "price_desc": [("price", -1)],
            "name_asc": [("name", 1)],
            "name_desc": [("name", -1)],
            "title_asc": [("title", 1)],
            "title_desc": [("title", -1)],
            "newest": [("created_at", -1)],
            "oldest": [("created_at", 1)]
        }
        
        return sort_mapping.get(sort, [("created_at", -1)])


# Global search service instance
search_service = SearchService()
