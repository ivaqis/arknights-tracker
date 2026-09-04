# Goyfield.moe — Arknights Endfield Tracker

A functional pull tracker and global statistics database for Arknights: Endfield. 

**Website:** [goyfield.moe](https://goyfield.moe)

---

## Tech Stack

**Frontend (`/arknights-tracker`):**
- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Authentication, Firestore, Analytics)

**Backend (`/goyfield-backend`):**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/) (Database for storing statistics, users, and leaderboards)

---

## API Documentation

The backend API endpoints, parameters, and responses are documented in [`goyfield-backend/API.md`](goyfield-backend/API.md).

---

# Installing locally

Since the game and the tracker receive regular updates, here is how you can get the code and keep it up to date.

### Downloading the project
* Click the green `Code` button at the top of this page and select `Download ZIP`. Extract the downloaded archive to any convenient folder on your computer.

### Updating your local version
* Download the new ZIP file using the `Code -> Download ZIP` button, delete your old project folder, and extract the new one in its place. (Your local pulls will not be deleted, as they are saved in your browser's local storage).

## How to run the tracker locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 20 or higher) and [PostgreSQL](https://www.postgresql.org/) installed on your computer.

### Method 1: Using the launch script (Windows only)
1. Open the downloaded project folder.
2. Double-click the launch script (`start2.bat`).
3. It will automatically install the necessary modules, generate the Prisma client, start both servers, and open the site in your browser at `http://localhost:5173`.
*(Do not close the console window while using the site!)*

### Method 2: Manual launch

#### Step 1: Start the Backend
1. Open your command line.
2. Navigate to the backend folder using the `cd` command (replace with your actual path):
   ```bash
   cd path_to_your_folder/goyfield-backend
   ```
3. Configure your environment variables by creating `.env` (refer to `.env.example`).
4. Install the required modules (you only need to do this once):
   ```bash
   npm install
   ```
5. Generate the Prisma client:
   ```bash
   npm run prisma:v2:generate
   ```
6. Apply database migrations:
   ```bash
   npm run prisma:v2:migrate
   ```
7. Start the server:
   ```bash
   npm run dev
   ```
   *(Alternatively, run `npm run start:local` or build with `npm run build` and run `npm start`)*

#### Step 2: Start the Frontend
1. Open a second command line window.
2. Navigate to the frontend folder:
   ```bash
   cd path_to_your_folder/arknights-tracker
   ```
3. Install the website modules:
   ```bash
   npm install
   ```
4. Start the site in developer mode:
   ```bash
   npm run dev
   ```

#### Step 3: View the site
Now open your favorite browser and type the following into the address bar:
**`http://localhost:5173`**

When importing pulls, the site will automatically detect that you are running it locally and send the request to your own backend.

---

# Docker deployment

This repo uses Docker Compose to run PostgreSQL, the backend (`goyfield-backend`), and the frontend (`arknights-tracker`).

```bash
docker compose up --build
```

## Database migrations
Prisma schema and migrations are located in `goyfield-backend/prisma/v2`:
- Schema: `goyfield-backend/prisma/v2/schema.prisma`

Helper scripts (run inside `goyfield-backend`):
```bash
npm run prisma:v2:generate
npm run prisma:v2:migrate
```
