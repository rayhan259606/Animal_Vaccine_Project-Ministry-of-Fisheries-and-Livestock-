# 🐄 Animal Vaccine Project  
### *(Ministry of Fisheries and Livestock)*

---

## 📋 Overview

**Animal Vaccine Project** is a **Laravel + React** based web application developed for the **Ministry of Fisheries and Livestock**.  
This system helps manage animal vaccination records, distribution, and livestock health monitoring digitally — ensuring better transparency and efficiency.

---

## ⚙️ Key Features

- 🧬 **Vaccine Management** – Add, update, and monitor vaccine details for different animal types.  
- 👩‍⚕️ **Farmer & Veterinarian Portal** – Allow users to log in and manage vaccination data easily.  
- 📅 **Vaccination Schedule** – Automate vaccine scheduling and reminders.  
- 🗺️ **Regional Tracking** – Track vaccine usage and livestock health by region.  
- 📊 **Reports & Analytics** – Real-time reporting and data visualization.  
- 🔐 **Secure Authentication** – Role-based access control with Laravel authentication.

---

## 🛠️ Technologies Used

| Category | Technologies |
|-----------|---------------|
| **Frontend** | React.js, Bootstrap, Axios |
| **Backend** | Laravel (PHP Framework) |
| **Database** | MySQL (`laravel_project`) |
| **API** | RESTful API between Laravel & React |
| **Version Control** | Git & GitHub |

---

## 💾 Database Information

- **Database Name:** `laravel_project`  
- **Default User Passwords:** `password`  
- You can change user passwords later from the admin dashboard.  

---

## 🚀 Installation Guide

Follow these steps to run the project locally 👇  

### 🧩 Backend (Laravel)
```bash
# Clone the repository
git clone https://github.com/rayhan259606/Animal_Vaccine_Project.git

# Go to project directory
cd Animal_Vaccine_Project/backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Update database info in .env
DB_DATABASE=laravel_project
DB_USERNAME=root
DB_PASSWORD=

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --seed

# Start the backend server
php artisan serve

⚛️ Frontend (React)
# Go to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the React development server
npm run dev



👨‍💻 Developer

Developed by: Md.Sydul Islam Rayhan

Project: Animal Vaccine Project – Ministry of Fisheries and Livestock
📧 For collaboration or queries: rayhan340997@gmail.com
