<div align="center">
  <img src="https://img.icons8.com/color/150/000000/5-star-hotel.png" alt="LuxuryStay Logo">
  
  # 🏨 LuxuryStay Hospitality Management System (HMS)
  
  **A Modern, Scalable, and Full-Stack Hotel Management Solution**

  [![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-brightgreen?style=for-the-badge&logo=netlify)](https://luxurystay-mujtaba.netlify.app/)
  [![Tech Stack: MERN](https://img.shields.io/badge/Tech_Stack-MERN-blue?style=for-the-badge&logo=react)](https://luxurystay-mujtaba.netlify.app/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  [Live Application](https://luxurystay-mujtaba.netlify.app/) |
  [Report Bug](https://github.com/MujtabaZadaii/LuxuryStay/issues) |
  [Request Feature](https://github.com/MujtabaZadaii/LuxuryStay/issues)
</div>

---

## 🌟 Overview

**LuxuryStay HMS** is a comprehensive web-based platform designed to streamline hotel operations, improve staff productivity, and elevate guest experiences. From online reservations to housekeeping, maintenance tracking, and automated billing, this centralized system digitizes and simplifies every aspect of hotel management.

### 🔗 Live Preview
Experience the application live: **[LuxuryStay Web App](https://luxurystay-mujtaba.netlify.app/)**

---

## ✨ Key Features

### 🛎️ Reservation & Room Management
- Real-time room availability and tracking.
- Secure online and walk-in booking capabilities.
- Advanced room filtering by type, price, and amenities.

### 🧑‍💼 Multi-Role Dashboards
- **Administrator**: Complete control over staff, settings, and business analytics.
- **Receptionist**: Effortless guest check-in/out, room allocation, and payment collection.
- **Housekeeping**: Real-time cleaning tasks assignment and room status updates.
- **Guests**: Seamless online booking, service requests, and invoice tracking.

### 💳 Automated Billing & Invoicing
- Itemized billing for room charges, food, and extra services.
- Multiple payment method support (Cash, Card, Online).
- Printable and downloadable PDF invoices.

### 🛠️ Maintenance & Services
- Guests can request room services, laundry, taxi, etc.
- Staff can report issues and track repair status.
- Priority-level assignment for fast resolutions.

---

## 🛠️ Technology Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React.js, React Router, Redux/Context API, Tailwind CSS, Chart.js |
| **Backend** | Node.js, Express.js, JWT Authentication, Bcrypt |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Hosting** | Netlify (Frontend), Render/Railway (Backend) |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas URL)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MujtabaZadaii/LuxuryStay.git
   cd LuxuryStay
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory using the provided example:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your actual MongoDB URI and JWT Secret.
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
LuxuryStay/
├── backend/            # Express REST API, Models, Controllers, Routes
│   ├── config/         # Database and third-party configuration
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── frontend/           # React Application
│   ├── public/         # Static assets
│   ├── src/            # React components, pages, and hooks
│   └── package.json    # Dependencies
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

---

## 🛡️ Security & Performance

- **Authentication**: Secure JWT-based authentication.
- **Passwords**: Bcrypt hashing for password protection.
- **Architecture**: Modular and scalable MERN stack setup.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/MujtabaZadaii">Mujtaba Zadaii</a></b>
</div>
