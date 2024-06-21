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

# Install nvm if it's not installed
if ! command -v nvm &> /dev/null
then
    echo "nvm could not be found, installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    echo "nvm installed successfully."
else
    echo "nvm is already installed."
fi

# Load nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node.js and npm using nvm
echo "Installing Node.js and npm..."
nvm install 20
nvm use 20

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

