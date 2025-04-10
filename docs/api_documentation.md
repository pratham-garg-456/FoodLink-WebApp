# API Documentation

## Overview
This document provides details about the API endpoints available in the backend.

## Endpoints

### User Management
- **POST** `/auth/login`
  - **Description**: Logs in a user.
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - **Response**:
    ```json
    {
      "access_token": "<token>",
      "token_type": "bearer"
    }
    ```

- **POST** `/auth/register`
  - **Description**: Registers a new user.
  - **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "user@example.com",
      "password": "password123",
      "role": "volunteer"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<user_id>",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "volunteer"
    }
    ```

### Donations
- **GET** `/donations`
  - **Description**: Retrieves all donations.
  - **Response**:
    ```json
    [
      {
        "id": "<donation_id>",
        "amount": 100,
        "status": "confirmed",
        "donor_id": "<donor_id>",
        "foodbank_id": "<foodbank_id>",
        "created_at": "2025-03-17T17:02:23.857Z"
      }
    ]
    ```

- **POST** `/donations`
  - **Description**: Creates a new donation.
  - **Request Body**:
    ```json
    {
      "donor_id": "<donor_id>",
      "amount": 50,
      "foodbank_id": "<foodbank_id>"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<donation_id>",
      "amount": 50,
      "status": "pending",
      "donor_id": "<donor_id>",
      "foodbank_id": "<foodbank_id>",
      "created_at": "2025-03-17T17:02:23.857Z"
    }
    ```

### Appointments
- **POST** `/appointments`
  - **Description**: Creates a new appointment.
  - **Request Body**:
    ```json
    {
      "individual_id": "<individual_id>",
      "foodbank_id": "<foodbank_id>",
      "start_time": "2025-03-20T10:00:00Z",
      "end_time": "2025-03-20T11:00:00Z",
      "description": "Appointment for food pickup"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<appointment_id>",
      "status": "scheduled",
      "created_at": "2025-03-17T17:02:23.857Z"
    }
    ```

- **GET** `/appointments`
  - **Description**: Retrieves all appointments for a user.
  - **Response**:
    ```json
    [
      {
        "id": "<appointment_id>",
        "individual_id": "<individual_id>",
        "foodbank_id": "<foodbank_id>",
        "start_time": "2025-03-20T10:00:00Z",
        "end_time": "2025-03-20T11:00:00Z",
        "status": "scheduled"
      }
    ]
    ```

### Volunteer Applications
- **POST** `/volunteer/applications`
  - **Description**: Submits a new volunteer application.
  - **Request Body**:
    ```json
    {
      "volunteer_id": "<volunteer_id>",
      "job_id": "<job_id>",
      "foodbank_id": "<foodbank_id>"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<application_id>",
      "status": "pending",
      "created_at": "2025-03-17T17:02:23.857Z"
    }
    ```

- **GET** `/volunteer/applications`
  - **Description**: Retrieves all applications for a volunteer.
  - **Response**:
    ```json
    [
      {
        "id": "<application_id>",
        "volunteer_id": "<volunteer_id>",
        "job_id": "<job_id>",
        "status": "approved",
        "created_at": "2025-03-17T17:02:23.857Z"
      }
    ]
    ```

### Jobs
- **GET** `/jobs`
  - **Description**: Retrieves a list of all available jobs.
  - **Response**:
    ```json
    [
      {
        "id": "<job_id>",
        "title": "Volunteer Coordinator",
        "description": "Coordinate volunteer activities",
        "location": "123 Main St, City",
        "category": "Foodbank",
        "date_posted": "2025-03-15T10:00:00Z",
        "deadline": "2025-03-20T10:00:00Z",
        "status": "available"
      }
    ]
    ```

- **POST** `/jobs`
  - **Description**: Creates a new job posting.
  - **Request Body**:
    ```json
    {
      "foodbank_id": "<foodbank_id>",
      "title": "Volunteer Coordinator",
      "description": "Coordinate volunteer activities",
      "location": "123 Main St, City",
      "category": "Foodbank",
      "deadline": "2025-03-20T10:00:00Z"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<job_id>",
      "title": "Volunteer Coordinator",
      "status": "available",
      "date_posted": "2025-03-15T10:00:00Z"
    }
    ```

### Events
- **GET** `/events`
  - **Description**: Retrieves a list of all events.
  - **Response**:
    ```json
    [
      {
        "id": "<event_id>",
        "event_name": "Food Drive",
        "description": "A community food drive event",
        "date": "2025-03-25T10:00:00Z",
        "start_time": "2025-03-25T10:00:00Z",
        "end_time": "2025-03-25T14:00:00Z",
        "location": "Community Center, City",
        "status": "scheduled"
      }
    ]
    ```

- **POST** `/events`
  - **Description**: Creates a new event.
  - **Request Body**:
    ```json
    {
      "foodbank_id": "<foodbank_id>",
      "event_name": "Food Drive",
      "description": "A community food drive event",
      "date": "2025-03-25T10:00:00Z",
      "start_time": "2025-03-25T10:00:00Z",
      "end_time": "2025-03-25T14:00:00Z",
      "location": "Community Center, City"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<event_id>",
      "event_name": "Food Drive",
      "status": "scheduled",
      "created_at": "2025-03-15T10:00:00Z"
    }
    ```

### Donor

- **POST** `/api/v1/foodlink/donor/donations`
  - **Summary**: Create Donation
  - **Description**: Allow donors to make a monetary donation.
  - **Headers**:
    - `Authorization`: Bearer token
  - **Request Body**:
    ```json
    {
      "amount": 100,
      "foodbank_id": "<foodbank_id>"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<donation_id>",
      "amount": 100,
      "status": "pending",
      "foodbank_id": "<foodbank_id>",
      "created_at": "2025-03-17T17:02:23.857Z"
    }
    ```

- **GET** `/api/v1/foodlink/donor/donations`
  - **Summary**: Get Donations For Donor
  - **Description**: Retrieve all donations made by the donor.
  - **Headers**:
    - `Authorization`: Bearer token
  - **Response**:
    ```json
    [
      {
        "id": "<donation_id>",
        "amount": 100,
        "status": "confirmed",
        "foodbank_id": "<foodbank_id>",
        "created_at": "2025-03-17T17:02:23.857Z"
      }
    ]
    ```

- **PUT** `/api/v1/foodlink/donor/metadata`
  - **Summary**: Update Donor Metadata
  - **Description**: Allow donors to update their profile information, such as image URL, description, and phone number.
  - **Headers**:
    - `Authorization`: Bearer token
  - **Request Body**:
    ```json
    {
      "image_url": "https://example.com/image.jpg",
      "description": "Regular donor",
      "phone_number": "123-456-7890"
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Donor metadata updated successfully."
    }
    ```

### Miscellaneous

- **GET** `/api/v1/foodlink/misc/services`
  - **Summary**: Retrieve A List Of Services
  - **Description**: Allow FoodLink admin to get the list of services in the database.
  - **Response**:
    ```json
    [
      {
        "id": "<service_id>",
        "title": "Food Distribution",
        "description": "Providing food to those in need."
      }
    ]
    ```

- **POST** `/api/v1/foodlink/misc/services`
  - **Summary**: Add Available Services
  - **Description**: Allow FoodLink admin to add available services of the app.
  - **Request Body**:
    ```json
    {
      "title": "Food Distribution",
      "description": "Providing food to those in need."
    }
    ```
  - **Response**:
    ```json
    {
      "id": "<service_id>",
      "title": "Food Distribution",
      "description": "Providing food to those in need."
    }
    ```

- **POST** `/api/v1/foodlink/misc/contact`
  - **Summary**: Submit Question
  - **Description**: Allow users to submit a question to FoodLink.
  - **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "user@example.com",
      "subject": "Question about services",
      "message": "Can you provide more details about food distribution?"
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Your question has been submitted."
    }
    ```

- **GET** `/api/v1/foodlink/misc/users`
  - **Summary**: Retrieve List Of Users
  - **Description**: Allow retrieval of the list of users in the database.
  - **Response**:
    ```json
    [
      {
        "id": "<user_id>",
        "name": "John Doe",
        "email": "user@example.com",
        "role": "volunteer"
      }
    ]
    ```

