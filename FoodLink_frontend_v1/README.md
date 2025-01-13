# FoodLink_FrontEnd_v1
FoodLink application is using NextJS for the frontend functionalities

## Getting Started

Follow these steps to set up and run the project locally:

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

### Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/MinhPhamLapTrinh/FoodLink_frontend_v1.git
```
#### Navigate to the project folder
```bash
cd FoodLink_frontend_v1
```
#### Install Dependencies
```bash
npm install
# or
yarn install
```
#### Configure Environment Variables
Create a `.env.local` file in the root of the project and add the necessary environment variables.
```bash
NEXT_PUBLIC_BACKEND_URL=http://your-api-url.com
```

#### Run the application
Start the development server:
```bash
npm run dev
# or
yarn dev
```
### The following information is the project structure
```bash
/foodlink_frontend_v1
├── /public                # Static assets like images, fonts, etc.
│   ├── /images            # Images for the application
│   ├── favicon.ico        # Favicon for the site
├── /src                   # Source code for the app
│   ├── /app               # Next.js application directory
│   │   ├── /auth          # Authentication pages
│   │   │   ├── login.js   # Login page
│   │   │   ├── register.js # Registration page
│   │   ├── /foodbanks     # Foodbank-related pages
│   │   │   ├── index.js   # Food bank search page
│   │   ├── /donor         # donor-related pages
│   │   │   ├── index.js   # donor search page
│   │   ├── /individual    # individual-related pages
│   │   │   ├── index.js   # individual search page
│   │   ├── /volunteer     # volunteer-related pages
│   │   │   ├── index.js   # volunteer search page
│   │   ├── about.js       # About page
│   │   ├── contact.js     # Contact page
│   │   ├── page.js       # Home page
│   │   ├── services.js    # Services page
│   │   └── ...            # Additional pages
│   ├── /components        # Reusable React components
│   │   ├── Navbar.js      # Navigation bar component
│   │   ├── Footer.js      # Footer component
│   │   ├── FoodBankCard.js # Card for displaying food banks
│   │   ├── Map.js         # Interactive map component
│   │   └── ...            # Additional reusable components
│   ├── /layouts           # Layout components
│   │   ├── MainLayout.js  # Main layout with Navbar and Footer
│   │   ├── AdminLayout.js # Layout for admin pages (if needed)
│   │   └── ...            # Other layouts if necessary
│   ├── /hooks             # Custom hooks
│   │   └── useAuth.js     # Hook for authentication
│   ├── /utils             # Utility functions
│   │   ├── api.js         # Functions for API calls
│   │   ├── mapUtils.js    # Utility functions for maps
│   │   └── ...            # Additional utilities
│   ├── /services          # API service integrations
│   │   ├── foodBankService.js # API calls for food bank operations
│   │   ├── authService.js # API calls for authentication
│   │   └── ...            # Other services
│   └── ...                # Additional folders as needed
├── .env.local             # Environment variables
├── .gitignore             # Files and folders to ignore in git
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```