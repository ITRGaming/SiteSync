import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import api from "./api/axios";
import  { IconButton } from "@radix-ui/themes";
import { TrashIcon, ResetIcon, ExitIcon } from "@radix-ui/react-icons";
import SiteDetail from "./pages/SiteDetails";
import PilesPage from "./pages/PilesPage";
import Dashboard from "./pages/Dashboard";

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

    </Routes>
  );
}

export default App;
