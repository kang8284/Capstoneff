import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header'; // 🔥 추가

import MainPage from './pages/MainPage';
import LoadingPage from './pages/LoadingPage';
import ResultPage from './pages/ResultPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Header /> {/* 🔥 모든 페이지 상단에 표시 */}

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;