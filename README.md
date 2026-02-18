# ♻ WasteZero — GitHub Collaboration Guide

Welcome to the WasteZero project!
This guide explains how our team will work collaboratively using GitHub without causing merge conflicts.

---

# 📌 Branch Structure

We use the following branches:

```
main           → Stable production code (ONLY owner manages)
frontend-dev   → Frontend integration branch
backend-dev    → Backend integration branch
feature branch → Individual developer work
```

Example:

```
main
 ├── frontend-dev
 │     ├── rohit-login-ui
 │     ├── priya-dashboard-ui
 │
 ├── backend-dev
       ├── devendra-auth-api
       ├── aman-user-model
```

---

# 🚀 First Time Setup (Everyone)

### 1. Clone the repository

```bash
git clone <repo-url>
```

### 2. Go into project folder

```bash
cd WasteZero
```

### 3. Pull latest code

```bash
git pull origin main
```

---

# 💻 Frontend Team Workflow

### Step 1: Switch to frontend branch

```bash
git checkout frontend-dev
```

### Step 2: Pull latest code

```bash
git pull origin frontend-dev
```

### Step 3: Create your feature branch

```bash
git checkout -b yourname-feature
```

Example:

```bash
git checkout -b rohit-login-ui
```

### Step 4: Do your work

### Step 5: Commit and push

```bash
git add .
git commit -m "Created login UI"
git push origin yourname-feature
```

### Step 6: Create Pull Request

Go to GitHub → Pull Requests → New Pull Request

Select:

```
base: frontend-dev
compare: yourname-feature
```

Click → Create Pull Request

---

# ⚙ Backend Team Workflow

### Step 1: Switch to backend branch

```bash
git checkout backend-dev
```

### Step 2: Pull latest code

```bash
git pull origin backend-dev
```

### Step 3: Create your feature branch

```bash
git checkout -b yourname-feature
```

Example:

```bash
git checkout -b devendra-auth-api
```

### Step 4: Do your work

### Step 5: Commit and push

```bash
git add .
git commit -m "Created auth API"
git push origin yourname-feature
```

### Step 6: Create Pull Request

Select:

```
base: backend-dev
compare: yourname-feature
```

---

# 👑 Owner Workflow (Devendra)

Owner responsibilities:

* Review Pull Requests
* Merge into frontend-dev / backend-dev
* Merge final code into main branch

Merge flow:

```
feature branch → dev branch → main
```

---

# 📋 Daily Workflow Checklist

Before starting work:

```bash
git checkout frontend-dev or backend-dev
git pull origin branch-name
git checkout -b yourname-feature
```

After finishing work:

```bash
git add .
git commit -m "your message"
git push origin yourname-feature
```

Create Pull Request on GitHub.

---

# ❌ Important Rules

DO NOT:

* Push directly to main branch
* Push directly to frontend-dev or backend-dev
* Work on main branch
* Delete branches

---

# ✅ Always Do This

* Create your own branch
* Pull latest code before working
* Push only your branch
* Create Pull Request

---

# 🧰 Useful Git Commands

Check current branch:

```bash
git branch
```

Switch branch:

```bash
git checkout branch-name
```

Create new branch:

```bash
git checkout -b new-branch
```

Pull latest code:

```bash
git pull origin branch-name
```

Push branch:

```bash
git push origin branch-name
```

Check status:

```bash
git status
```

---

# 🧑‍💻 Branch Naming Convention

Frontend:

```
yourname-login-ui
yourname-dashboard-ui
```

Backend:

```
yourname-auth-api
yourname-user-model
```

Examples:

```
devendra-auth-api
aman-user-route
rohit-login-ui
```

---

# 📁 Team Responsibilities

Frontend Team:

* UI Components
* Pages
* Styling (CSS / Tailwind)

Backend Team:

* API routes
* Controllers
* Database models
* Authentication

---

# 🔄 Workflow Summary

```
main → stable code
frontend-dev → frontend integration
backend-dev → backend integration
your branch → your work

feature → dev → main
```

---

# 🎯 Goal

This workflow ensures:

* No merge conflicts
* Organized development
* Safe collaboration
* Production-ready code

---

Happy Coding! 🚀
