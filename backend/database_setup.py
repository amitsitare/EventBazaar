#!/usr/bin/env python3
"""
EventBazaar Database Setup
This script creates the database tables and inserts sample data
"""

import os
import sys
from pathlib import Path

import psycopg
from psycopg import sql

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    # Load .env file from the backend directory
    backend_dir = Path(__file__).parent
    env_path = backend_dir / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded environment from: {env_path}")
    else:
        print(f"No .env file found at: {env_path}")
        print("Using system environment variables only")
except ImportError:
    print("python-dotenv not installed. Using system environment variables only.")
    print("To use .env files, install: pip install python-dotenv")


def get_db_config():
    """Get database configuration from environment variables"""
    return {
        'host': os.getenv("DB_HOST", "localhost"),
        'port': int(os.getenv("DB_PORT", "5432")),
        'dbname': os.getenv("DB_NAME", "shaadisphere"),  # psycopg expects 'dbname' not 'database'
        'user': os.getenv("DB_USER", "postgres"),
        'password': os.getenv("DB_PASSWORD", "your_password_here")
    }


def create_tables(conn):
    """Create all required tables"""
    print("Creating tables...")
    
    # Users table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mobile TEXT NOT NULL,
            whatsapp_number TEXT,
            address TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('provider','customer')),
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    
    # Services table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY,
            provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            price NUMERIC(12,2) NOT NULL,
            photo_url TEXT,
            location TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    
    # Bookings table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            event_date DATE NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            notes TEXT,
            address TEXT,
            duration_hours INTEGER,
            status TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled')) DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    
    # Create indexes for better performance
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_services_name ON services USING GIN (to_tsvector('english', name));
    """)
    
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_services_location ON services (location);
    """)
    
    # Add whatsapp_number column if it doesn't exist (for existing databases)
    try:
        conn.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
        """)
        print("Added whatsapp_number column to users table")
    except Exception as e:
        print(f"Note: whatsapp_number column may already exist: {e}")

    # Add new booking columns if they don't exist (for existing databases)
    try:
        conn.execute("""
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address TEXT;
        """)
        conn.execute("""
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_hours INTEGER;
        """)
        print("Ensured bookings.address and bookings.duration_hours columns exist")
    except Exception as e:
        print(f"Note: bookings columns may already exist: {e}")
    
    print("Tables created successfully!")


def insert_sample_data(conn):
    """Insert sample data for testing"""
    print("Inserting sample data...")
    
    # Sample users (password hash is 'password123' hashed with bcrypt)
    sample_users = [
        {
            'name': 'Rajesh Catering Services',
            'email': 'rajesh@catering.com',
            'mobile': '9876543210',
            'whatsapp_number': '+919876543210',
            'address': '123 Food Street, Mumbai',
            'role': 'provider',
            'password_hash': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO'  # password123
        },
        {
            'name': 'Priya Tent House',
            'email': 'priya@tent.com',
            'mobile': '9876543211',
            'whatsapp_number': '+919876543211',
            'address': '456 Tent Road, Delhi',
            'role': 'provider',
            'password_hash': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO'  # password123
        },
        {
            'name': 'Amit Band Baja',
            'email': 'amit@bandbaja.com',
            'mobile': '9876543212',
            'whatsapp_number': '+919876543212',
            'address': '789 Music Lane, Bangalore',
            'role': 'provider',
            'password_hash': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO'  # password123
        },
        {
            'name': 'Customer One',
            'email': 'customer1@email.com',
            'mobile': '9876543213',
            'whatsapp_number': '+919876543213',
            'address': '321 Customer Street, Pune',
            'role': 'customer',
            'password_hash': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO'  # password123
        },
        {
            'name': 'Customer Two',
            'email': 'customer2@email.com',
            'mobile': '9876543214',
            'whatsapp_number': '+919876543214',
            'address': '654 Customer Avenue, Chennai',
            'role': 'customer',
            'password_hash': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO'  # password123
        }
    ]
    
    # Insert users
    for user in sample_users:
        conn.execute("""
            INSERT INTO users (name, email, mobile, whatsapp_number, address, role, password_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, (user['name'], user['email'], user['mobile'], user['whatsapp_number'], user['address'], user['role'], user['password_hash']))
    
    # Sample services
    sample_services = [
        {
            'provider_id': 1,  # Rajesh Catering
            'name': 'Wedding Catering Package',
            'description': 'Complete wedding catering with starters, main course, and desserts. Serves 100 people.',
            'price': 1.00,
            'photo_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
            'location': 'Mumbai'
        },
        {
            'provider_id': 1,  # Rajesh Catering
            'name': 'Reception Dinner',
            'description': 'Elegant reception dinner with continental cuisine. Serves 50 people.',
            'price': 1.00,
            'photo_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
            'location': 'Pune'
        },
        {
            'provider_id': 2,  # Priya Tent House
            'name': 'Wedding Tent Setup',
            'description': 'Beautiful decorated tent for outdoor wedding ceremonies. Size: 40x60 feet.',
            'price': 1.00,
            'photo_url': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
            'location': 'Delhi'
        },
        {
            'provider_id': 2,  # Priya Tent House
            'name': 'Reception Tent',
            'description': 'Elegant reception tent with lighting and decoration. Size: 50x80 feet.',
            'price': 1.00,
            'photo_url': 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=400',
            'location': 'Noida'
        },
        {
            'provider_id': 3,  # Amit Band Baja
            'name': 'Traditional Band Baja',
            'description': 'Traditional Indian wedding music with dhol, shehnai, and other instruments.',
            'price': 1.00,
            'photo_url': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
            'location': 'Bangalore'
        },
        {
            'provider_id': 3,  # Amit Band Baja
            'name': 'Modern DJ Package',
            'description': 'Modern wedding DJ with sound system, lighting, and music selection.',
            'price': 1.00,
            'photo_url': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
            'location': 'Hyderabad'
        }
    ]
    
    # Delete existing sample services to avoid duplicates
    # Delete services from sample providers (IDs 1, 2, 3)
    conn.execute("""
        DELETE FROM services 
        WHERE provider_id IN (1, 2, 3)
    """)
    print("Cleared existing sample services")
    
    # Insert services
    for service in sample_services:
        conn.execute("""
            INSERT INTO services (provider_id, name, description, price, photo_url, location)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (service['provider_id'], service['name'], service['description'], service['price'], service['photo_url'], service['location']))
    
    # Sample bookings
    sample_bookings = [
        {
            'service_id': 1,  # Wedding Catering Package
            'customer_id': 4,  # Customer One
            'event_date': '2024-12-15',
            'quantity': 1,
            'notes': 'Please include vegetarian options',
            'status': 'confirmed'
        },
        {
            'service_id': 3,  # Wedding Tent Setup
            'customer_id': 5,  # Customer Two
            'event_date': '2024-12-20',
            'quantity': 1,
            'notes': 'Need early morning setup',
            'status': 'pending'
        }
    ]
    
    # Insert bookings
    for booking in sample_bookings:
        conn.execute("""
            INSERT INTO bookings (service_id, customer_id, event_date, quantity, notes, address, duration_hours, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            booking['service_id'], booking['customer_id'], booking['event_date'], booking['quantity'], booking['notes'],
            booking.get('address'), booking.get('duration_hours'), booking['status']
        ))
    
    print("Sample data inserted successfully!")


