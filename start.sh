#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run database updates
echo "Running database updates..."
cd lib/ast
pnpm run updateDb:auth
pnpm run updateDb:generate
pnpm run updateDb:billing
cd ../..

# Start the application
echo "Starting the application..."
exec node dist/index.js 