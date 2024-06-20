#!/bin/bash
set -e

echo "Deployment started ..."

# Pull the latest version of the app
git pull origin deploy
echo "New changes copied to server !"

echo "Installing Dependencies..."
npm install --yes


echo "Building the app..."
npm run dev

echo "Deployment Finished!"