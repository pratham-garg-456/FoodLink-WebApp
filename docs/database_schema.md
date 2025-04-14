# Database Schema

## Overview
This document provides details about the database schema used in the project.

## Collections

### Users
- **Fields**:
  - `id`: ObjectId
  - `name`: String
  - `email`: String
  - `password`: String
  - `role`: String (`admin`, `volunteer`, `donor`, `foodbank`)

### Applications
- **Fields**:
  - `id`: ObjectId
  - `volunteer_id`: ObjectId
  - `foodbank_id`: ObjectId (Optional)
  - `job_id`: ObjectId
  - `category`: String (`Foodbank`, `Event`)
  - `status`: String (`pending`, `approved`, `rejected`)
  - `applied_at`: DateTime

### Appointments
- **Fields**:
  - `id`: ObjectId
  - `individual_id`: String
  - `foodbank_id`: String
  - `start_time`: DateTime
  - `end_time`: DateTime
  - `description`: String (Optional)
  - `status`: String (`scheduled`, `picked`, `cancelled`, `rescheduled`)
  - `product`: List of embedded documents (food items with `food_name` and `quantity`)
  - `created_at`: DateTime (default: current UTC time)
  - `last_updated`: DateTime (default: current UTC time)

### Donations
- **Fields**:
  - `id`: ObjectId
  - `donor_id`: ObjectId
  - `amount`: Float
  - `status`: String (`pending`, `confirmed`, `failed`)
  - `foodbank_id`: ObjectId
  - `created_at`: DateTime
  - `updated_at`: DateTime

### Events
- **Fields**:
  - `id`: ObjectId
  - `foodbank_id`: ObjectId
  - `event_name`: String
  - `description`: String
  - `date`: DateTime
  - `start_time`: DateTime
  - `end_time`: DateTime
  - `location`: String
  - `status`: String (`scheduled`, `ongoing`, `completed`, `cancelled`)
  - `created_at`: DateTime
  - `last_updated`: DateTime

### Event Inventory
- **Fields**:
  - `id`: ObjectId
  - `event_id`: ObjectId
  - `stock`: List of embedded documents (food items with `food_name` and `quantity`)
  - `last_updated`: DateTime

### Food Items
- **Fields**:
  - `id`: ObjectId
  - `food_name`: String
  - `category`: String (`Vegetables`, `Fruits`, `Dairy`, `Meat`, `Canned Goods`, `Grains`, `Beverages`, `Snacks`, `Packed Food`, `Others`)
  - `unit`: String (`kg`, `grams`, `liters`, `ml`, `pcs`, `packs`)
  - `description`: String (Optional)
  - `expiration_date`: DateTime
  - `added_on`: DateTime

### Inventory
- **Fields**:
  - `id`: ObjectId
  - `foodbank_id`: ObjectId
  - `stock`: List of embedded documents (food items with `food_name` and `quantity`)
  - `last_updated`: DateTime

### Jobs
- **Fields**:
  - `id`: ObjectId
  - `foodbank_id`: ObjectId
  - `title`: String
  - `description`: String
  - `location`: String
  - `category`: String
  - `date_posted`: DateTime
  - `deadline`: DateTime
  - `status`: String (`available`, `unavailable`)

### Services
- **Fields**:
  - `id`: ObjectId
  - `title`: String
  - `description`: String

### Volunteer Activities
- **Fields**:
  - `id`: ObjectId
  - `application_id`: ObjectId
  - `date_worked`: DateTime
  - `foodbank_name`: String
  - `category`: String
  - `working_hours`: Embedded document (with `start` and `end` DateTime fields)

### Contacts
- **Fields**:
  - `id`: ObjectId
  - `name`: String
  - `email`: String
  - `phone`: String
  - `subject`: String
  - `message`: String (Optional)