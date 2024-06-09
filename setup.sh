#!/bin/bash

# Step 1: Start Docker Compose
echo "Starting Docker Compose..."
docker-compose up -d

# Step 2: Setup Prisma schema and migration
echo "Setting up Prisma schema and migration..."
npx prisma migrate dev

# Step 3: Seed the mock data
echo "Seeding mock data..."
npm run prisma:seed

# Step 4: Run the application
echo "Running the application..."
npm run dev

echo "Setup complete! The application is running."