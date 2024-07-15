#!/bin/bash

# Function to check the exit status of the last command and exit if it failed
check_status() {
  if [ $? -ne 0 ]; then
    echo "Error: $1 failed to complete successfully."
    exit 1
  fi
}

# Step 1: Start Docker Compose
echo "Starting Docker Compose..."
docker-compose up -d
check_status "Docker Compose"

# Step 2: Wait for the database to be ready
echo "Waiting for the database to be ready..."
sleep 2

# Step 3: Setup Prisma schema and migration
echo "Setting up Prisma schema and migration..."
npx prisma migrate dev
check_status "Prisma migrate"

# Step 4: Seed the mock data
echo "Seeding mock data..."
npm run prisma:seed
check_status "Prisma seed"

# Step 5: Run the application
echo "Running the application..."
npm run dev
check_status "npm run dev"

echo "Setup complete! The application is running."
