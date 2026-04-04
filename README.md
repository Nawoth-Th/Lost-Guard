# 🛡️ Lost Guard - Lost & Found AI Platform

**Lost Guard** is a premium, full-stack mobile platform designed to reconnect people with their lost belongings through intelligent matching, secure verification, and real-time communication.


![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🎯 Project Objectives
- **Centralized Platform**: Provide a unified hub for reporting and discovering lost/found items.
- **Secure Verification**: Implement robust ownership verification through proof-of-ownership claims.
- **Smart Discovery**: Utilize AI-driven matching to improve recovery success rates.
- **Lifecycle Tracking**: Monitor the entire journey of an item from "Reported" to "Recovered".
- **Real-time Alerting**: Proactive notifications via Gmail and in-app messaging.

---

## 👥 Users & Roles

| User Type | Permissions | Description |
| :--- | :--- | :--- |
| **User** | Report, Search, Claim, Chat | General user seeking to find or return items. |
| **Admin** | Full CRUD, Moderate Claims | System manager who verifies proof and maintains data integrity. |
| **Guest** | View Only | Anonymous users who can browse public findings. |

---

## 🚀 Module Mapping (4 Members)

### 🔍 Member 1: Item Management & Discovery
- **Full CRUD Module**: Create, Read, Update, and Delete item reports.
- **Smart Matching**: Automated algorithm to find "Lost" items that correspond to "Found" reports.
- **Image Integration**: Multer-based item image uploads for visual identification.

### 🛡️ Member 2: Claim & Verification
- **Claim System**: Submit ownership claims with detailed justification.
- **Proof-of-Ownership**: Secure upload of proof images (e.g., invoices, unique marks).
- **Decision Workflow**: Backend logic for Admin approval/rejection of claims.

### 📧 Member 3: Communication & Notification
- **Real-time Chat**: Socket.io-powered messaging between finders and claimants.
- **Gmail Notifications**: Automated system alerts for registration, new claims, and matches.
- **System History**: Edit and delete messaging features for data control.

### 📜 Member 4: Tracking & Recovery
- **Status Timeline**: Visual lifecycle tracking (Reported → Pending → Recovered).
- **Secure Logs**: Persistent `StatusLog` collection that records all item state changes.
- **Privacy Controls**: Lifecycle history visibility restricted to Reporters and Admins.

---

## 🔄 Business Logic & Flow

### **Item Lifecycle**
`Lost` ➔ `Found` ➔ `Claimed` ➔ `Recovered` (Closed)

### **Claim Workflow**
`Pending` ➔ `Verified (Approved)` OR `Rejected`

---

## 🛠️ Tech Stack & Setup

### **Backend Infrastructure**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas (Aggregations used for matching)
- **Security**: JWT Authentication & Bcryptjs encryption
- **Notifications**: Nodemailer with Gmail SMTP

### **Frontend Infrastructure**
- **Framework**: React Native (Expo SDK 54)
- **UI Design**: Modern Glassmorphism with Lucide icons
- **State Management**: React Context API (Auth & Theme)

---

## 📦 Installation

### 1. Backend Setup
1. `cd backend`
2. `pnpm install`
3. Configure `.env`:
   ```env
   PORT=5001
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secure_secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
4. `pnpm run dev`

### 2. Frontend Setup
1. `cd frontend`
2. `pnpm install`
3. `npx expo start`

---

## 📂 Database Collections
- `users`: Authentication and profile data.
- `items`: Detailed lost and found reports.
- `claims`: Ownership verification requests.
- `messages`: Real-time chat history.
- `statusLogs`: Item lifecycle audit trail.

---

## 📄 License
2nd Year WMT Module Submission. Creative Commons Zero v1.0 Universal.
