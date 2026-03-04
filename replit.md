# LRR System - Store Management POS

A full-stack Point of Sale (POS) / store management system with an Arabic-language interface.

## Architecture

- **Frontend**: React (Create React App), running on port 5000
- **Backend**: Node.js + Express, running on port 3001
- **Database**: MongoDB (local instance), running on port 27017

## Project Structure

```
/
├── frontend/           # React frontend app
│   ├── src/
│   │   ├── api.js      # Axios API client (points to localhost:3001)
│   │   ├── pages/      # Page components
│   │   ├── components/ # Shared components
│   │   ├── auth/       # Auth-related components
│   │   ├── layout/     # Layout components
│   │   └── i18n/       # Internationalization files
│   └── package.json
├── backend/            # Express API server
│   ├── server.js       # Main server entry point
│   ├── models/         # Mongoose models (lowercase directory)
│   ├── Models/         # Original uppercase directory (kept for reference)
│   ├── routes/         # API route handlers
│   ├── middleware/     # Auth/role/upload middleware
│   ├── config/         # DB config
│   └── utils/          # Utilities
├── data/db/            # MongoDB data directory
├── start-backend.sh    # Backend startup script (MongoDB + Node.js)
└── replit.md
```

## Workflows

- **Start application** - Frontend React app on port 5000 (webview)
- **Backend** - MongoDB + Node.js API server on port 3001 (console)

## Default Credentials

- Username: `admin`
- Password: `123456`

## Key Features

- Sales management (POS cashier)
- Inventory tracking
- Product management with image upload
- Employee management
- Dashboard with analytics
- Reports
- Returns management
- Cashier session management
- Barcode scanning support (via @zxing)
- Arabic language interface (RTL)

## Deployment to Render

This project is prepared for deployment to Render using the `render.yaml` file.

1. Connect your GitHub repository to Render.
2. Render will automatically detect the `render.yaml` file.
3. It will provision:
   - A Managed PostgreSQL or MongoDB (Note: Update `render.yaml` if using a specific MongoDB provider like MongoDB Atlas, as Render's native database is PostgreSQL. The current `render.yaml` assumes a connection string environment variable).
   - A Web Service for the Node.js backend.
   - A Static Site for the React frontend.

### Important:
- The backend listens on port 3001.
- The frontend `REACT_APP_API_URL` is automatically linked to the backend service.
- Make sure to update the `MONGODB_URI` in Render's dashboard if using MongoDB Atlas.
