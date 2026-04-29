# MyKhataApp Backend

A comprehensive Node.js/Express backend API for the MyKhataApp - a modern finance and Khata management system.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Technologies](#technologies)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## 🚀 Getting Started

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/QaziMaaz2003/MyKhataAppBackend.git
cd MyKhataAppBackend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

5. Start the development server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── config/
│   ├── env.js              # Environment configuration
│   └── database.js         # Database connection
├── routes/
│   ├── health.js           # Health check routes
│   └── transactions.js     # Transaction routes
├── controllers/
│   ├── healthController.js # Health check logic
│   └── transactionController.js # Transaction logic
├── models/
│   ├── User.js            # User schema
│   └── Transaction.js     # Transaction schema
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── errorHandler.js    # Error handling middleware
├── utils/
│   ├── response.js        # Response utilities
│   ├── errors.js          # Error utilities
│   └── jwt.js             # JWT utilities
├── index.js               # Application entry point
└── ...
```

## 📦 Available Scripts

### `npm run dev`
Starts the development server with nodemon (auto-reload on file changes)

### `npm start`
Starts the production server

### `npm test`
Runs tests in watch mode

### `npm run test:coverage`
Generates test coverage report

### `npm run lint`
Runs ESLint to check code quality

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Transactions
```
GET /api/transactions
POST /api/transactions
GET /api/transactions/:id
PUT /api/transactions/:id
DELETE /api/transactions/:id
```

## 🛠️ Technologies Used

- **Express.js** `^4.18.2` - Web framework
- **MongoDB** - Database (via Mongoose)
- **Mongoose** `^7.0.0` - ODM
- **JWT** `^9.0.0` - Authentication
- **bcryptjs** `^2.4.3` - Password hashing
- **CORS** `^2.8.5` - Cross-origin requests
- **Validator** `^13.9.0` - Data validation
- **Nodemon** - Development tool

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mykhatapp
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
```

## 📝 Code Style

- ESLint for code quality
- EditorConfig for consistency
- 2-space indentation

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

MIT License

## 👤 Author

**QaziMaaz2003** - [GitHub](https://github.com/QaziMaaz2003)

## 📞 Support

For support, email support@mykhatapp.com or open an issue on GitHub.

## 🔐 Security Notes

- Never commit `.env` files with real secrets
- Always use strong JWT secrets in production
- Validate and sanitize all user inputs
- Use HTTPS in production
- Keep dependencies updated
