# brewernet-web-backend

## How do I get set up?

1. clone code to local environment
   ``` bash
   git clone https://github.com/BrewerNet/bmac-api.git
   cd bmac-api
   ```
2. setup enviroment variables and db (make sure you installed latest docker on your local machine)
   ``` bash
   cp .env.example .env
   docker-compose up -d
   ```
3. setup prisma schema and migration
   ``` bash
   npx prisma migrate dev
   ```
4. run application and have fun
   ``` bash
   npm run dev
   ```

## Exposed api
### Users API

- `POST /api/v1/users` - Create a new user.
- `GET /api/v1/users` - Get all users.
- `GET /api/v1/users/:id` - Get user by ID.
- `PUT /api/v1/users/:id` - Update user by ID.
- `DELETE /api/v1/users/:id` - Delete user by ID.

### Health Check

- `GET /health` - Health check endpoint.

### Install Docker Desktop
https://docs.docker.com/compose/install/
