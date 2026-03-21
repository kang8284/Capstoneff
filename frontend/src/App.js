import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoadingPage from './pages/LoadingPage';
import ResultPage from './pages/ResultPage';

function App() {
  const [userId, setUserId] = useState(1); // 처음 userId 1

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage userId={userId} setUserId={setUserId} />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/result" element={<ResultPage setUserId={setUserId} />} />
      </Routes>
    </Router>
  );
}

export default App;