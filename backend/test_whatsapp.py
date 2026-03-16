#!/usr/bin/env python3
"""
Test script for WhatsApp integration
Run this to test WhatsApp notifications without making actual bookings
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.whatsapp import send_booking_notification_to_provider


async def test_whatsapp_notification():
    """Test WhatsApp notification with sample data"""
    
    print("🧪 Testing WhatsApp Integration")
    print("=" * 50)
    
    # Sample booking data
    provider_whatsapp = "+919876543210"  # Replace with actual provider WhatsApp number
    customer_name = "Rajesh Kumar"
    customer_mobile = "+919876543211"
    customer_address = "123 Main Street, Mumbai, Maharashtra 400001"
    service_name = "Wedding Photography"
    service_price = 25000.00
    event_date = "2024-03-15"
    quantity = 1
    notes = "Please arrive 2 hours before the ceremony. We need both indoor and outdoor shots."
    
    print(f"📱 Sending test notification to: {provider_whatsapp}")
    print(f"👤 Customer: {customer_name}")
    print(f"🎯 Service: {service_name}")
    print(f"📅 Date: {event_date}")
    print()
    
    try:
        success = await send_booking_notification_to_provider(
            provider_whatsapp=provider_whatsapp,
            customer_name=customer_name,
            customer_mobile=customer_mobile,
            customer_address=customer_address,
            service_name=service_name,
            service_price=service_price,
            event_date=event_date,
            quantity=quantity,
            notes=notes
        )
        
        if success:
            print("✅ WhatsApp notification sent successfully!")
            print("📲 Check the provider's WhatsApp for the message.")
        else:
            print("❌ Failed to send WhatsApp notification")
            print("🔧 Check your configuration and credentials")
            
    except Exception as e:
        print(f"💥 Error: {str(e)}")
        print("🔧 Make sure your .env file is configured correctly")


async def test_configuration():
    """Test if WhatsApp configuration is properly set up"""
    
    print("🔧 Checking WhatsApp Configuration")
    print("=" * 50)
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        env_path = backend_dir / ".env"
        if env_path.exists():
            load_dotenv(env_path)
            print(f"✅ Loaded .env file from: {env_path}")
        else:
            print(f"⚠️  No .env file found at: {env_path}")
            print("📝 Please create a .env file with your WhatsApp credentials")
    except ImportError:
        print("⚠️  python-dotenv not installed, using system environment variables")
    
    # Check configuration
    twilio_enabled = os.getenv("TWILIO_ENABLED", "false").lower() == "true"
    
    print(f"Twilio WhatsApp enabled: {twilio_enabled}")
    
    if twilio_enabled:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        print(f"Twilio Account SID: {'✅ Set' if account_sid else '❌ Not set'}")
        print(f"Twilio Auth Token: {'✅ Set' if auth_token else '❌ Not set'}")
        
        if not account_sid or not auth_token:
            print("🔧 Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file")
    
    if not twilio_enabled:
        print("⚠️  Twilio WhatsApp service is not enabled")
        print("🔧 Set TWILIO_ENABLED=true in your .env file")
    
    print()


async def main():
    """Main test function"""
    
    print("🚀 EventBazaar WhatsApp Integration Test")
    print("=" * 60)
    print()
    
    # Test configuration first
    await test_configuration()
    
    # Ask user if they want to send a test message
    print("📋 Configuration check complete!")
    print()
    
    response = input("🤔 Do you want to send a test WhatsApp message? (y/n): ").lower().strip()
    
    if response in ['y', 'yes']:
        print()
        await test_whatsapp_notification()
    else:
        print("👋 Test completed. No message sent.")
    
    print()
    print("📚 For setup instructions, check the README.md file")
    print("🔗 Twilio WhatsApp: https://console.twilio.com/")


if __name__ == "__main__":
    asyncio.run(main())
