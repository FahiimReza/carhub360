# CarHub360 - Local Development Setup

A car rental and buying platform built with Node.js, Express, and MySQL.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
- Install MySQL/XAMPP/WAMP
- Create database: `carhub360`
- Run schema: `mysql -u root -p carhub360 < database/schema.sql`

### 3. Environment Setup
- Copy `.env` file and update your database credentials
- Set your JWT secret and email configuration

### 4. Run the Application

**Frontend Only (Current)**
```bash
npm run frontend
# Opens at http://localhost:3000
```

**Full Stack (Future)**
```bash
npm run dev
# API at http://localhost:5000
```

## 📁 Project Structure
```
your-project/
├── index.html          # Main homepage
├── components/         # React components
├── utils/             # Utilities and services
├── routes/            # API routes (Node.js)
├── database/          # SQL schema
├── public/            # Static assets
└── server.js          # Express server
```

## 🔧 Development Workflow

1. **Current**: Frontend runs independently with mock data
2. **Next Step**: Replace `mockDatabase.js` calls with API calls
3. **Backend**: Implement SQL queries in route files

## 📚 For Your Course

This project demonstrates:
- Database design and relationships
- SQL queries (CRUD operations)
- API development with Express.js
- Frontend-backend integration
- User authentication and authorization

Ready for your Database Management System course! 🎓