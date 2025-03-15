# Krist E-Commerce Shop (Backend)

This project is the backend API for Krist E-Commerce Shop, built using **NestJS, TypeScript, and PostgreSQL**.

![E-Commerce Backend Preview](public/e-commerce.png)

## 🚀 Technologies Used
- **NestJS**: Modular and scalable framework for building APIs.
- **TypeScript**: Strongly typed language for better maintainability.
- **PostgreSQL & TypeORM**: Relational database management.
- **Zod**: Validates API request payloads.
- **jsonwebtoken & bcrypt**: Secure authentication and password hashing.
- **Swagger**: API documentation.

## 📁 Project Structure
📦 project-root 
├── 📂 src                # Main application source code 
│ ├── 📂 modules          # Feature modules (products, users, orders, etc.) 
│ ├── 📂 controllers      # Route handlers 
│ ├── 📂 services         # Business logic 
│ ├── 📂 entities         # TypeORM entity models 
│ ├── 📂 middleware       # Custom middleware 
│ ├── 📂 common           # Shared utilities and decorators 
│ ├── 📂 config           # Configuration files 
│ └── 📜 main.ts          # Application entry point 
├── 📂 public             # Static assets 
├── 📂 tests              # Unit and integration tests
└── 📜 README.md          # Project documentation

## 🔧 Features

### API & Performance Optimization
- RESTful API design with proper status codes.
- Efficient database queries using TypeORM.
- Caching with Redis (optional for performance boost).

### Authentication & Security
- JWT-based authentication.
- Password hashing with bcrypt.
- Secure API routes with middleware.
- Input validation using Zod.

### E-commerce Features
- Product management (CRUD operations).
- User authentication and authorization.
- Cart & order processing with payment integration (Stripe/PayPal).
- Admin panel API for managing products, orders, and users.

## 🛠️ Getting Started

### Installation
```bash
git clone https://github.com/abdulakhatov-tech/krist-ecommerce-backend.git
cd krist-ecommerce-backend
npm install
```

#### Running the Project
```
npm run dev
```
Then open `http://localhost:8000/api` to access the API.

### Environment Variables
Create a `.env` file in the project root with the following:
```
PORT=3000
DATABASE_HOST=your_postgresql_host
DATABASE_PORT=your_postgresql_port
DATABASE_USER=your_postgresql_user
DATABASE_PASSWORD=your_postgresql_password
DATABASE_NAME=your_postgresql_database
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### API Documentation
API documentation is available via Postman or Swagger (if integrated).