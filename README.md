# WorkSpace Deployment Guide 🚀🎓✨

This project is prepared for deployment on **Render** (Backend) and **Vercel** (Frontend).

## 1. Push to GitHub
Run these commands in your project folder to push the code:
```bash
git init
git add .
git commit -m "Deployment ready: WorkSpace"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. Render Deployment (Backend)
1. Sign in to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set **Root Directory** to `backend`.
5. Set **Start Command** to `node server.js`.
6. Add these **Environment Variables**:
   - `MONGO_URI`: (Your MongoDB connection string)
   - `JWT_SECRET`: (Any secure random string)
   - `NODE_ENV`: `production`

## 3. Vercel Deployment (Frontend)
1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Connect your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Set **Framework Preset** to **Vite**.
6. Add this **Environment Variable**:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
7. Click **Deploy**.

---
**WorkSpace is now ready for the world!** 🌟🚀🎓🏆
