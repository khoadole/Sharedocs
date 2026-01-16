# Sharedocs Backend API

Node.js backend service for Sharedocs document verification platform using PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager
- Suggest to use postgres with dbeaver

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file (copy from `.env.example`):

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sharedocs_demo
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### 3. Setup Database

Create PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE sharedocs_demo;
\q
```

Run migrations:

```bash
npm run migrate
```

This will create the `users` table with the required schema.

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "walletAddress": "0x742d35Cc...",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

#### Login (Email/Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "walletAddress": "0x742d35Cc...",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

#### Login (Wallet)
```http
POST /api/auth/login/wallet
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

#### Health Check
```http
GET /api/auth/health
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── authController.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   └── userService.js
│   ├── routes/              # API routes
│   │   └── authRoutes.js
│   ├── db/                  # Database config
│   │   ├── config.js
│   │   ├── migrate.js
│   │   └── migrations/
│   │       └── 001_create_users_table.sql
│   ├── middleware/          # Express middleware
│   └── utils/               # Helper functions
├── .env                     # Environment variables
├── .env.example            # Environment template
├── package.json
└── server.js               # Main entry point
```

## 🛠️ Technology Stack

- **Framework:** Express.js
- **Database:** PostgreSQL with pg driver
- **Authentication:** bcrypt for password hashing
- **Environment:** dotenv for configuration
- **CORS:** cors middleware for cross-origin requests

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'USER',
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing API

Using curl:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@sharedocs.app",
    "password": "Demo123!",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "fullName": "Demo User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@sharedocs.app",
    "password": "Demo123!"
  }'
```

Using Postman or Thunder Client:
1. Import the endpoints above
2. Set Content-Type to `application/json`
3. Send requests with JSON body

## 🚨 Troubleshooting

### Database Connection Error
```
❌ Database connection failed
```
**Solutions:**
- Ensure PostgreSQL is running: `pg_ctl status`
- Check DB credentials in `.env`
- Verify database exists: `psql -U postgres -l`
- Check firewall/port 5432

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solutions:**
- Change PORT in `.env` to another port (e.g., 5001)
- Kill process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill -9
  ```

### Migration Fails
```
❌ Migration failed
```
**Solutions:**
- Ensure database is created first
- Check database permissions
- Verify SQL syntax in migration files

## 📦 NPM Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations

## 🔐 Security Notes

⚠️ **Demo Version - Not Production Ready**

This is a simplified demo without JWT tokens. For production:
- Add JWT token generation and validation
- Implement refresh tokens
- Add rate limiting
- Use HTTPS only
- Add input sanitization
- Implement CSRF protection
- Add request validation middleware
- Use environment-specific secrets

## 📄 License

MIT
