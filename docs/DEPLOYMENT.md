# 🚀 CodeHive Production Deployment Guide

This guide will walk you through deploying CodeHive to a production environment for free.

**Architecture:**
*   **Frontend**: [Vercel](https://vercel.com/) (Free, Fast CDN)
*   **Database**: [Neon](https://neon.tech/) (Free Serverless PostgreSQL)
*   **Backend**: [AWS EC2](https://aws.amazon.com/ec2/) (Free Tier - 12 Months)

> **Why AWS EC2?**
> Your backend requires **Docker** to run user code securely. Most free "PaaS" platforms (like Render, Heroku, Vercel) **do not** support running Docker inside them. An AWS EC2 instance is a virtual machine where we can install Docker and run your backend exactly as it runs on your laptop.

---

## Phase 1: Database Setup (Neon)

1.  Go to [Neon.tech](https://neon.tech/) and sign up.
2.  Create a **New Project** named `codehive`.
3.  Copy the **Connection String** provided on the dashboard. It looks like:
    `postgres://neondb_owner:AbC123...@ep-weather-...aws.neon.tech/neondb?sslmode=require`
4.  Save this string; you will need it for the Backend configuration.

---

## Phase 2: Frontend Deployment (Vercel)

1.  Push your latest code to **GitHub**.
2.  Go to [Vercel](https://vercel.com/) and sign up with GitHub.
3.  Click **"Add New Project"** -> **"Import"** select your `CodeHive` repository.
4.  **Configure Project:**
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Framework Preset**: Vite.
    *   **Environment Variables**:
        *   `VITE_API_URL`: `http://<YOUR_EC2_PUBLIC_IP>:3001`
        *(Note: You will update this variable LATER after we set up the backend. For now, you can leave it blank or put a placeholder).*
5.  Click **Deploy**.

---

## Phase 3: Backend Deployment (AWS EC2)

This is the most critical part. We will set up a free virtual server.

### 1. Launch Instance
1.  Log in to [AWS Console](https://console.aws.amazon.com/).
2.  Go to **EC2** -> **Launch Instance**.
3.  **Name**: `CodeHive-Backend`.
4.  **AMI**: Select **Ubuntu Server 24.04 LTS**.
5.  **Instance Type**: Select **t2.micro** (Free tier eligible) or **t3.micro**.
6.  **Key Pair**: Create a new key pair (e.g., `codehive-key`), download the `.pem` file.
7.  **Network Settings**:
    *   Check **Allow SSH traffic** from **Anywhere**.
    *   Check **Allow HTTP traffic**.
    *   Check **Allow HTTPS traffic**.
8.  Click **Launch Instance**.

### 2. Configure Security Group (Firewall)
1.  Go to your Instance details. Click on the **Security Group** (e.g., `launch-wizard-xx`).
2.  Click **Edit inbound rules**.
3.  Add a Custom TCP Rule:
    *   **Port Range**: `3001` (Your backend port).
    *   **Source**: `0.0.0.0/0` (Allow access from anywhere).
4.  Save rules.

### 3. Connect to Server
Open your terminal (or Command Prompt) on your laptop where you downloaded the `.pem` key.

```bash
# Set permissions for key (Linux/Mac only, skip on Windows)
chmod 400 codehive-key.pem

# SSH into the server (Replace 1.2.3.4 with your EC2 Public IPv4 address)
ssh -i codehive-key.pem ubuntu@1.2.3.4
```

### 4. Install Environment (Postgres client, Node, Docker)
Run these commands one by one on the AWS server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install git -y
```

*Disconnect and reconnect for Docker permissions to take effect:*
`exit`
Then run the ssh command again.

### 5. Deploy Backend Code
```bash
# Clone your repo
git clone https://github.com/kishan-1001/CodeHive.git
cd CodeHive/backend

# Install dependencies
npm install

# Create Production Environment Variables
nano .env
```

**Paste the following into the editor (Update with your REAL values):**
(Right-click to paste in terminal)
```env
PORT=3001
DB_HOST=ep-weather-...aws.neon.tech  <-- Your Neon Host
DB_USER=neondb_owner                 <-- Your Neon User
DB_PASSWORD=your_neon_password       <-- Your Neon Password
DB_NAME=neondb                       <-- Your Neon Database
DB_PORT=5432
DB_SSL=true                          <-- IMPORTANT for Neon!

JWT_SECRET=production_secret_key_change_me
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://<YOUR_EC2_PUBLIC_IP>:3001/api/auth/google/callback

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://<YOUR_EC2_PUBLIC_IP>:3001/api/auth/github/callback

BREVO_API_KEY=...
```
*Press `Ctrl+X`, then `Y`, then `Enter` to save.*

### 6. Run the Backend
We use `pm2` to keep the server running even if you disconnect.

```bash
# Install PM2
sudo npm install -g pm2

# Pull necessary Docker images for code execution
docker pull python:3.9-alpine
docker pull node:18-alpine
docker pull gcc:latest
docker pull eclipse-temurin:17-jdk-alpine

# Start the server
npm run build
pm2 start dist/server.js --name "codehive-backend"
```

**Check if it's running:**
`pm2 logs`

---

## Phase 4: Connect Vercel to Backend

1.  Copy your EC2 instance's **Public IPv4 address** (e.g., `54.123.45.67`).
2.  Go back to your **Vercel Project Settings** -> **Environment Variables**.
3.  Add/Edit `VITE_API_URL`:
    *   Value: `http://54.123.45.67:3001` (Replace with your actual IP).
4.  Go to **Deployments** tab and **Redeploy**.

---

## Phase 5: OAuth Configuration (Google & GitHub)

For login to work, you must update your developer console settings.

### Google (Cloud Console)
1.  Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Select your project -> **APIs & Services** -> **Credentials**.
3.  Edit your **OAuth 2.0 Client ID**.
4.  **Authorized JavaScript Origins**: Add `http://<YOUR_EC2_PUBLIC_IP>:3001` AND `https://codehive.vercel.app`
5.  **Authorized Redirect URIs**: Add `http://<YOUR_EC2_PUBLIC_IP>:3001/api/auth/google/callback`

### GitHub (Developer Settings)
1.  Go to **[GitHub Developer Settings](https://github.com/settings/developers)**.
2.  Edit your **OAuth App**.
3.  **Homepage URL**: `https://codehive.vercel.app`
4.  **Authorization callback URL**: `http://<YOUR_EC2_PUBLIC_IP>:3001/api/auth/github/callback`

---

## 🎉 Done!
Your CodeHive is now live!
*   **Frontend**: `https://codehive.vercel.app` (Global CDN)
*   **Backend**: Running on AWS EC2 (Handling Docker execution)
*   **Database**: Neon Serverless Postgres (Scalable)
