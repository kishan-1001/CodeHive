# CodeHive 🐝

**The Ultimate Competitive Programming & Coding Platform**

![CodeHive Home](frontend/public/CodeHive%20home%20page%20.png)

CodeHive is a modern, feature-rich coding platform designed to help developers master data structures and algorithms, compete in contests, and showcase their skills to the world.

---

## 🚀 Key Features

### ⚔️ Instant Arena (1v1 Battles)
Challenge other developers in real-time 1v1 coding battles! Select your difficulty, get matched instantly, and race to solve the problem first.
<p align="center">
  <img src="frontend/public/instant arena.png" width="800" alt="Instant Arena" />
</p>

### 🧩 Extensive Problem Library
Practice with a vast collection of problems categorized by difficulty and topic. Features a powerful Monaco-based code editor with multi-language support.
<p align="center">
  <img src="frontend/public/topic wise proble page.png" width="48%" />
  <img src="frontend/public/problem editor page.png" width="48%" />
</p>

### 🏆 Global & Local Leaderboards
Track your progress against the community.
*   **CodeHive Rank**: Based on your activity within the platform.
*   **Global Rank**: we allow you to sync your ratings from LeetCode, CodeForces, and other platforms to generate a Universal Score!
<p align="center">
  <img src="frontend/public/codehive leaderboard.png" width="400" />
  <img src="frontend/public/global leaderboard.png" width="400" />
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

### 🧠 Knowledge Drop
Share your coding insights and articles with the community. (New: Now featuring author profile pictures!).

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS, Vanilla CSS
*   **Language**: TypeScript
*   **Editor**: Monaco Editor

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **Authentication**: Passport.js (Google, GitHub, Local), JWT
*   **Real-time**: Socket.io (for Arena)

---

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/kishan-1001/CodeHive.git
    cd CodeHive
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file with DB credentials and JWT secrets
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm start
    ```

4.  **Visit the App**
    Open `http://localhost:5173` in your browser.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License.
