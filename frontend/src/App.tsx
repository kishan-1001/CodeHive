import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home.tsx";
import AboutUs from "./pages/aboutus";
import Career from "./pages/career.tsx";
import Explore from "./pages/explore.tsx";
import HomeCodeEditor from "./pages/homeCodeEditor.tsx";
import Problem from "./pages/Problem.tsx";
import ProblemList from "./pages/ProblemList.tsx";
import ProblemDetail from "./pages/ProblemDetail.tsx";
import InstantArena from "./pages/InstantArena.tsx";
import ArenaSession from "./pages/ArenaSession.tsx";
import ArenaFeedback from "./pages/ArenaFeedback.tsx";
import WeeklyContest from "./pages/WeeklyContest.tsx";
import ContestLive from "./pages/ContestLive.tsx";
import ContestFeedback from "./pages/ContestFeedback.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import GlobalLeaderboard from "./pages/GlobalLeaderboard.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import CodingProfile from "./pages/CodingProfile.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Legal from "./pages/Legal.tsx";


import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import AdminRoute from "./components/auth/AdminRoute.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import ProblemManagement from "./pages/admin/ProblemManagement.tsx";
import ProblemCreate from "./pages/admin/ProblemCreate.tsx";
import ProblemEdit from "./pages/admin/ProblemEdit.tsx";
import ContestManagement from "./pages/admin/ContestManagement.tsx";
import ContestCreate from "./pages/admin/ContestCreate.tsx";
import ContestEdit from "./pages/admin/ContestEdit.tsx";
import UserManagement from "./pages/admin/UserManagement.tsx";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/career" element={<Career />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/explore" element={<Explore />} />
        <Route path="/problem" element={<Problem />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/contest" element={<InstantArena />} />
        <Route path="/arena/:sessionId" element={<ArenaSession />} />
        <Route path="/arena/:sessionId/feedback" element={<ArenaFeedback />} />
        <Route path="/weekly-contest" element={<WeeklyContest />} />
        <Route path="/weekly-contest/:id" element={<ContestLive />} />
        <Route path="/weekly-contest/:id/feedback" element={<ContestFeedback />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/global-leaderboard" element={<GlobalLeaderboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/coding-profile" element={<CodingProfile />} />
        <Route path="/editor" element={<HomeCodeEditor />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="problems" element={<ProblemManagement />} />
          <Route path="problems/create" element={<ProblemCreate />} />
          <Route path="problems/:id/edit" element={<ProblemEdit />} />
          <Route path="contests" element={<ContestManagement />} />
          <Route path="contests/create" element={<ContestCreate />} />
          <Route path="contests/:id/edit" element={<ContestEdit />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
