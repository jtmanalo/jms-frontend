// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './services/AuthContext';
import PrivateRoute from './services/PrivateRoute';

// pages
import LoginRegisterPage from './pages/LoginRegisterPage';
import DesktopRoutes from './pages/AdminDashboard';
import MobileRoutes from './pages/MobileDashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes without shared layout */}
          <Route path="/" element={<LoginRegisterPage />} />

          {/* Routes with mobile layout */}
          <Route element={<PrivateRoute />}>
            <Route
              path="/employee-dashboard/*"
              element={
                <MobileRoutes />
              }
            />
          </Route>
          {/* Routes with desktop layout */}
          <Route element={<PrivateRoute />} />
          <Route
            path="/admin-dashboard/*"
            element={
              <DesktopRoutes />
            }
          />
          {/* Fallback for other routes */}
          <Route path="*" element={<div className="p-5 text-center"><h1>404 Not Found</h1><p>Route not recognized.</p></div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;