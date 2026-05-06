import { BrowserRouter, Routes, Route } from "react-router-dom";

// 팀원 페이지
import Home from "./pages/Home";
import UserPage from "./pages/UserPage";
import Camera from "./pages/Camera";
import ResultPage2 from "./pages/ResultPage2";

// 우리 페이지
import InputPage from "./pages/InputPage";
import CameraPage from "./pages/CameraPage";
import AnalyzingPage from "./pages/AnalyzingPage";
import ResultPage from "./pages/ResultPage";
import FittingTestPage from "./pages/FittingTestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── 팀원 라우트 ── */}
        <Route path="/"       element={<Home />} />
        <Route path="/input"  element={<UserPage />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/result" element={<ResultPage2 />} />

        {/* ── 우리 라우트 ── */}
        <Route path="/body-input"   element={<InputPage />} />
        <Route path="/body-camera"  element={<CameraPage />} />
        <Route path="/analyzing"    element={<AnalyzingPage />} />
        <Route path="/body-result"  element={<ResultPage />} />
        <Route path="/fitting-test" element={<FittingTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;