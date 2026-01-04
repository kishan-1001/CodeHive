import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home.tsx";
import Landing from "./pages/landing.tsx";
import HomeCodeEditor from "./pages/homeCodeEditor.tsx";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/editor" element={<HomeCodeEditor />} />
    </Routes>
  );
};

export default App;
