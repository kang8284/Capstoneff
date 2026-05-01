import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InputPage from './pages/InputPage';
import CameraPage from './pages/CameraPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ResultPage from './pages/ResultPage';
import FittingTestPage from './pages/FittingTestPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<InputPage />} />
        <Route path="/camera"       element={<CameraPage />} />
        <Route path="/analyzing"    element={<AnalyzingPage />} />
        <Route path="/result"       element={<ResultPage />} />
        <Route path="/fitting-test" element={<FittingTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
