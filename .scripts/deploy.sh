#!/bin/bash

# Start logging
echo "Starting deployment script..."

# Debugging information
echo "Current user: $(whoami)"
echo "Current PATH: $PATH"
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Check if Node.js and npm are installed
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

if [ -z "$NODE_PATH" ]; then
    echo "Node.js could not be found, please install it."
    exit 1
fi

if [ -z "$NPM_PATH" ]; then
    echo "npm could not be found, please install it."
    exit 1
fi

echo "Node.js path: $NODE_PATH"
echo "npm path: $NPM_PATH"

# Add Node.js and npm to PATH
export PATH=$PATH:$(dirname $NODE_PATH)
export PATH=$PATH:$(dirname $NPM_PATH)

# Debugging information after setting PATH
echo "Updated PATH: $PATH"

# Start deployment
echo "Deployment started ..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "Failed to pull latest changes from git."
    exit 1
fi
echo "New changes copied to server!"

echo "Installing Dependencies..."
$NPM_PATH install
if [ $? -ne 0 ]; then
    echo "Failed to install npm dependencies."
    exit 1
fi
echo "Dependencies installed."

echo "Deployment completed!"