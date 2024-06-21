#!/bin/bash
set -e

echo "Environment Variables:"
env

echo "Deployment started ..."

# Pull the latest version of the app
git pull
echo "New changes copied to server !"

echo "Installing Dependencies..."
npm update
npm install 

echo "Deployment Finished!"