def normalize_prices(conn):
    """Force all existing services to have price = 1.00 as requested"""
    conn.execute("UPDATE services SET price = 1.00;")
    print("All service prices normalized to ₹1.00")


def main():
    """Main function to setup database"""
    config = get_db_config()
    
    print("EventBazaar Database Setup")
    print("=" * 40)
    print(f"Host: {config['host']}")
    print(f"Port: {config['port']}")
    print(f"Database: {config['dbname']}")
    print(f"User: {config['user']}")
    print(f"Password: {'*' * len(config['password']) if config['password'] != 'your_password_here' else 'NOT SET'}")
    
    if config['password'] == 'your_password_here':
        print("\nERROR: Please set DB_PASSWORD in your .env file!")
        return 1
    
    try:
        # Connect to database
        print(f"\nConnecting to database...")
        with psycopg.connect(**config) as conn:
            print("Connected successfully!")
            
            # Create tables
            create_tables(conn)
            
            # Insert sample data
            insert_sample_data(conn)

            # Normalize all prices to ₹1.00
            normalize_prices(conn)
            
            # Commit changes
            conn.commit()
            
            print("\n✅ Database setup completed successfully!")
            print("\nSample login credentials:")
            print("Provider: rajesh@catering.com / password123")
            print("Provider: priya@tent.com / password123")
            print("Provider: amit@bandbaja.com / password123")
            print("Customer: customer1@email.com / password123")
            print("Customer: customer2@email.com / password123")
            
            return 0
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
