# #!/bin/bash
# set -e

# echo "Deployment started ..."

# # Pull the latest version of the app
# git pull origin main
# echo "New changes copied to server !"

# echo "Installing Dependencies..."
# npm install --yes

# echo "Deployment Finished!"



#!/bin/bash

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found, installing Node.js and npm..."
    # Install Node.js and npm
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Deployment started ..."
git pull origin main
echo "New changes copied to server!"
echo "Installing Dependencies..."
npm install

echo "Deployment completed!"
