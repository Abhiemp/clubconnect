# ClubConnect – College Clubs & Events Management Platform

ClubConnect is a web-based college club and event management platform designed to bring students, college clubs, and administrators together in one place.

The platform provides a centralized space where students can explore clubs, discover events, register for activities, and stay updated with announcements. Club administrators can manage their clubs and events, while super administrators oversee the platform.

## Features

### Student
- Explore available college clubs.
- Discover upcoming college events.
- Register for events.
- View relevant announcements and notifications.
- Access personalized event and club recommendations.

### Club Administrator
- Manage club information.
- Create and manage events.
- Manage event registrations.
- Publish club-related announcements.

### Super Administrator
- Manage platform users and roles.
- Oversee clubs and events.
- Access administrative statistics.
- Manage platform activities.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcryptjs |
| API Communication | REST APIs |

## Project Structure

```text
ClubConnect/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── assets/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── server.js
│   └── package.json
│
└── README.md
```

*Note: This is a high-level project structure; individual filenames and folders may vary.*

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd clubconnect
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Replace the placeholder values with your own configuration.

**Important:** Never upload your `.env` file, database credentials, or JWT secrets to GitHub.

### 4. Start the Backend

From the `server` directory:

```bash
npm run dev
```

If your backend does not define a development script, use the start command configured in its `package.json`.

The backend is configured to run on:

```text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

The Vite development server typically runs at:

```text
http://localhost:5173
```

Open this address in your browser to access ClubConnect.

## Database

ClubConnect uses MongoDB Atlas for cloud database storage.

The application uses collections for:

- Users
- Clubs
- Events
- Registrations
- Announcements
- Notifications

Mongoose is used to define database schemas and interact with MongoDB.

## Authentication and Authorization

ClubConnect uses JSON Web Tokens (JWT) for authentication and bcryptjs for password hashing.

The application supports three user roles:

| Role | Access |
|---|---|
| Student | Explore clubs and events, register for activities |
| Club Admin | Manage club activities and events |
| Super Admin | Administrative access and platform management |

Role-based access control helps restrict administrative operations to authorized users.

## API Routes

The backend is organized into REST API route modules.

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/users` | User management |
| `/api/clubs` | Club management |
| `/api/events` | Event management |
| `/api/registrations` | Event registrations |
| `/api/recommendations` | Recommendations |
| `/api/announcements` | Announcements |
| `/api/notifications` | Notifications |
| `/api/admin` | Administrative operations |
| `/api/stats` | Platform statistics |

## Future Enhancements

- Real-time notifications.
- Calendar integration for college events.
- Advanced personalized recommendations.
- Event attendance tracking using QR codes.
- Improved analytics and reporting.
- Mobile-responsive enhancements.

## Purpose

The primary goal of ClubConnect is to simplify college club management and improve student participation in extracurricular activities by providing a unified digital platform.

---

**ClubConnect – Discover. Connect. Participate.**

Developed as an academic project.
