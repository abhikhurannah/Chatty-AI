#!/bin/bash

# 🚀 Quick Deployment Script for Chatty AI
# This script helps you deploy to Vercel and Railway

echo "🚀 Chatty AI Deployment Helper"
echo "================================"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes!"
    echo ""
    echo "Would you like to commit them now? (y/n)"
    read commit_choice
    
    if [[ $commit_choice == "y" ]]; then
        echo "Enter commit message:"
        read commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed!"
    fi
fi

echo ""
echo "Do you want to push to GitHub? (y/n)"
read push_choice

if [[ $push_choice == "y" ]]; then
    git push origin main
    echo "✅ Pushed to GitHub!"
fi

echo ""
echo "================================"
echo "Next Steps:"
echo "================================"
echo ""
echo "1️⃣  BACKEND (Railway):"
echo "   • Go to: https://railway.app/new"
echo "   • Deploy from GitHub repo"
echo "   • Select 'backened' folder"
echo "   • Add environment variables"
echo "   • Copy Railway URL"
echo ""
echo "2️⃣  FRONTEND (Vercel):"
echo "   • Go to: https://vercel.com/new"
echo "   • Import GitHub repo"
echo "   • Root directory: frontened2"
echo "   • Add VITE_API_URL with Railway URL"
echo "   • Deploy!"
echo ""
echo "3️⃣  UPDATE CORS:"
echo "   • Add Vercel URL to backened/src/index.js"
echo "   • Redeploy backend on Railway"
echo ""
echo "📚 Full guide: DEPLOYMENT_GUIDE.md"
echo ""

# Optional: Install Vercel CLI
echo "Would you like to install Vercel CLI for faster deployment? (y/n)"
read vercel_choice

if [[ $vercel_choice == "y" ]]; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
    echo "Run these commands to deploy frontend:"
    echo "  cd frontened2"
    echo "  vercel"
    echo "  vercel --prod"
fi

echo ""
echo "✨ Good luck with deployment! ✨"
