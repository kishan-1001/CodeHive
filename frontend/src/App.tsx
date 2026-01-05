import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home.tsx";
import Explore from "./pages/explore.tsx";
import HomeCodeEditor from "./pages/homeCodeEditor.tsx";


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Explore />} />

      <Route path="/editor" element={<HomeCodeEditor />} />
    </Routes>
  );
};

export default App;
