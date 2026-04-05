# 🛡️ Lost Guard - Advanced University Lost & Found App

**Lost Guard** is a premium, campus-aware full-stack platform designed to reconnect students and staff with their lost belongings through intelligent matching, secure blind-question verification, and real-time community trust.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)

---

## 🌟 Advanced University Features

### 🧠 Smart Campus Matching Engine

Automatically suggests "Found" items to users based on specific SLIIT Malabe Blocks (e.g., NAB, Computing, Engineering). The matching algorithm uses **Category + Location Block** precision to increase recovery rates.

### 🔒 Blind Question Verification

Secure your found items with a challenge. Reporters can set a security question (e.g., *"What sticker is on the back?"*). Claimants must provide the correct answer before they can proceed with a formal claim.

### 🏆 Guardian Leaderboard

Gamifying honesty! Users earn **Trust Points** for successful recoveries. The top 10 "Guardians" are showcased on a premium leaderboard to encourage community participation.

### 📍 Dynamic Metadata Management

Campus locations, item categories, and location blocks are fully managed via the **Admin Dashboard**. This allows the platform to adapt to new buildings or categories without code changes.

### 🏥 Verified Drop-off Hubs

Items can be marked as **"Secured at Hub"** (e.g., Security Gate 1, Student Affairs). A shield badge on the item ensures the student that their item is safe and ready for pickup.

---

## 👥 Users & Roles

| User Type | Permissions | Description |
| :--- | :--- | :--- |
| **User** | Report, Search, Claim, Chat | General students seeking belongings. |
| **Admin** | Metadata CRUD, Moderate Claims | Campus staff managing categories and hubs. |
| **Guardian** | Top Ranks, Verified Status | High-trust users with high recovery scores. |

---

## 🚀 Module Mapping

### 🔍 Member 1: Item Management & Discovery

- **Dynamic Categories**: Fetching real-time categories/locations from DB.
- **Smart Discovery**: "Suggested for You" carousel based on active lost items.
- **Cloudinary Integration**: Secure, high-performance image hosting.

### 🛡️ Member 2: Claim & Verification

- **Blind Challenge**: Implementation of the security question workflow.
- **Verification Logic**: Server-side answer validation for claim submissions.
- **Trust Scores**: Backend logic for calculating and awarding trust points.

### 📧 Member 3: Communication & Notification

- **Watchlist Notifications**: Automated email alerts for category/block matches.
- **Real-time Chat**: Glassmorphism chat UI for finder-claimant coordination.
- **Mail Service**: Nodemailer integration with premium university-branded templates.

### 📜 Member 4: Tracking & Recovery

- **Verified Hubs**: Hub tracking system for physical item security.
- **Status Lifecycle**: Visual audit trail from "Reported" to "Secured at Hub" to "Recovered".
- **Leaderboard Engine**: Aggregation logic for community rankings.

---

## 🌐 Deployment Architecture

The application is deployed across a high-performance cloud infrastructure:

- **Frontend**: **DigitalOcean App Platform** (Static Site). Served via Global CDN for low latency.
- **Backend**: **Heroku PaaS**. Running the Node.js Express API.
- **Database**: **MongoDB Atlas**. Managed cloud database with indexing for search.
- **Storage**: **Cloudinary**. Optimized image transformations and delivery.

---

## 🛠️ Tech Stack & Setup

### **Backend Setup**

1. `cd backend` && `pnpm install`
2. Configure `.env` with Mongo, JWT, Cloudinary, and SMTP keys.
3. `pnpm start`

### **Frontend Setup**

1. `cd frontend` && `pnpm install`
2. Configure `.env` with `EXPO_PUBLIC_API_URL` pointing to Heroku.
3. `pnpm start`

---

## 📂 Database Collections

- `users`: Includes `trustScore`.
- `items`: Includes `isAtHub`, `hubName`, `verificationQuestion`.
- `categories`: Dynamic metadata for item groups.
- `locations`: Campus location mapping with `block` grouping.
- `statusLogs`: Audit trail for recovery tracking.

---

## 📄 License

2nd Year WMT Module Submission. Creative Commons Zero v1.0 Universal.

Developed with ❤️ for the University Community.
