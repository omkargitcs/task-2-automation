# Multi-Service Automation & Transit Portfolio (Task 2)

A robust, multi-service automation ecosystem combining an advanced geospatial web application, an automated real-time data ingestion pipeline, and an asynchronous chat automation engine. Built using a resource-optimized architecture, this repository showcases full-stack engineering, secure environment decoupling, and cloud deployment practices.

---

## 🏗️ System Architecture

This repository uses a **Feature-Branch Workflow** and isolates distinct business logics into dedicated directories, maximizing modularity while consolidating cloud hosting footprint to remain enterprise-cost effective.

* `server/` - Centralized Node.js/Express API gateway and database controller.
* `client/` - Next.js/React user interface optimized for civic routing analytics.
* `telegram-bot/` - Asynchronous event-driven messaging daemon.
* `google-sheets-script/` - Automated data synchronization script engine.

---

## 🚀 Core Features & Component Breakdown

### 1. CivicRoute Web Platform (`/client` & `/server`)
An interactive full-stack web application designed for transit pathing and data management.
* **Backend Runtime:** Node.js, Express, CommonJS routing parameters.
* **Database Matrix:** MongoDB Atlas Cloud Layer (Persistent storage).
* **Key Functionality:** RESTful API endpoints handling secure user requests, system data reads, and route generation.

### 2. Live Telegram Automation Daemon (`/telegram-bot`)
A real-time productivity chat automation utility embedded directly within the active Express server runtime loop.
* **Framework:** `telegraf` (Long-polling stream architecture).
* **In-Memory Storage:** Volatile array allocations for lightning-fast state mutations during user workflows.
* **Available Commands:**
    * `/start` - Initializes the automated application stream wrapper.
    * `/todo <task>` - Dynamically parses and buffers user action items.
    * `/list` - Renders current volatile state collection indexes.
    * `/note <text>` - Capture quick thoughts securely.
    * `/viewnotes` - Formats and displays saved metadata strings.

### 3. Automated Spreadsheet Ingestion Stream (`/google-sheets-script`)
An automated backend pipeline syncing local input streams to unified dashboards.
* **Engine:** Google Apps Script / JavaScript Runtime V8.
* **Key Functionality:** Automated ingestion listeners, dynamic cell mapping, and structured cloud logging.

---

## 🔒 Security & Environment Configuration

To satisfy the **Principle of Least Privilege** and avoid credential leakages, all critical application keys, webhook endpoints, and database connection strings are entirely decoupled from the source code execution matrix.

A local `.env` runtime configuration wrapper is used during development, while live production secrets are securely injected directly via the cloud host environment wrapper.


🛠️ Local Installation & Deployment
Prerequisites
Node.js v18+

npm v9+

MongoDB Atlas Live Instance


Installation Steps
Clone the repository:

Bash
git clone [https://github.com/omkargitcs/task-2-automation.git](https://github.com/omkargitcs/task-2-automation.git)
cd task-2-automation
Initialize and Build the Server Stack:

Bash
cd server
npm install
Configure Environment Variables:
Create a .env file in the server/ directory following the environment variables mockup section.

Boot the Integrated Runtime Monolith:
node server.js


🌐 Cloud Deployment Architecture
The production environment maps resources into a high-performance decoupled staging schema across free-tier hosting networks:

Frontend UI: Deployed to Vercel Edge Network, sourcing assets directly via the main or specific development branches.

Integrated Backend Engine: Hosted on a Render Web Service container mapping the feature/telegram-bot branch hierarchy.

Monolithic Resource Consolidation
To maintain zero infrastructure costs on the cloud runtime, 
the Telegraf message listener daemon is consolidated directly into the active Express HTTP routing container.
The incoming Vercel web client requests keep the shared host container awake, which inherently ensures 
the asynchronous background Telegram polling loops remain alive 24/7 without incurring service timeouts or sleep states.

main ────────────────────────────────────────────────────────► (Production Live)
         \                                             /
          ► feature/civicroute (Web Development) ────►
                                                     \
                                                      ► feature/telegram-bot (Consolidated Stream Testing)

### 🚀 Push it up to GitHub!
Once you save this text as `README.md` in your project root folder, push it up to GitHub using your terminal:

```bash
git add README.md
git commit -m "docs: add comprehensive system architecture and deployment overview readme"
git push origin feature/telegram-bot




