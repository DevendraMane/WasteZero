# ♻️ WasteZero – Smart Waste Pickup & Recycling Platform

Welcome to the WasteZero project! This guide will help you:

- Set up the project locally
- Configure environment variables
- Install Git (if not installed)
- Follow the correct branch workflow
- Create Pull Requests (PR)
- Collaborate without conflicts

Please read this carefully before contributing.

---

# 📦 Project Structure

```
WasteZero/
│
├── client/        → Frontend (React)
├── server/        → Backend (Node.js + Express)
├── .env.example   → Environment variables example
└── README.md
```

---

# ⚙️ Prerequisites

Make sure you have these installed:

## 1. Install Node.js

Download and install:

[https://nodejs.org](https://nodejs.org)

Verify installation:

```
node -v
npm -v
```

---

## 2. Install Git (IMPORTANT)

Download Git:

[https://git-scm.com/downloads](https://git-scm.com/downloads)

Verify installation:

```
git --version
```

If Git is not installed, you cannot contribute.

---

# 📥 Clone the Repository

Run:

```
git clone https://github.com/YOUR_USERNAME/WasteZero.git
cd WasteZero
```

---

# 🔐 Environment Setup (.env)

Inside the server folder, create a file named:

```
.env
```

Copy contents from:

```
.env.example
```

Example:

```
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

IMPORTANT:

- Never push .env file to GitHub
- Only use .env.example for reference

---

# ▶️ Running the Project

Open TWO terminals.

---

## Run Backend

```
cd server
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Run Frontend

```
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🌿 Branch Workflow (VERY IMPORTANT)

We use this structure:

```
main
frontend-dev
backend-dev
```

Never work directly on main.

---

# 👨‍💻 How to Start Working (For Developers)

## Step 1: Go to dev branch

Frontend developers:

```
git checkout frontend-dev
git pull origin frontend-dev
```

Backend developers:

```
git checkout backend-dev
git pull origin backend-dev
```

---

## Step 2: Create your feature branch

Example:

```
git checkout -b feature-login
```

---

## Step 3: Do your work, then commit

```
git add .
git commit -m "Added login feature"
```

---

## Step 4: Push your branch

```
git push origin feature-login
```

---

# 🔁 How to Create Pull Request (PR)

Step 1: Go to GitHub repository

Step 2: Click:

```
Pull requests → New pull request
```

Step 3: Select:

Frontend:

```
base: frontend-dev
compare: feature-login
```

Backend:

```
base: backend-dev
compare: feature-name
```

Step 4: Click:

```
Create pull request
```

Done.

---

# 👑 What Maintainer (Owner) Will Do

Owner will:

- Review PR
- Merge PR into dev branch
- Merge dev branch into main when stable

Flow:

```
feature branch → dev branch → main branch
```

---

# 🔄 Update Your Branch Before Working

Always run:

```
git pull origin frontend-dev
```

OR

```
git pull origin backend-dev
```

This prevents conflicts.

---

# ❌ Important Rules

Never do these:

```
❌ Do NOT push directly to main
❌ Do NOT delete branches
❌ Do NOT push .env file
```

Always do:

```
✅ Create feature branch
✅ Create Pull Request
✅ Pull latest changes before working
```

---

# 🛠️ Common Problems & Fix

## Problem: branch is behind

Fix:

```
git pull origin frontend-dev
```

OR

```
git pull origin backend-dev
```

---

## Problem: dependencies missing

Run:

```
npm install
```

---

# ✅ Contribution Summary

Steps:

```
1. git checkout dev branch
2. git pull origin dev branch
3. git checkout -b feature-name
4. Do work
5. git add .
6. git commit -m "message"
7. git push origin feature-name
8. Create Pull Request
```

---

# 🎯 You're Ready to Contribute!

If you face any issues, contact the repository owner.

Happy coding! 🚀
