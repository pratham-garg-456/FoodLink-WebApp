# Team-08 PRJ666 Winter 2025

Welcome to the Team-08 PRJ666 Winter 2025 project repository. This repository contains all the necessary files and documentation for the FoodLink application.

## Documentation
All project-related documentation is now located in the `docs/` directory. You can find the following files there:

- [API Documentation](https://www.postman.com/lunar-shadow-698017/foodlink-backend-v2/overview)
- [System Architecture](docs/system_architecture.md)
- [Database Schema](docs/database_schema.md)

## How to View Documentation on GitHub
To view the documentation on GitHub:
1. Navigate to the repository's main page.
2. Open the `docs/` folder.
3. Click on any file to view its content directly in the browser.

## Project Overview
This repository contains the source code and documentation for the Team-08 PRJ666 Winter 2025 project. The system includes a frontend and backend designed to manage food bank operations, donations, and volunteer activities.

## Project Structure

### Backend

The backend is built using FastAPI and is located in the foodlink_backend_v1 directory. It handles the server-side logic, database interactions, and API endpoints.

- Main entry point: main.py
- Database configuration: app/db.py
- Routes: app/routes/
- Models: app/models/
- Services: app/services/

### Frontend

The frontend is built using Next.js and is located in the foodlink_frontend_v2 directory. It handles the client-side logic and user interface.

- Main entry point: \_app.js
- Pages: src/pages/
- Components: src/components/
- Styles: src/styles/


## Installation Instructions

### Prerequisites
- Node.js (for the frontend)
- Python 3.9+ (for the backend)
- MongoDB (for the database)

### Steps to Set Up Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/pratham-garg-456/Team-08-PRJ666-Winter-2025.git
   cd Team-08-PRJ666-Winter-2025
   ```

2. Set up the backend:
   ```bash
   cd foodlink_backend_v1
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```

3. Set up the frontend:
   ```bash
   cd ../foodlink_frontend_v2
   npm install
   npm run dev
   ```

4. Access the system:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

## Deployment Instructions

### Public Server Deployment
1. Deploy the backend to a service like Render, AWS, or Heroku.
2. Deploy the frontend to a service like Vercel or Netlify.
3. Set environment variables for both the frontend and backend as required.

### Test Account Credentials
- **Admin**:
  - Username: `foodbank@gmail.com`
  - Password: `12345`
- **Volunteer**:
  - Username: `volunteer@gmail.com`
  - Password: `12345`
- **Donor**:
  - Username: `donor@gmail.com`
  - Password: `12345`
- **Individual**:
  - Username: `individual@gmail.com`
  - Password: `12345`

## Deviations from PRJ566
See `deviations.md` for a list of changes from the original proposal.
