import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InputPage from "./pages/InputPage";
import ResultPage2 from "./pages/ResultPage2";
import UserPage from "./pages/UserPage";
import Camera from "./pages/Camera";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-100">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<UserPage />} />
        <Route path="/camera" element={<Camera />} />

        <Route
          path="/input"
          element={
            <Layout>
              <InputPage />
            </Layout>
          }
        />

        <Route
          path="/result"
          element={
            <Layout>
              <ResultPage2 />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;