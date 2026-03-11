import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteDetail from "./pages/SiteDetails";
import PilesPage from "./pages/PilesPage";
import Dashboard from "./pages/Dashboard";
import PileReportPage from "./pages/PileReportPage";
import UsersManagement from "./pages/UsersManagement";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/change-password" element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <UsersManagement />
        </ProtectedRoute>
      } />
      <Route
        path="/dashboard/site/:siteId/phase"
        element={
          <ProtectedRoute>
            <SiteDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/site/:siteId/phase/:phaseId/piles"
        element={
          <ProtectedRoute>
            <PilesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/site/:siteId/phase/:phaseId/pile/:pileId/report"
        element={
          <ProtectedRoute>
            <PileReportPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
