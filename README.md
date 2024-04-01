# brewernet-web-backend

## How do I get set up?

1. pull the dev branch
2. npm i
3. set .env file
4. npm run dev

## Default port

Port 8080

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

### Install Docker Desktop
https://docs.docker.com/compose/install/
