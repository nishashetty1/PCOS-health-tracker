# PCOS Health Tracker – Backend and API

A basic backend API built using **Express.js** to support a PCOS (Polycystic Ovary Syndrome) health tracking application. Developed as part of the **Backend and API Development Intern Task** for Otovee, this project focuses on building endpoints for user and symptom data management, while laying the groundwork for future extensions like analytics and personalized health recommendations.

## 🔗 GitHub Repository

[PCOS Health Tracker](https://github.com/nishashetty1/PCOS-health-tracker)

## Video Link
https://drive.google.com/file/d/1uybBuxAPOPzLXG2ULEH-q97CRNjvozfv/view?usp=drive_link

---

## 🔍 Project Overview

This backend serves as the core engine for the PCOS Health Tracker application, handling:

- **User Data Submission**
- **Symptom Tracking**
- **Report Retrieval**

The application is structured with simplicity in mind, using **in-memory data storage** (JSON objects) to mimic real-world functionality without requiring a database. This allows quick prototyping and testing of API behavior.

---

## 🚀 Features (Backend-Focused)

- **User Management API**  
  Submit and retrieve user details like name, email, age, weight, and height.

- **Symptom Submission API**  
  Record symptoms daily with severity scores (1–10 scale).

- **BMI Calculation**  
  Auto-calculates BMI on user data submission and classifies health status.

- **Report Generation API**  
  Generate mock reports showing symptom frequency, severity trends, and overall health insights.

- **CORS-enabled**  
  For smooth integration with frontend apps.

- **Structured with scalability in mind**  
  Easy to plug in a database like MongoDB in future.

---

## 🛠️ Tech Stack

### Backend

- **Node.js**
- **Express.js**
- **Body-parser**
- **CORS**
- **In-memory data storage (JavaScript objects)**

---

## 📂 Project Structure (Backend)
/backend
├── index.js // Entry point for the backend server
├── routes/
│ ├── user.js // Routes for user-related operations
│ └── symptoms.js // Routes for symptom tracking
├── utils/
│ └── bmi.js // BMI calculation utility
└── data/
└── mockData.js // Simulated in-memory data store


---

## ▶️ Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

```bash
git clone https://github.com/nishashetty1/PCOS-health-tracker.git
cd PCOS-health-tracker/backend
npm install
```

### Running the Backend Server
```bash
node index.js
```
### Server runs on: http://localhost:3001

## API Endpoints
### User APIs
- ``` POST /api/users ```
Add a new user with health metrics

- ``` GET /api/users ```
Fetch all user profiles

### Symptom APIs
- ``` POST /api/symptoms```
Submit symptoms for a user with severity levels

- ``` GET /api/symptoms/:userId ```
Retrieve symptom history for a user

### Report APIs
- ``` GET /api/reports/:userId ```
Generate a mock health report including average severity, symptom frequency, and BMI status

## Bonus Challenge (Optional Extension)
An optional module calculates BMI dynamically from submitted user data and returns health category (Underweight, Normal, Overweight, Obese) as part of the user creation and report generation process.

## Future Enhancements
- Database integration (MongoDB/PostgreSQL)
- JWT-based user authentication
- Enhanced analytics for symptom trends
- Email notifications/reminders
- Integration with fitness/wellness APIs

## Author
Nisha Shetty

## Disclaimer
This project is meant for demo and health tracking purposes only. It is not a substitute for professional medical diagnosis or treatment. Please consult your healthcare provider for accurate medical advice.

