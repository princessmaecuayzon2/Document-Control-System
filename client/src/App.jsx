import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import AdminPanel from "./admin/AdminPanel";
import StaffDashboard from "./staff/StaffDashboard";
import UploadFile from "./documents/UploadFile";
import SearchDocument from "./documents/SearchDocument";

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) setAuthToken(token);
    if (role) setUserRole(role);
  }, []);

  const Logout = () => {
    setAuthToken(null);
    setUserRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
         
            <Route
              path="/"
              element={
                authToken ? (
                  userRole === "Admin" ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <Navigate to="/staff-dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

        
            <Route
              path="/login"
              element={
                authToken ? (
                  <Navigate
                    to={userRole === "Admin" ? "/admin-dashboard" : "/staff-dashboard"}
                    replace
                  />
                ) : (
                  <LoginForm setAuthToken={setAuthToken} setUserRole={setUserRole} />
                )
              }
            />

         
            {authToken && userRole === "Admin" && (
              <>
                <Route path="/admin-dashboard" element={<AdminPanel Logout={Logout} />} />
              </>
            )}

 
            {authToken && userRole === "Staff" && (
              <>
                <Route path="/staff-dashboard" element={<StaffDashboard Logout={Logout} />} />
                <Route path="/upload-document" element={<UploadFile />} />
                <Route path="/search-document" element={<SearchDocument />} />
              </>
            )}

   
            <Route path="*" element={<Navigate to={authToken ? "/" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
