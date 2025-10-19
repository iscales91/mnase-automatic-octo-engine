"""
Ticket Management Service
Manages event tickets, inventory, and sales
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict
import uuid

class TicketService:
    def __init__(self, db):
        self.db = db
    
    async def create_ticket_type(self, event_id: str, ticket_data: dict):
        """Create a ticket type for an event"""
        ticket_type = {
            "id": str(uuid.uuid4()),
            "event_id": event_id,
            "name": ticket_data["name"],  # e.g., "General Admission", "VIP", "Student"
            "description": ticket_data.get("description", ""),
            "price": ticket_data["price"],
            "quantity_available": ticket_data["quantity_available"],
            "quantity_sold": 0,
            "has_seat_numbers": ticket_data.get("has_seat_numbers", False),
            "seat_numbers": ticket_data.get("seat_numbers", []),  # List of seat numbers for VIP
            "available_seats": ticket_data.get("seat_numbers", []).copy() if ticket_data.get("has_seat_numbers") else [],
            "status": "active",  # active, sold_out, inactive
            "sale_start": ticket_data.get("sale_start"),
            "sale_end": ticket_data.get("sale_end"),
            "max_per_order": ticket_data.get("max_per_order", 10),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await self.db.ticket_types.insert_one(ticket_type)
        # Ensure no ObjectIds are in the returned data
        ticket_type_copy = ticket_type.copy()
        return ticket_type_copy
    
    async def get_ticket_types_by_event(self, event_id: str):
        """Get all ticket types for an event"""
        ticket_types = await self.db.ticket_types.find(
            {"event_id": event_id, "status": {"$ne": "inactive"}}
        ).to_list(length=100)
        
        # Convert ObjectIds to strings
        for ticket_type in ticket_types:
            if "_id" in ticket_type:
                ticket_type["_id"] = str(ticket_type["_id"])
        
        return ticket_types
    
    async def get_ticket_type(self, ticket_type_id: str):
        """Get specific ticket type"""
        return await self.db.ticket_types.find_one({"id": ticket_type_id})
    
    async def update_ticket_inventory(self, ticket_type_id: str, quantity_change: int, seat_numbers: List[str] = None):
        """Update ticket inventory after sale or refund"""
        ticket_type = await self.get_ticket_type(ticket_type_id)
        if not ticket_type:
            raise ValueError("Ticket type not found")
        
        update_data = {
            "$inc": {"quantity_sold": quantity_change},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
        
        # Handle seat numbers for VIP tickets
        if ticket_type["has_seat_numbers"] and seat_numbers:
            if quantity_change > 0:  # Sale - remove from available
                update_data["$pull"] = {"available_seats": {"$in": seat_numbers}}
            else:  # Refund - add back to available
                update_data["$push"] = {"available_seats": {"$each": seat_numbers}}
        
        # Check if sold out
        new_quantity_sold = ticket_type["quantity_sold"] + quantity_change
        if new_quantity_sold >= ticket_type["quantity_available"]:
            update_data["$set"]["status"] = "sold_out"
        elif ticket_type["status"] == "sold_out" and new_quantity_sold < ticket_type["quantity_available"]:
            update_data["$set"]["status"] = "active"
        
        await self.db.ticket_types.update_one(
            {"id": ticket_type_id},
            update_data
        )
    
    async def reserve_seats(self, ticket_type_id: str, seat_numbers: List[str], reservation_id: str):
        """Temporarily reserve seats during checkout"""
        reservation = {
            "id": reservation_id,
            "ticket_type_id": ticket_type_id,
            "seat_numbers": seat_numbers,
            "reserved_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": None,  # Set 10 minutes from now
            "status": "active"  # active, completed, expired
        }
        
        await self.db.seat_reservations.insert_one(reservation)
        
        # Remove from available temporarily
        await self.db.ticket_types.update_one(
            {"id": ticket_type_id},
            {"$pull": {"available_seats": {"$in": seat_numbers}}}
        )
    
    async def complete_reservation(self, reservation_id: str):
        """Mark reservation as completed after successful payment"""
        await self.db.seat_reservations.update_one(
            {"id": reservation_id},
            {"$set": {"status": "completed"}}
        )
    
    async def cancel_reservation(self, reservation_id: str):
        """Cancel reservation and return seats to available"""
        reservation = await self.db.seat_reservations.find_one({"id": reservation_id})
        if reservation and reservation["status"] == "active":
            # Return seats to available
            await self.db.ticket_types.update_one(
                {"id": reservation["ticket_type_id"]},
                {"$push": {"available_seats": {"$each": reservation["seat_numbers"]}}}
            )
            
            await self.db.seat_reservations.update_one(
                {"id": reservation_id},
                {"$set": {"status": "expired"}}
            )
    
    async def get_ticket_by_id(self, ticket_id: str):
        """Get purchased ticket details"""
        return await self.db.tickets.find_one({"id": ticket_id})
    
    async def create_ticket(self, ticket_data: dict):
        """Create a ticket after successful purchase"""
        ticket = {
            "id": str(uuid.uuid4()),
            "sale_id": ticket_data["sale_id"],
            "event_id": ticket_data["event_id"],
            "ticket_type_id": ticket_data["ticket_type_id"],
            "ticket_type_name": ticket_data["ticket_type_name"],
            "buyer_id": ticket_data.get("buyer_id"),
            "buyer_email": ticket_data["buyer_email"],
            "buyer_name": ticket_data["buyer_name"],
            "seat_number": ticket_data.get("seat_number"),
            "price": ticket_data["price"],
            "qr_code": str(uuid.uuid4()),  # Generate QR code data
            "status": "active",  # active, used, refunded, cancelled
            "purchased_at": datetime.now(timezone.utc).isoformat(),
            "used_at": None,
            "refunded_at": None
        }
        
        result = await self.db.tickets.insert_one(ticket)
        return ticket
    
    async def get_tickets_by_user(self, user_id: str):
        """Get all tickets purchased by user"""
        tickets = await self.db.tickets.find(
            {"buyer_id": user_id}
        ).sort("purchased_at", -1).to_list(length=500)
        return tickets
    
    async def get_tickets_by_event(self, event_id: str):
        """Get all tickets for an event (admin)"""
        tickets = await self.db.tickets.find(
            {"event_id": event_id}
        ).sort("purchased_at", -1).to_list(length=10000)
        return tickets
    
    async def validate_ticket(self, ticket_id: str, qr_code: str):
        """Validate ticket at event entry"""
        ticket = await self.db.tickets.find_one({"id": ticket_id, "qr_code": qr_code})
        if not ticket:
            return {"valid": False, "message": "Invalid ticket"}
        
        if ticket["status"] != "active":
            return {"valid": False, "message": f"Ticket status: {ticket['status']}"}
        
        if ticket.get("used_at"):
            return {"valid": False, "message": "Ticket already used"}
        
        # Mark as used
        await self.db.tickets.update_one(
            {"id": ticket_id},
            {
                "$set": {
                    "status": "used",
                    "used_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "valid": True,
            "ticket": ticket,
            "message": "Ticket validated successfully"
        }
    
    async def get_sales_statistics(self, event_id: Optional[str] = None):
        """Get ticket sales statistics"""
        query = {}
        if event_id:
            query["event_id"] = event_id
        
        total_sales = await self.db.ticket_sales.count_documents(query)
        
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total_amount"},
                "total_tickets": {"$sum": "$quantity"},
                "total_commission": {"$sum": "$commission_amount"}
            }}
        ]
        
        result = await self.db.ticket_sales.aggregate(pipeline).to_list(length=1)
        stats = result[0] if result else {
            "total_revenue": 0,
            "total_tickets": 0,
            "total_commission": 0
        }
        
        stats["total_sales"] = total_sales
        return stats
