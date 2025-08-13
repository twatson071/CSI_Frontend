#!/bin/bash

# Azure App Service Free Tier Deployment Script for CSI Application
# This script deploys the application to Azure App Service F1 (free tier)

set -e

echo "========================================="
echo "CSI Application Azure Free Tier Deployment"
echo "========================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Configuration
RESOURCE_GROUP="csi-demo-rg"
LOCATION="eastus"  # Change to your preferred region
APP_NAME="csi-demo-$(date +%s)"  # Unique name with timestamp
PLAN_NAME="csi-demo-plan"
REGISTRY_NAME="csidemoregistry$(date +%s)"

echo "📋 Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location: $LOCATION"
echo "   App Name: $APP_NAME"
echo "   Plan: $PLAN_NAME (F1 Free Tier)"
echo ""

# Login to Azure
echo "🔐 Logging into Azure..."
az login

# Create resource group
echo "📁 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# Create App Service plan (Free tier)
echo "📝 Creating App Service plan (Free tier)..."
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku F1 \
    --is-linux

# Create container registry (Basic tier - lowest cost)
echo "🐳 Creating container registry..."
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $REGISTRY_NAME \
    --sku Basic \
    --admin-enabled true

# Get registry credentials
REGISTRY_USERNAME=$(az acr credential show \
    --name $REGISTRY_NAME \
    --query username \
    --output tsv)

REGISTRY_PASSWORD=$(az acr credential show \
    --name $REGISTRY_NAME \
    --query passwords[0].value \
    --output tsv)

REGISTRY_URL="$REGISTRY_NAME.azurecr.io"

# Build and push Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.demo -t $REGISTRY_URL/csi-demo:latest .

echo "📤 Pushing image to registry..."
az acr login --name $REGISTRY_NAME
docker push $REGISTRY_URL/csi-demo:latest

# Create Web App
echo "🌐 Creating Web App..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --name $APP_NAME \
    --deployment-container-image-name $REGISTRY_URL/csi-demo:latest

# Configure Web App
echo "⚙️  Configuring Web App..."
az webapp config container set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name $REGISTRY_URL/csi-demo:latest \
    --docker-registry-server-url https://$REGISTRY_URL \
    --docker-registry-server-user $REGISTRY_USERNAME \
    --docker-registry-server-password $REGISTRY_PASSWORD

# Set environment variables
echo "🔧 Setting environment variables..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
    NODE_ENV=production \
    DEMO_MODE=true \
    DEMO_USER=demo@csi.mil \
    DEMO_PASSWORD=DemoPass123! \
    BETTER_AUTH_SECRET=demo-secret-key-change-in-production \
    WEBSITES_PORT=80

# Enable continuous deployment
echo "🔄 Enabling continuous deployment..."
az webapp deployment container config \
    --enable-cd true \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP

# Get the app URL
APP_URL=$(az webapp show \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query defaultHostName \
    --output tsv)

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "📋 Application Details:"
echo "   App Name: $APP_NAME"
echo "   URL: https://$APP_URL"
echo "   Resource Group: $RESOURCE_GROUP"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Email: demo@csi.mil"
echo "   Password: DemoPass123!"
echo ""
echo "⚠️  Note: The free tier has limitations:"
echo "   - 60 CPU minutes/day"
echo "   - 1 GB memory"
echo "   - 1 GB storage"
echo "   - Custom domains not supported"
echo "   - SSL certificates included"
echo ""
echo "💡 Tips:"
echo "   - App may take 2-3 minutes to start initially"
echo "   - Free tier apps sleep after 20 mins of inactivity"
echo "   - First request after sleep takes ~30 seconds"
echo ""
echo "🗑️  To delete all resources and avoid charges:"
echo "   az group delete --name $RESOURCE_GROUP --yes"
echo ""
echo "📊 To view logs:"
echo "   az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""