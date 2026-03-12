# Goyfield.moe — Arknights Endfield Tracker

A functional pull tracker and global statistics database for Arknights: Endfield. 

**Website:** [goyfield.moe](https://goyfield.moe)

---

## Tech Stack

**Frontend (`/arknights-tracker`):**
- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Authentication, Firestore, Analytics)

**Backend (`/arknights-backend`):**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [SQLite](https://www.sqlite.org/) (Local database for storing statistics)

---

## Installing locally

Since the game and the tracker receive regular updates, here is how you can get the code and keep it up to date.

### Downloading the project
* **Via ZIP:** Click the green `Code` button at the top of this page and select `Download ZIP`. Extract the downloaded archive to any convenient folder on your computer.

### Updating your local version
* Download the new ZIP file using the `Code -> Download ZIP` button, delete your old project folder, and extract the new one in its place. (Your local pulls will not be deleted, as they are saved in your browser's local storage).

## How to run the tracker locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Method 1: Using the launch script (Windows only)
1. Open the downloaded project folder.
2. Double-click the `start.bat` file.
3. It will automatically install the necessary modules, start both servers (and 2 console windows), and open the site in your browser at `http://localhost:5173`.
*(Do not close the 2 console windows while using the site!)*

### Method 2: Manual launch

#### Step 1: Start the Backend
1. Open your command line.
2. Navigate to the backend folder using the `cd` command (replace with your actual path):
   `cd path_to_your_folder/arknights-backend`
3. Install the required modules (you only need to do this once):
   `npm install`
4. Start the server:
   `node server.js`

#### Step 2: Start the Frontend
1. Open a second command line window.
2. Navigate to the frontend folder:
   `cd path_to_your_folder/arknights-tracker`
3. Install the website modules:
   `npm install`
4. Start the site in developer mode:
   `npm run dev`

#### Step 3: View the site
Now open your favorite browser and type the following into the address bar:
**`http://localhost:5173`**

When importing pulls, the site will automatically detect that you are running it locally and send the request to your own backend.