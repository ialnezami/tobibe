#!/bin/bash
# Script to seed database after deployment
# This can be called from Vercel's build command or as a post-deploy hook

echo "Checking if database needs seeding..."

# Get the deployment URL from environment or use provided URL
DEPLOY_URL="${VERCEL_URL:-$1}"
if [ -z "$DEPLOY_URL" ]; then
  echo "Error: No deployment URL provided"
  echo "Usage: ./scripts/seed-on-deploy.sh <deployment-url>"
  exit 1
fi

# Add protocol if not present
if [[ ! $DEPLOY_URL =~ ^https?:// ]]; then
  DEPLOY_URL="https://${DEPLOY_URL}"
fi

SEED_ENDPOINT="${DEPLOY_URL}/api/seed"
SECRET_TOKEN="${SEED_SECRET_TOKEN}"

echo "Calling seed endpoint: ${SEED_ENDPOINT}"

# Call the seed API endpoint
if [ -n "$SECRET_TOKEN" ]; then
  RESPONSE=$(curl -s -X POST "${SEED_ENDPOINT}" \
    -H "Authorization: Bearer ${SECRET_TOKEN}" \
    -H "Content-Type: application/json")
else
  RESPONSE=$(curl -s -X POST "${SEED_ENDPOINT}" \
    -H "Content-Type: application/json")
fi

echo "Response: ${RESPONSE}"

# Check if seeding was successful
if echo "$RESPONSE" | grep -q "successfully\|already seeded"; then
  echo "✅ Database seeding completed"
  exit 0
else
  echo "❌ Database seeding failed"
  exit 1
fi

