#!/bin/bash

# AWS EC2 Free Tier Deployment Script for CSI Application
# This script deploys the application to AWS EC2 t2.micro (free tier eligible)

set -e

echo "========================================="
echo "CSI Application AWS Free Tier Deployment"
echo "========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Configuration
INSTANCE_TYPE="t2.micro"  # Free tier eligible
KEY_NAME="csi-demo-key"
SECURITY_GROUP="csi-demo-sg"
INSTANCE_NAME="CSI-Demo-Instance"
REGION="us-east-1"  # Change to your preferred region

# Get the latest Amazon Linux 2023 AMI ID for the region
echo "🔍 Finding latest Amazon Linux 2023 AMI..."
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters \
        "Name=name,Values=al2023-ami-*-x86_64" \
        "Name=state,Values=available" \
    --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
    --output text \
    --region $REGION)

if [ -z "$AMI_ID" ] || [ "$AMI_ID" == "None" ]; then
    echo "❌ Could not find Amazon Linux 2023 AMI. Trying Amazon Linux 2..."
    AMI_ID=$(aws ec2 describe-images \
        --owners amazon \
        --filters \
            "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
            "Name=state,Values=available" \
        --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
        --output text \
        --region $REGION)
fi

if [ -z "$AMI_ID" ] || [ "$AMI_ID" == "None" ]; then
    echo "❌ Could not find a suitable AMI. Please check your region."
    exit 1
fi

echo "   Using AMI: $AMI_ID"

echo "📋 Configuration:"
echo "   Region: $REGION"
echo "   Instance Type: $INSTANCE_TYPE (Free Tier)"
echo "   Key Pair: $KEY_NAME"
echo ""

# Create key pair if it doesn't exist
echo "🔑 Setting up SSH key pair..."
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION 2>/dev/null; then
    aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text --region $REGION > ${KEY_NAME}.pem
    chmod 400 ${KEY_NAME}.pem
    echo "✅ Created new key pair: ${KEY_NAME}.pem"
else
    echo "✅ Using existing key pair: $KEY_NAME"
fi

# Create security group
echo "🔐 Setting up security group..."
SG_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP \
    --description "Security group for CSI demo application" \
    --region $REGION \
    --output text \
    --query 'GroupId' 2>/dev/null || \
    aws ec2 describe-security-groups \
    --group-names $SECURITY_GROUP \
    --region $REGION \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

echo "   Security Group ID: $SG_ID"

# Add security group rules
echo "📝 Configuring security rules..."
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

echo "✅ Security group configured"

# User data script for instance initialization
cat > user-data.sh << 'EOF'
#!/bin/bash
# Update system
yum update -y

# Install Docker
yum install -y docker git
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /home/ec2-user/csi-app
cd /home/ec2-user/csi-app

# Clone or download the application (you'll need to replace with your repo URL)
# For now, we'll create the necessary files directly

# Wait for Docker to be ready
sleep 10

# Pull and run the pre-built image
docker run -d \
  --name csi-demo \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e DEMO_MODE=true \
  -e DEMO_USER=demo@csi.mil \
  -e DEMO_PASSWORD=DemoPass123! \
  -v csi-data:/app/data \
  csi-app:latest

echo "CSI Demo Application deployed successfully!" > /home/ec2-user/deployment.log
EOF

# Launch EC2 instance
echo "🚀 Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --region $REGION \
    --output text \
    --query 'Instances[0].InstanceId')

echo "   Instance ID: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --output text \
    --query 'Reservations[0].Instances[0].PublicIpAddress')

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "📋 Instance Details:"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public IP: $PUBLIC_IP"
echo "   URL: http://$PUBLIC_IP"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Email: demo@csi.mil"
echo "   Password: DemoPass123!"
echo ""
echo "📂 SSH Access:"
echo "   ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "⚠️  Note: It may take 2-3 minutes for the application to be fully ready."
echo "   You can check the status by visiting http://$PUBLIC_IP"
echo ""
echo "💰 Free Tier Limits:"
echo "   - 750 hours per month of t2.micro instance usage"
echo "   - 30 GB of EBS storage"
echo "   - 15 GB of bandwidth out"
echo ""
echo "🛑 To stop the instance and avoid charges:"
echo "   aws ec2 stop-instances --instance-ids $INSTANCE_ID --region $REGION"
echo ""
echo "🗑️  To terminate the instance:"
echo "   aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $REGION"
echo ""

# Clean up user-data file
rm -f user-data.sh