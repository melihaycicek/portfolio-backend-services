# 🚀 Portfolio System Builder API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Fast-blue.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Backend services powering the **Interactive System Architecture Builder** featured on my personal portfolio ([melihaycicek.com](https://melihaycicek.com)). 

This decoupled Node.js API acts as the core engine for processing incoming architecture configurations from potential clients and recruiters, generating automated system blueprints, and managing lead data securely.

## 🏗️ Architecture & Flow
The system utilizes a decoupled architecture for maximum performance and cost-efficiency:
* **Frontend (Client):** Hosted on Firebase CDN. Guides users through a progressive tech-stack selection funnel.
* **Backend (This Repo):** Hosted on a shared Node.js environment. Acts as a secure webhook listener, processing structured JSON payloads.

## ✨ Core Features
* **Dynamic Lead Processing:** Parses complex JSON payloads containing business needs and selected technical stacks (e.g., Kafka, MinIO, Spring Boot).
* **Automated Blueprint Delivery:** Uses `Nodemailer` to instantly send customized HTML emails with the user's generated architecture snapshot.
* **Security First:** * Strict **CORS** configuration (only accepts requests from `aycicek.web.app`).
  * **Rate Limiting** to prevent bot abuse and spam.
  * Input validation for robust data handling.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Email Service:** Nodemailer / SMTP
* **Security:** Helmet, CORS, Express-Rate-Limit

## 📡 API Endpoints

### `POST /api/v1/builder/submit`
Accepts the final architecture configuration and triggers the email workflow.

**Expected Request Body (JSON):**
```json
{
  "lead_type": "full_architecture",
  "contact": {
    "name": "Jane Doe",
    "email": "jane@techcorp.com",
    "company": "Tech Corp"
  },
  "architecture_selections": {
    "industry": "Logistics",
    "deployment": "On-Premise",
    "databases": ["PostgreSQL", "MinIO"],
    "processing": ["Apache Kafka"],
    "interface": "Operational Admin Panel"
  },
  "user_note": "Need a secure pipeline for fleet tracking."
}
