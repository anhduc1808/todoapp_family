#!/bin/bash
set -e

echo "Starting backend server..."

# Check if Prisma Client exists
if [ ! -d "node_modules/@prisma/client" ]; then
  echo "Prisma Client not found, generating..."
  npm install prisma@5.19.0 @prisma/client@5.19.0 --save-exact
  npx prisma generate
fi

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed, continuing..."

# Start server
echo "Starting Node.js server..."
node src/server.js
