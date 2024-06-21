# #!/bin/bash
# set -e

# echo "Deployment started ..."

# # Pull the latest version of the app
# git pull origin deploy
# echo "New changes copied to server !"


# echo "Check Node Js."
# npm -v

# echo "Installing Dependencies..."
# npm install --yes


# echo "Building the app..."
# pm2 reload js-backend

# echo "Deployment Finished........!"


#!/bin/bash

echo "Navigating to directory..."
cd /home/youruser/htdocs/www.testing.harshadkajale.online || exit

echo "Cleaning the directory..."
git reset --hard
git clean -fd

echo "Pulling the latest changes..."
git pull origin deploy

echo "Restarting the web server..."
pm2 reload js-backend

echo "Deployment complete!"
