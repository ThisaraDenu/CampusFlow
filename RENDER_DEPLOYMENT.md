# Render Deployment Guide for CampusFlow Backend

## Prerequisites

1. Push your code to GitHub (if not already done)
2. Create a Render account at https://render.com
3. Have all your configuration values ready (see Environment Variables section below)

## Deployment Steps

### Step 1: Create New Web Service on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (select `CampusFlow` repo)
4. Choose the `main` or `master` branch

### Step 2: Configure Service Settings

Fill in the following details:

- **Name**: `campusflow-backend`
- **Environment**: Select **"Docker"** or **"Native"** (Native Java is recommended)
- **Build Command**: 
  ```
  mvn clean package -DskipTests
  ```
- **Start Command**: 
  ```
  java -jar target/backend-0.0.1-SNAPSHOT.jar
  ```
- **Plan**: Choose **"Starter"** (free tier) or **"Standard"** for production

### Step 3: Set Root Directory (Optional)

If you only want to deploy the backend:
- Set **"Root Directory"** to: `backend`

This ensures Render only builds and deploys the backend folder.

### Step 4: Add Environment Variables

Click **"Advanced"** and add the following environment variables:

```
SERVER_PORT=10000
SPRING_PROFILES_ACTIVE=prod
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/?appName=CampusFlow
JWT_SECRET=[generate-a-long-random-string-minimum-256-bits]
FRONTEND_URL=https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=[secure-password]
ADMIN_NAME=Admin Name
GOOGLE_CLIENT_ID=[your-google-oauth-client-id]
GOOGLE_CLIENT_SECRET=[your-google-oauth-secret]
CLOUDINARY_CLOUD_NAME=[your-cloudinary-cloud-name]
CLOUDINARY_API_KEY=[your-cloudinary-api-key]
CLOUDINARY_API_SECRET=[your-cloudinary-api-secret]
```

### Step 5: Review and Deploy

1. Review all settings
2. Click **"Create Web Service"**
3. Render will automatically start the build and deployment process
4. Monitor the deployment logs in the Render dashboard

## Expected Build Time

- Initial build: ~3-5 minutes (Maven builds Java 25 project)
- Subsequent deployments: ~2-3 minutes (faster due to caching)

## After Deployment

### Get Your Backend URL

Once deployed successfully, your backend will be available at:
```
https://campusflow-backend.onrender.com
```

### Update Frontend Configuration

Update your frontend environment variables to point to this new backend URL:
```
REACT_APP_API_URL=https://campusflow-backend.onrender.com
```

### Health Check

Test your backend:
```bash
curl https://campusflow-backend.onrender.com/health
```

## Troubleshooting

### Build Fails with "Java Version Not Found"

- Render uses Java 17/21 by default
- Your project requires Java 25
- **Solution**: Add `system.properties` file to the root directory:
  ```
  java.runtime.version=25
  ```

### Build Takes Too Long or Times Out

- Render free tier has limited build minutes
- **Solution**: Use Starter Plan or skip tests:
  ```
  mvn clean package -DskipTests
  ```

### MongoDB Connection Fails

- Verify MongoDB URI is correct
- Check if IP whitelist includes Render's IPs (should be "0.0.0.0/0" for production)
- MongoDB URI format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

### OAuth/CORS Issues

- Ensure `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` match your deployed frontend URL
- Update Google OAuth redirect URI to include your Render backend URL
- Check that `app.cors.allowed-origins` is properly configured in `application-prod.properties`

## Auto-Deployment Setup

1. Push code to GitHub → Render automatically detects changes
2. Every push to your default branch triggers a new deployment
3. Monitor deployments in the Render dashboard

## Rolling Back

If a deployment causes issues:
1. Go to your service in Render dashboard
2. Click **"Deployments"** tab
3. Select a previous successful deployment
4. Click **"Rollback"** to revert

## Performance Optimization

For better performance on Render:

1. **Enable Compression** (already set in `application-prod.properties`)
2. **Set appropriate JVM memory**:
   ```
   java -Xmx512M -Xms256M -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   Add this to your Start Command
3. **Monitor your service** regularly in Render dashboard

## Monitoring and Logs

Access logs in Render dashboard:
1. Select your service
2. Click **"Logs"** tab
3. View real-time application logs and deployment history

## Next Steps

1. Set up MongoDB Atlas for production (if not already)
2. Configure Google OAuth credentials
3. Update frontend to point to new backend URL
4. Test all features (authentication, bookings, etc.)
5. Set up error monitoring (Sentry, etc.)
