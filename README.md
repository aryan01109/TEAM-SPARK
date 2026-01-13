# 🚀 TEAM-SPARK — Smart Civic Issue Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success"/>
  <img src="https://img.shields.io/badge/Stack-MERN-blue"/>
  <img src="https://img.shields.io/badge/AI-Powered-purple"/>
  <img src="https://img.shields.io/badge/Hackathon-Ready-orange"/>
</p>

**TEAM-SPARK** is a next-generation **Civic Engagement Platform** that allows citizens to report city issues, track progress, and communicate with municipal staff in real time using a modern, AI-powered digital system.

> 🌍 Making cities transparent, responsive, and citizen-friendly.

---

## 🌟 Key Features

### 👤 Citizen Portal
- Secure Login & Registration  
- Report civic issues (potholes, garbage, lighting, water, etc.)  
- Live status tracking  
- View personal issue history  
- Earn points & civic ranks  

### 🏛 Staff Portal
- Staff Registration with Government ID  
- Admin Approval System  
- Municipal Staff Dashboard  
- Issue Assignment & Resolution Tracking  

### 🤖 AI & Smart Features
- AI-powered issue classification  
- Smart routing to departments  
- Analytics & reporting dashboard  
- AI suggestions for faster resolution  

### 🔐 Security
- JWT Authentication  
- Password hashing (bcrypt)  
- Role-based access control  
- Staff approval workflow  

---

## 🧩 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT + bcrypt |
| API | RESTful APIs |
| Tools | VS Code, Postman, GitHub |

---


---

## 🔑 Authentication Flow

| User Type | Login Method |
|----------|--------------|
| Citizen | Email / Password |
| Staff | Municipal SSO / Staff Login |
| Admin | Secure Role-Based Login |

---

## 📊 Dashboards

### 🧑 Citizen Dashboard
- View submitted issues  
- Resolution status  
- Contribution points  
- City ranking  

### 🏢 Staff Dashboard
- View assigned issues  
- Update status  
- Approve or reject reports  

---
### 🧠 TEAM-SPARK System Architecture
┌──────────────────┐
│  Citizen / Staff │
│   Web Browser    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│   Frontend (CityConnect) │
│  HTML + CSS + JavaScript │
└────────┬─────────────────┘
         │  REST API Calls
         ▼
┌──────────────────────────┐
│     Node.js Backend       │
│    Express + JWT + Auth   │
└────────┬─────────────────┘
         │
         ▼
 ┌───────────────┬────────────────┬──────────────────┐
 │ Auth Service  │ Issue Service   │ Analytics Service│
 │ (Login, JWT)  │ (Reports, etc.) │ (Stats, Reports) │
 └───────┬───────┴────────┬────────┴─────────┬────────┘
         ▼                ▼                  ▼
 ┌────────────────────────────────────────────────┐
 │                 MongoDB Database               │
 │ Users | Staff | Issues | Reports | Logs         │
 └────────────────────────────────────────────────┘


## 🛠 Setup Instructions

### 1️⃣ Clone Repository

---
## 🏆 Why TEAM-SPARK?

✔ Solves real-world civic problems  
✔ Scalable & secure  
✔ Hackathon-grade UI & architecture  
✔ AI-powered future ready  
✔ Built for smart cities  

---

## 👨‍💻 Author

**Aryan Bhoya AND Patel Bhavik **  
Full-Stack Developer & Civic Tech Innovator  

GitHub: [https://github.com/aryan01109](https://github.com/aryan01109)









