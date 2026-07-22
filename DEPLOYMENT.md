# Deployment Guide: Nutrition Assistant App

Follow these instructions to deploy your backend to **Render** and your frontend to **Vercel**.

---

## Part 1: Deploying Backend to Render

### Option A: Using Render Blueprints (Recommended)
Render Blueprints automatically parse configuration from the [render.yaml](file:///c:/Users/surya/Desktop/surya/render.yaml) file we created.
1. Commit the project to a GitHub/GitLab repository.
2. In the Render Dashboard, click **New +** and select **Blueprint**.
3. Link your repository.
4. Render will detect the blueprint. Under environment parameters, set your `MONGO_URI` connection string (using your MongoDB Atlas credentials).
5. Click **Approve** to deploy.

### Option B: Manual Web Service Setup
If you prefer setting up the web service manually on Render:
1. Click **New +** in the Render Dashboard and choose **Web Service**.
2. Link your repository.
3. Configure the following settings:
   * **Name**: `nutrition-assistant-api`
   * **Root Directory**: `server`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Expand the **Advanced** section and add these **Environment Variables**:
   * `MONGO_URI`: `mongodb+srv://islavathusurya_db_user:<your_password>@cluster0.nogj2rf.mongodb.net/nutrition-assistant?appName=Cluster0`
   * `JWT_SECRET`: `your_super_secret_jwt_key` (generate any strong random string)
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
5. Click **Create Web Service**.
6. Copy your deployed web service URL (e.g., `https://nutrition-assistant-api.onrender.com`). You will need it for the frontend.

---

## Part 2: Deploying Frontend to Vercel

To deploy the React client on Vercel:
1. Go to the Vercel Dashboard and click **Add New** > **Project**.
2. Select your repository.
3. Configure the project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `client`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: Your Render API URL (e.g. `https://nutrition-assistant-api.onrender.com`) - *Note: Do not add a trailing slash at the end of the URL.*
5. Click **Deploy**.

Vercel will build the frontend, and the [vercel.json](file:///c:/Users/surya/Desktop/surya/client/vercel.json) file will automatically handle client-side routing rewrites for React SPA deep linking.
