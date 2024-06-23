#!/bin/bash
set -e

echo "Deployment started ..."

echo "Pulliing The Latest code From Repo"

git pull origin main

echo "New changes copied to server !"

echo "Installing Dependencies..."
npm install --yes

echo "Reloading the app for Changes"
pm2 reload js-backend


echo "Deployment Finished!"
