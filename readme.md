# CodeHive 🐝

**The Ultimate Competitive Programming & Coding Platform**

![CodeHive Home](frontend/public/CodeHive%20home%20page%20.png)

CodeHive is a modern, feature-rich coding platform designed to help developers master data structures and algorithms, compete in contests, and showcase their skills to the world.

---

## 🚀 Key Features

### ⚔️ Instant Arena 
Instant Arena lets you create custom coding contests tailored to specific topics, difficulty levels, and target companies. Whether you’re preparing for product-based interviews, sharpening your data structures skills, or testing yourself under timed conditions, Instant Arena gives you full control. You can design challenges around real interview patterns, focus on weak areas, and compete in a distraction-free environment. Each contest is structured to simulate real-world coding assessments, helping you build confidence and speed. With personalized problem sets and a competitive setup, Instant Arena transforms practice into a powerful, focused, and engaging learning experience that pushes you to perform at your best.
<p align="center">
  <img src="frontend/public/instant arena.png" width="800" alt="Instant Arena" />
</p>

### 🧩 Extensive Problem Library
Practice with a vast collection of problems categorized by difficulty and topic. Features a powerful Monaco-based code editor with multi-language support.
<p align="center">
  <img src="frontend/public/problem page.png" width="800" alt="Problem List" />
</p>
<p align="center">
  <img src="frontend/public/topic wise proble page.png" width="48%" alt="Topic Wise Problems" />
  <img src="frontend/public/problem editor page.png" width="48%" alt="Code Editor" />
</p>

### 🏆 Global & Local Leaderboards
Track your progress against the community.
*   **CodeHive Rank**: Based on your activity within the platform.
*   **Global Rank**: we allow you to sync your ratings from LeetCode, CodeForces, and other platforms to generate a Universal Score!
<p align="center">
  <img src="frontend/public/codehive leaderboard.png" width="400" />
  <img src="frontend/public/global leaderboard.png" width="400" />
</p>

### 🔗 Platform Verification
Verify your profiles from other coding platforms (LeetCode, CodeForces, etc.) to unify your stats on the Global Leaderboard.
<p align="center">
  <img src="frontend/public/platform verification.png" width="600" alt="Platform Verification" />
</p>

### 👤 Detailed User Profiles
Showcase your achievements, badges, and activity graph.
*   **View Tracking**: See how many people visit your profile.
*   **Privacy Controls**: Toggle your profile visibility between Public and Private.
*   **Badges**: Earn badges for streaks and milestones (50 Days, 100 Days, etc.).
<p align="center">
  <img src="frontend/public/my profile.png" width="800" alt="User Profile" />
</p>

### 📅 Weekly Contests
Participate in scheduled contests to test your skills under pressure and climb the rankings.
<p align="center">
  <img src="frontend/public/weekly contest.png" width="800" alt="Weekly Contest" />
</p>

### � AI-Driven Feedback
Get personalized, AI-powered feedback on your performance in Instant Arena and Weekly Contests. Understand your weak points, receive optimization tips, and improve your code quality instantly.
<p align="center">
  <img src="frontend/public/ai driven feedback.png" width="800" alt="AI Driven Feedback" />
</p>

### �🧠 Knowledge Drop
Share your coding insights and articles with the community. (New: Now featuring author profile pictures!).
<p align="center">
  <img src="frontend/public/knowledge drop.png" width="800" alt="Knowledge Drop" />
</p>

---

## 🛠️ Tech Stack & Documentation

### Frontend
*   **[React](https://react.dev/)** (v18) - Component-based UI library.
*   **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling.
*   **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework.
*   **[Monaco Editor](https://github.com/suren-atoyan/monaco-react)** - The code editor that powers VS Code.
*   **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icons.
*   **[React Router](https://reactrouter.com/)** - Declarative routing.

### Backend
*   **[Node.js](https://nodejs.org/)** - JavaScript runtime environment.
*   **[Express.js](https://expressjs.com/)** - Web application framework.
*   **[PostgreSQL](https://www.postgresql.org/)** - Relational database.
*   **[Passport.js](https://www.passportjs.org/)** - Authentication middleware.
*   **[Socket.io](https://socket.io/)** - Real-time bidirectional communication.
*   **[Docker](https://docs.docker.com/)** - Containerization for secure code execution.
*   **[Brevo](https://developers.brevo.com/)** - Email API for transactional emails.

---

## ⚡ Getting Started (Local Installation)

Follow these steps to set up CodeHive on your local machine.

### Prerequisites
Ensure you have the following installed:
*   **[Node.js](https://nodejs.org/en/download/)** (v18 or higher)
*   **[PostgreSQL](https://www.postgresql.org/download/)** (Latest version)
*   **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Required for the Instant Arena & Code Execution)
*   **git**

### 1. Clone the Repository
```bash
git clone https://github.com/kishan-1001/CodeHive.git
cd CodeHive
```

### 2. Backend Setup

**Install Dependencies:**
```bash
cd backend
npm install
```

**Environment Configuration:**
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3001

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=codehive
DB_PASSWORD=your_password
DB_PORT=5432

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key

# OAuth Providers (Optional for local dev, needed for Google/GitHub login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key
```

**Run the Backend:**
```bash
# Start in development mode (with hot reloading)
npm run dev
```
*Note: Ensure Docker Desktop is running before executing code challenges.*

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory.

**Install Dependencies:**
```bash
cd frontend
npm install
```

**Run the Frontend:**
```bash
npm start
# OR
npm run dev
```

### 4. Visit the App
Open your browser and navigate to:
`http://localhost:5173`

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License.
