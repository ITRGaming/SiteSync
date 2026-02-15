import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteDetail from "./pages/SiteDetails";
import PilesPage from "./pages/PilesPage";
import Dashboard from "./pages/Dashboard";
import PileReportPage from "./pages/PileReportPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route
        path="/dashboard/site/:siteId"
        element={
          <ProtectedRoute>
            <SiteDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/site/:siteId/piles"
        element={
          <ProtectedRoute>
            <PilesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/site/:siteId/pile/:pileId/report"
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
