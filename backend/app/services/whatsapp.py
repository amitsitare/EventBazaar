import httpx
import logging
from typing import Optional
from ..config import settings

logger = logging.getLogger(__name__)


class TwilioWhatsAppService:
    """WhatsApp notification service using Twilio WhatsApp API"""
    
    def __init__(self):
        self.enabled = settings.twilio_enabled
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token
        self.from_number = settings.twilio_whatsapp_from
        self.admin_to_number = settings.twilio_admin_whatsapp_to
        
    async def send_booking_notification(
        self, 
        provider_whatsapp: str, 
        customer_name: str, 
        customer_mobile: str, 
        customer_address: str,
        service_name: str, 
        service_price: float,
        event_date: str, 
        quantity: int, 
        duration_hours: Optional[int] = None,
        notes: Optional[str] = None
    ) -> bool:
        """Send WhatsApp notification using Twilio"""
        
        if not self.enabled:
            logger.info("Twilio WhatsApp notifications are disabled")
            return False
            
        if not self.account_sid or not self.auth_token:
            logger.error("Twilio credentials not configured")
            return False
            
        if not provider_whatsapp:
            logger.error("Provider WhatsApp number not provided")
            return False
            
        # Format the message
        message = self._format_booking_message(
            customer_name, customer_mobile, customer_address,
            service_name, service_price, event_date, quantity, duration_hours, notes
        )
        
        # Send using Twilio
        return await self._send_twilio_message(provider_whatsapp, message)

    async def send_admin_booking_notification(
        self,
        customer_name: str,
        customer_email: str,
        customer_mobile: str,
        service_name: str,
        service_price: float,
        event_date: str,
        quantity: int,
        notes: Optional[str] = None,
    ) -> bool:
        """Send WhatsApp notification to a fixed admin number when a booking is created"""

        if not self.enabled:
            logger.info("Twilio WhatsApp notifications are disabled")
            return False

        if not self.account_sid or not self.auth_token:
            logger.error("Twilio credentials not configured")
            return False

        to_number = self.admin_to_number
        if not to_number:
            logger.error("Admin WhatsApp number not configured")
            return False

        message = (
            "📢 *New Booking Received*\n\n"
            f"👤 Customer: {customer_name}\n"
            f"✉️ Email: {customer_email}\n"
            f"📞 Mobile: {customer_mobile}\n\n"
            f"🧾 Service: {service_name}\n"
            f"💰 Price: ₹{service_price:,.2f}\n"
            f"📅 Event Date: {event_date}\n"
            f"🔢 Quantity: {quantity}\n"
        )
        if notes:
            message += f"📝 Notes: {notes}\n"
        message += "\n— EventBazaar"

        return await self._send_twilio_message(to_number, message)
    
    def _format_booking_message(
        self, 
        customer_name: str, 
        customer_mobile: str, 
        customer_address: str,
        service_name: str, 
        service_price: float,
        event_date: str, 
        quantity: int, 
        duration_hours: Optional[int] = None,
        notes: Optional[str] = None
    ) -> str:
        """Format the booking notification message"""
        
        message = f"""🎉 *New Booking Alert!* 🎉

📋 *Booking Details:*
• Service: {service_name}
• Price: ₹{service_price:,.2f}
• Quantity: {quantity}
• Event Date: {event_date}
• Duration: {str(duration_hours) + ' hours' if duration_hours else 'N/A'}

👤 *Customer Information:*
• Name: {customer_name}
• Mobile: {customer_mobile}
• Address: {customer_address}"""

        if notes:
            message += f"\n\n📝 *Additional Notes:*\n{notes}"
            
        message += f"""

🔗 *Next Steps:*
Please contact the customer to confirm the booking and discuss further details.

---
*EventBazaar - Your Event Partner* 💒"""
        
        return message
    
    async def _send_twilio_message(self, to_number: str, message: str) -> bool:
        """Send WhatsApp message using Twilio API"""
        
        # Normalize input: accept 'whatsapp:+<num>', '+<num>' or raw digits
        number_raw = to_number
        if number_raw.lower().startswith('whatsapp:'):
            number_raw = number_raw.split(':', 1)[1]

        number_raw = number_raw.strip()

        # Ensure phone number has country code and leading +
        if not number_raw.startswith('+'):
            if number_raw.startswith('0'):
                number_raw = '+91' + number_raw[1:]
            elif len(number_raw) == 10 and number_raw.isdigit():
                number_raw = '+91' + number_raw
            else:
                number_raw = '+' + number_raw
        
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        
        auth = (self.account_sid, self.auth_token)
        
        data = {
            "From": self.from_number,
            "To": f"whatsapp:{number_raw}",
            "Body": message
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, data=data, auth=auth)
                
                if response.status_code in [200, 201]:
                    logger.info(f"Twilio WhatsApp message sent successfully to {to_number}")
                    return True
                else:
                    logger.error(f"Twilio API error: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to send Twilio WhatsApp message: {str(e)}")
            return False


# Create service instance
twilio_whatsapp_service = TwilioWhatsAppService()


async def send_booking_notification_to_provider(
    provider_whatsapp: str,
    customer_name: str,
    customer_mobile: str,
    customer_address: str,
    service_name: str,
    service_price: float,
    event_date: str,
    quantity: int,
    duration_hours: Optional[int] = None,
    notes: Optional[str] = None
) -> bool:
    """
    Send booking notification to provider using Twilio WhatsApp service
    """
    
    # Use Twilio WhatsApp service
    success = await twilio_whatsapp_service.send_booking_notification(
        provider_whatsapp, customer_name, customer_mobile, customer_address,
        service_name, service_price, event_date, quantity, duration_hours, notes
    )
    
    if not success:
        logger.warning("Twilio WhatsApp service is not properly configured or enabled")
    
    return success


async def send_booking_notification_to_admin(
    customer_name: str,
    customer_email: str,
    customer_mobile: str,
    service_name: str,
    service_price: float,
    event_date: str,
    quantity: int,
    booking_address: Optional[str] = None,
    duration_hours: Optional[int] = None,
    provider_name: Optional[str] = None,
    provider_mobile: Optional[str] = None,
    notes: Optional[str] = None,
) -> bool:
    """
    Send booking notification to a fixed admin WhatsApp number from settings
    """
    # Augment admin message with address, duration and provider details by prefixing to notes
    extra_lines = []
    if booking_address:
        extra_lines.append(f"Address: {booking_address}")
    if duration_hours is not None:
        extra_lines.append(f"Duration: {duration_hours} hours")
    if provider_name:
        extra_lines.append(f"Provider: {provider_name}")
    if provider_mobile:
        extra_lines.append(f"Provider Mobile: {provider_mobile}")
    merged_notes = ("\n".join(extra_lines) + ("\n" + notes if notes else "")) if extra_lines else notes

    success = await twilio_whatsapp_service.send_admin_booking_notification(
        customer_name=customer_name,
        customer_email=customer_email,
        customer_mobile=customer_mobile,
        service_name=service_name,
        service_price=service_price,
        event_date=event_date,
        quantity=quantity,
        notes=merged_notes,
    )
    if not success:
        logger.warning("Admin WhatsApp notification failed or not configured")
    return success
