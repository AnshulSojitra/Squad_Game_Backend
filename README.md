# 🏟 Squad Game Backend

A role-based sports ground booking backend built using **Node.js, Express, Sequelize, and MySQL**.  
The system supports **users**, **ground owners (admins)**, and a **super admin**, with secure authentication, slot-based bookings, payments, revenue tracking, and platform-wide administration.

---

## 🚀 Features

### 🔐 Authentication & Roles

- JWT-based authentication
- Role-based access:
  - User
  - Admin (Ground Owner)
  - Super Admin
- Block / unblock users, admins, and grounds

---

### 🏟 Grounds & Slots

- Admins can create and manage grounds
- Slot-based booking system
- Amenity management per ground
- Grounds can be blocked/unblocked by Super Admin

---

### 📅 Booking System

- Multi-slot booking support
- Prevents double booking
- Booking lifecycle:
  - `confirmed`
  - `completed`
  - `cancelled`
- Booking cancellation support

---

### 💳 Payments

- Razorpay payment integration
- Order creation and payment verification
- Bookings confirmed only after payment verification

---

### 📧 Email Notifications

- Booking confirmation email
- Booking cancellation email
- Implemented using Nodemailer

---

### 📊 Admin (Ground Owner)

- View bookings for owned grounds
- View **earned revenue**
- Revenue calculated using **completed bookings only**

---

### 👑 Super Admin

- View and manage:
  - Users
  - Admins
  - Grounds
  - Bookings
- View:
  - Bookings of a user
  - Grounds of an admin
  - Bookings of a ground
- Block/unblock any entity

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express
- **Database:** MySQL
- **ORM:** Sequelize
- **Auth:** JWT
- **Payments:** Razorpay
- **Email:** Nodemailer

---

## 📂 Project Structure

```
Squad_Game_Backend/
│
├── config/
│   ├── db.js
│   └── config.json
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
│
├── app.js
├── server.js
└── .env
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=squad_game

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

---

## ▶️ Run the Project

```bash
npm install
npm run dev
```

---

## 💰 Revenue Logic

- Revenue is calculated using **only completed bookings**
- Ensures revenue is recognized only after the game is played
- Matches real-world accounting practices

---

## 🧠 Design Highlights

- Clean role-based architecture
- Sequelize associations for relational integrity
- Secure payment verification
- Aggregated revenue queries using database-level calculations
- API-first backend design

---

## 👨‍💻 Author

**Anshul Sojitra**  
GitHub: https://github.com/AnshulSojitra

---

## ✅ Status

✔ Backend complete  
✔ Portfolio-ready  
✔ Interview-ready

Frontend can be added later if needed.
