# #!/bin/bash
# set -e

# echo "Deployment started ..."

# # Pull the latest version of the app
# git pull origin main
# echo "New changes copied to server !"

# echo "Installing Dependencies..."
# npm install

# echo "Deployment Finished!"

#!/bin/bash

# Start logging
echo "Starting deployment script..."
echo "Current PATH: $PATH"
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found, installing Node.js and npm..."
    # Install Node.js and npm without sudo
    curl -fsSL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
    bash nodesource_setup.sh
    apt-get install -y nodejs
    if [ $? -ne 0 ]; then
        echo "Failed to install Node.js and npm."
        exit 1
    fi
    echo "Node.js and npm installed successfully."
else
    echo "npm is already installed."
fi

echo "Deployment started ..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "Failed to pull latest changes from git."
    exit 1
fi
echo "New changes copied to server!"

echo "Installing Dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install npm dependencies."
    exit 1
fi
echo "Dependencies installed."

echo "Deployment completed!"

