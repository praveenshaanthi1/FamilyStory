# MongoDB Setup Guide for Family Story App

## Step 1: Create MongoDB Atlas Account (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Create a new account or sign in with Google
4. Confirm your email

## Step 2: Create a Cluster

1. After signing up, click "Create" to build a cluster
2. Select **M0 (FREE)** tier
3. Choose your preferred region (pick closest to you)
4. Click "Create Cluster" and wait 2-3 minutes

## Step 3: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username & password (save these!)
5. Click "Add User"

## Step 4: Whitelist IP Address

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (or add specific IPs)
4. Click "Confirm"

## Step 5: Get Connection String

1. Go back to **Clusters** and click "Connect"
2. Click "Connect to Application"
3. Copy the connection string (looks like: `mongodb+srv://...`)
4. Replace `<username>` and `<password>` with your credentials

## Step 6: Local Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/family-story?retryWrites=true&w=majority
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Step 7: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Under Environment Variables, add:
   - **MONGODB_URI**: Your MongoDB connection string

4. Click Deploy!

## Troubleshooting

**Connection Error?**
- Make sure IP is whitelisted in Network Access
- Check username/password in connection string
- Verify database user exists

**Data not persisting?**
- Check server logs for MongoDB connection errors
- Verify MONGODB_URI environment variable is set on Vercel

## Free Tier Limits

- Up to 512MB storage
- Shared connection pool
- Perfect for small projects
- No credit card required!

Once exceeded, MongoDB will notify you before charges apply.
