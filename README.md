---
## ⚙️ Prerequisites

Make sure you have installed:
  - Node.js (v18+ recommended)
  - MySQL (v8+)
  - npm
---

## 🚀 Setup Instructions

Follow these steps **in order**.

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/AnshulSojitra/Squad_Game_Backend
cd backend
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Create the database

Login to MySQL and run:

```bash
CREATE DATABASE squad_game;
```

---

### 4️⃣ Environment variables

Create a .env file and enter following details:

```bash
# Server
PORT=5000

DB_NAME=squad_game
DB_USER=root
DB_PASSWORD="your password"
DB_HOST=localhost



# JWT
JWT_SECRET=secret key name

# Environment
NODE_ENV=development


```

---

### 5️⃣ Run database migrations

This will create all tables and constraints.

```bash
npx sequelize-cli db:migrate
```

---

### 6️⃣ Run Seeders

```bash
npx sequelize-cli db:seed:all
```

---
