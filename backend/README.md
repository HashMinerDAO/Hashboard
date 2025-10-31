# Hashboard Backend API

Node.js/Express backend for the Hashboard investment platform.

## Features

- **User Authentication**: JWT-based registration and login
- **Database Integration**: PostgreSQL with connection pooling
- **Security**: Helmet, CORS, rate limiting, input validation
- **Investment Platform**: Deposits, investments, withdrawals, ROI tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit

## Setup

### Prerequisites

- Node.js v18+
- PostgreSQL v12+
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hashboard_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up PostgreSQL database**
   - Create a PostgreSQL database named `hashboard_db`
   - Update the database credentials in `.env`

5. **Initialize database schema**
   ```bash
   npm run init-db
   ```

6. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "walletAddress": "0x..." // optional
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Deposits

#### Get User Deposits
```http
GET /api/deposits
Authorization: Bearer <jwt_token>
```

#### Create Deposit
```http
POST /api/deposits
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 0.5,
  "currency": "BTC",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

#### Confirm Deposit
```http
PUT /api/deposits/:id/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "confirmed",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

### Investments

#### Get User Investments
```http
GET /api/investments
Authorization: Bearer <jwt_token>
```

#### Create Investment
```http
POST /api/investments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 0.1,
  "currency": "ETH"
}
```

#### Get Investment Details
```http
GET /api/investments/:id
Authorization: Bearer <jwt_token>
```

#### Update Investment ROI
```http
PUT /api/investments/:id/update-roi
Authorization: Bearer <jwt_token>
```

### Withdrawals

#### Get User Withdrawals
```http
GET /api/withdrawals
Authorization: Bearer <jwt_token>
```

#### Create Withdrawal
```http
POST /api/withdrawals
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 0.05,
  "currency": "BTC",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

#### Process Withdrawal
```http
PUT /api/withdrawals/:id/process
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "completed",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

#### Get Withdrawal Details
```http
GET /api/withdrawals/:id
Authorization: Bearer <jwt_token>
```

#### Cancel Withdrawal
```http
DELETE /api/withdrawals/:id
Authorization: Bearer <jwt_token>
```

### Health Check
```http
GET /api/health
```

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) UNIQUE
- `password_hash`: VARCHAR(255)
- `balance`: DECIMAL(18,8)
- `total_invested`: DECIMAL(18,8)
- `total_roi`: DECIMAL(18,8)
- `wallet_address`: VARCHAR(42)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Deposits Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `amount`: DECIMAL(18,8)
- `currency`: VARCHAR(10)
- `wallet_address`: VARCHAR(42)
- `tx_hash`: VARCHAR(66)
- `status`: VARCHAR(20)
- `confirmed_at`: TIMESTAMP
- `created_at`: TIMESTAMP

### Investments Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `amount`: DECIMAL(18,8)
- `currency`: VARCHAR(10)
- `roi_rate`: DECIMAL(5,2)
- `mining_hashrate`: DECIMAL(18,2)
- `start_date`: TIMESTAMP
- `last_roi_update`: TIMESTAMP
- `status`: VARCHAR(20)

### Investment ROI History Table
- `id`: UUID (Primary Key)
- `investment_id`: UUID (Foreign Key)
- `roi_amount`: DECIMAL(18,8)
- `mining_performance`: DECIMAL(18,2)
- `recorded_at`: TIMESTAMP

### Withdrawals Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `amount`: DECIMAL(18,8)
- `currency`: VARCHAR(10)
- `wallet_address`: VARCHAR(42)
- `status`: VARCHAR(20)
- `processed_at`: TIMESTAMP
- `tx_hash`: VARCHAR(66)
- `created_at`: TIMESTAMP

## Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run init-db`: Initialize database schema
- `npm test`: Run tests (when implemented)

## Development

### Project Structure
```
backend/
├── middleware/          # Authentication middleware
├── routes/             # API route handlers
├── db.js               # Database configuration
├── init-db.js          # Database initialization
├── server.js           # Main server file
├── .env.example        # Environment variables template
└── README.md           # This file
```

### Adding New Routes

1. Create a new route file in `routes/` directory
2. Import and mount it in `server.js`
3. Use authentication middleware where needed

### Database Migrations

For schema changes, update `init-db.js` and run:
```bash
npm run init-db
```

## Security

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers

## Error Handling

- Consistent error response format
- Detailed logging in development
- User-friendly messages in production
- Proper HTTP status codes

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages
