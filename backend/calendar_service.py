"""
Calendar Service for MNASE Basketball League
Handles recurring events, reminders, and calendar management
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import uuid

class CalendarService:
    def __init__(self):
        print("✅ CalendarService initialized")
    
    def generate_recurring_events(
        self,
        base_event: Dict,
        start_date: str,
        end_date: str,
        pattern: str,
        recurrence_days: List[str] = None
    ) -> List[Dict]:
        """
        Generate recurring event instances
        
        Args:
            base_event: Original event data
            start_date: Start date (YYYY-MM-DD)
            end_date: End date for recurrence (YYYY-MM-DD)
            pattern: daily, weekly, monthly
            recurrence_days: For weekly - list of days (e.g., ["monday", "wednesday"])
        """
        events = []
        current_date = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        parent_id = base_event.get('id')
        
        while current_date <= end:
            # Check if we should create an event for this date
            should_create = False
            
            if pattern == "daily":
                should_create = True
            elif pattern == "weekly":
                day_name = current_date.strftime("%A").lower()
                if recurrence_days and day_name in [d.lower() for d in recurrence_days]:
                    should_create = True
            elif pattern == "monthly":
                # Create on the same day of each month
                if current_date.day == datetime.strptime(start_date, "%Y-%m-%d").day:
                    should_create = True
            
            if should_create:
                event_instance = base_event.copy()
                event_instance['id'] = str(uuid.uuid4())
                event_instance['date'] = current_date.strftime("%Y-%m-%d")
                event_instance['parent_event_id'] = parent_id
                event_instance['event_type'] = 'recurring'
                events.append(event_instance)
            
            # Increment date
            if pattern == "daily":
                current_date += timedelta(days=1)
            elif pattern == "weekly":
                current_date += timedelta(days=1)
            elif pattern == "monthly":
                # Move to next month
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
        
        return events
    
    def check_event_conflict(
        self,
        location: str,
        date: str,
        start_time: str,
        end_time: str,
        existing_events: List[Dict],
        exclude_event_id: Optional[str] = None
    ) -> bool:
        """
        Check if an event conflicts with existing events at the same location
        
        Returns True if there's a conflict
        """
        event_start = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %H:%M")
        event_end = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %H:%M")
        
        for existing in existing_events:
            if exclude_event_id and existing.get('id') == exclude_event_id:
                continue
            
            if existing.get('location') != location or existing.get('date') != date:
                continue
            
            # Parse existing event times
            try:
                existing_start = datetime.strptime(
                    f"{existing['date']} {existing['time']}", 
                    "%Y-%m-%d %H:%M"
                )
                existing_end_time = existing.get('end_time', existing['time'])
                existing_end = datetime.strptime(
                    f"{existing['date']} {existing_end_time}", 
                    "%Y-%m-%d %H:%M"
                )
                
                # Check for overlap
                if (event_start < existing_end and event_end > existing_start):
                    return True
                    
            except (ValueError, KeyError):
                continue
        
        return False
    
    def get_upcoming_events(self, events: List[Dict], days_ahead: int = 7) -> List[Dict]:
        """Get events happening in the next N days"""
        today = datetime.now().date()
        future_date = today + timedelta(days=days_ahead)
        
        upcoming = []
        for event in events:
            try:
                event_date = datetime.strptime(event['date'], "%Y-%m-%d").date()
                if today <= event_date <= future_date:
                    upcoming.append(event)
            except (ValueError, KeyError):
                continue
        
        return sorted(upcoming, key=lambda x: x['date'])
    
    def should_send_reminder(self, event: Dict, hours_before: int = 24) -> bool:
        """Check if it's time to send a reminder for an event"""
        if event.get('reminder_sent'):
            return False
        
        try:
            event_datetime = datetime.strptime(
                f"{event['date']} {event['time']}", 
                "%Y-%m-%d %H:%M"
            )
            now = datetime.now()
            time_until_event = event_datetime - now
            
            # Send reminder if event is within the specified hours and we haven't sent one
            if timedelta(hours=0) <= time_until_event <= timedelta(hours=hours_before):
                return True
                
        except (ValueError, KeyError):
            pass
        
        return False
    
    def generate_ical(self, events: List[Dict]) -> str:
        """
        Generate iCal format string for calendar export
        """
        ical_lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//MNASE Basketball League//Calendar//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH"
        ]
        
        for event in events:
            try:
                # Parse date and time
                event_date = event['date'].replace('-', '')
                event_time = event['time'].replace(':', '')
                
                ical_lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{event['id']}",
                    f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
                    f"DTSTART:{event_date}T{event_time}00",
                    f"SUMMARY:{event['title']}",
                    f"DESCRIPTION:{event.get('description', '')}",
                    f"LOCATION:{event.get('location', '')}",
                    "END:VEVENT"
                ])
            except (KeyError, ValueError):
                continue
        
        ical_lines.append("END:VCALENDAR")
        return "\r\n".join(ical_lines)
    
    def filter_events(
        self,
        events: List[Dict],
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        location: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict]:
        """Filter events by various criteria"""
        filtered = events
        
        if category:
            filtered = [e for e in filtered if e.get('category') == category]
        
        if tags:
            filtered = [e for e in filtered if any(tag in e.get('tags', []) for tag in tags)]
        
        if location:
            filtered = [e for e in filtered if location.lower() in e.get('location', '').lower()]
        
        if start_date:
            filtered = [e for e in filtered if e.get('date', '') >= start_date]
        
        if end_date:
            filtered = [e for e in filtered if e.get('date', '') <= end_date]
        
        return filtered

# Initialize service
calendar_service = CalendarService()
