#!/bin/bash
set -e

echo "Deployment started ..."

# Pull the latest version of the app
git pull origin deploy
echo "New changes copied to server !"


echo "Check Node Js."
npm -v

echo "Installing Dependencies..."
npm install --yes


echo "Building the app..."
pm2 reload js-backend

echo "Deployment Finished........!"
