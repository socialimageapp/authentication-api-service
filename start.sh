#!/bin/bash

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