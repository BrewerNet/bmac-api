# BrewerNet API Server

## Table of Contents
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [Auth API](#auth-api)
  - [User API](#user-api)
  - [Health Check](#health-check)

## Setup
1. Clone code to local environment
   ``` bash
   git clone https://github.com/BrewerNet/bmac-api.git
   cd bmac-api
   ```
2. Setup environment variables and db (make sure you installed latest docker on your local machine)
   ``` bash
   cp .env.example .env
   docker-compose up -d
   ```
3. Setup prisma schema and migration
   ``` bash
   npx prisma migrate dev
   ```
3. Setup prisma schema and migration
   ``` bash
   npm run prisma:seed
   ```
4. Run application and have fun
   ``` bash
   npm run dev
   ```
> If you want to remove the existing data in the docker, you might want to run:
   ``` bash
   npm run primsa:remove
   ```
> Install docker desktop from [here](https://docs.docker.com/compose/install/) 

## API Endpoints
### Auth API
- `POST /api/v1/login` - login to app.
- `POST /api/v1/sign-up` - Create a new user.
- `GET /api/v1/verify/:token` - Verify user email.
- `POST /api/v1/users/resend-verification` - Request verification emil.

### User API
- `GET /api/v1/users` - Get all users.
- `GET /api/v1/users/:id` - Get user by ID.
- `PUT /api/v1/users/:id` - Update user by ID.
- `DELETE /api/v1/users/:id` - Delete user by ID.

### Health Check
- `GET /health` - Health check endpoint.

