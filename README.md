# brewernet-web-backend

## How do I get set up?

1. clone code to local environment
   ``` bash
   git clone https://github.com/BrewerNet/bmac-api.git
   cd bmac-api
   ```
2. setup enviroment variables
   ``` bash
   cp .env.example .env
   ```
3. setup prisma schema and migration
   ``` bash
   npx prisma migrate dev
   ```
4. run application and have fun
   ``` bash
   npm run dev
   ```

## Database

Currently we use Postgres to store database locally.

To implement another database, please update the database options

## Exposed api
### Users API

- `POST /api/v1/users` - Create a new user.
- `GET /api/v1/users` - Get all users.
- `GET /api/v1/users/:id` - Get user by ID.
- `PUT /api/v1/users/:id` - Update user by ID.
- `DELETE /api/v1/users/:id` - Delete user by ID.

### Health Check

- `GET /health` - Health check endpoint.

## Docker Compose the Whole App
### Install Docker Desktop
https://docs.docker.com/compose/install/

### Set .env File
1. change DATABASE_URL keyword "localhost" to "db"
2. change username and password to the remote account username and password

###Docker Compose Up
run command `docker compose up`
