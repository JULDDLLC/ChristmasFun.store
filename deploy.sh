#!/bin/bash

# Christmas Magic Designs - Quick Deploy Script
echo "🎄 Christmas Magic Designs - Deployment Script 🎄"
echo "================================================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null
then
    echo "❌ Netlify CLI is not installed."
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Check if user is logged in to Netlify
echo "🔐 Checking Netlify authentication..."
netlify status &> /dev/null

if [ $? -ne 0 ]; then
    echo "🔑 Please login to Netlify..."
    netlify login
fi

# Deploy to Netlify
echo ""
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "✨ Deployment complete! ✨"
echo ""
echo "📋 Next steps:"
echo "1. Copy your site URL from above"
echo "2. Follow the instructions in DEPLOYMENT.md to connect your domain"
echo "3. Add environment variables in Netlify dashboard"
echo ""
echo "🎅 Happy holidays! 🎄"
