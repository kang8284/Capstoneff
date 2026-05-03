import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserPage from "./pages/UserPage";
import Camera from "./pages/Camera";
import ResultPage2 from "./pages/ResultPage2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<UserPage />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/result" element={<ResultPage2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;