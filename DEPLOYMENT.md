# Live Hosting Guide: Single Live URL Deployment

This guide explains how to deploy your **Library Management System** so anyone (including interviewers) can access it via a single live URL (e.g. `https://library-management-system-xxxx.onrender.com`).

---

## Architecture of Live Deployment
* **Single Domain:** Both the React web interface and Spring Boot REST API run under one URL.
* **Zero CORS issues:** The frontend communicates with `/api/...` directly on the same domain.
* **Free Tier Services Used:**
  * **Database:** [Neon.tech](https://neon.tech) (100% Free PostgreSQL cloud instance).
  * **Application Server:** [Render.com](https://render.com) (100% Free Web Service hosting).

---

## Step 1: Create a Free Cloud PostgreSQL Database (Takes 2 minutes)

1. Go to [Neon.tech](https://neon.tech) and sign up with GitHub / Google.
2. Click **Create Project** and name it `library-db`.
3. In your project dashboard under **Connection Details**:
   * Switch the dropdown from *psql* to **Parameters** or **Connection String**.
   * You will see:
     * **Host:** `ep-xyz-12345.us-east-2.aws.neon.tech`
     * **Database:** `neondb`
     * **Username:** `neondb_owner`
     * **Password:** *(your generated password)*
4. Your JDBC URL format will be:
   ```
   jdbc:postgresql://ep-xyz-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Push Your Code to GitHub

Open PowerShell in the project root:

```powershell
git add .
git commit -m "feat: configure multi-stage Dockerfile for single URL cloud deployment"
git push origin <your-branch-or-main>
```

---

## Step 3: Deploy on Render.com (Free)

1. Sign in to [Render.com](https://render.com) with GitHub.
2. Click **New +** > **Web Service**.
3. Choose **Build and deploy from a Git repository** and select your `Library_Management_System` repository.
4. Fill in the service settings:
   * **Name:** `library-management-system` (or any name you like)
   * **Region:** *Singapore* or *Ohio (US East)*
   * **Branch:** `feature` (or your active branch / `main`)
   * **Language / Environment:** **Docker**
     *(Render will automatically find the root `Dockerfile` and build both React + Spring Boot together!)*
   * **Instance Type:** **Free**

5. Scroll down to **Environment Variables** and add the following 4 keys:

   | Key | Value |
   | :--- | :--- |
   | `PORT` | `8080` |
   | `SPRING_PROFILES_ACTIVE` | `postgres` |
   | `DB_URL` | `jdbc:postgresql://<your-neon-host>/neondb?sslmode=require` |
   | `DB_USERNAME` | `<your-neon-username>` |
   | `DB_PASSWORD` | `<your-neon-password>` |

6. Click **Create Web Service**.

---

## Step 4: Your Live URL!

Render will automatically build the React frontend, package the Spring Boot backend, and start the app.

Once the build shows **Live**, you will receive your public URL:
```
https://library-management-system-xxxx.onrender.com
```

* **Opening the link** loads the React Library Dashboard immediately.
* **REST endpoints** are available at `https://library-management-system-xxxx.onrender.com/api/...`
* Evaluators can test all features right in their browser without installing anything!
