import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-100">
      
      {/* 공통 컨테이너 */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;