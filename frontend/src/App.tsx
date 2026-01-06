import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home.tsx";
import Explore from "./pages/explore.tsx";
import HomeCodeEditor from "./pages/homeCodeEditor.tsx";
import Problem from "./pages/Problem.tsx";
import ProblemList from "./pages/ProblemList.tsx";
import ProblemDetail from "./pages/ProblemDetail.tsx";
import InstantArena from "./pages/InstantArena.tsx";
import WeeklyContest from "./pages/WeeklyContest.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/problem" element={<Problem />} />
      <Route path="/problems" element={<ProblemList />} />
      <Route path="/problems/:id" element={<ProblemDetail />} />
      <Route path="/contest" element={<InstantArena />} />
      <Route path="/weekly-contest" element={<WeeklyContest />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      <Route path="/editor" element={<HomeCodeEditor />} />
    </Routes>
  );
};

export default App;
