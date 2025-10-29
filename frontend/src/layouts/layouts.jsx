import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../api/client";

// 🔹 সব Navbar এবং Sidebar ইমপোর্ট করো
import AdminNavbar from "../components/navbar/adminNavbar";
import OfficerNavbar from "../components/navbar/officerNavbar";
import FarmerNavbar from "../components/navbar/farmerNavbar";

import AdminSidebar from "../components/sidebar/adminSidebar";
import OfficerSidebar from "../components/sidebar/officerSidebar";
import FarmerSidebar from "../components/sidebar/farmerSidebar";

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      navigate("/"); // লগইন না থাকলে হোমে পাঠাবে
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  // 🔹 রোল অনুসারে Navbar ও Sidebar বাছাই
  const renderNavbar = () => {
    if (user.role === "admin") return <AdminNavbar />;
    if (user.role === "officer") return <OfficerNavbar />;
    return <FarmerNavbar />;
  };

  const renderSidebar = () => {
    if (user.role === "admin") return <AdminSidebar />;
    if (user.role === "officer") return <OfficerSidebar />;
    return <FarmerSidebar />;
  };

  // 🔹 Sidebar Width
  const sidebarWidth = "260px";
  const navbarHeight = "70px"; // Approx Bootstrap Navbar Height

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* ✅ Fixed Navbar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1050 }}>
        {renderNavbar()}
      </div>

      {/* ✅ Main Layout Wrapper */}
      <div
        className="d-flex"
        style={{
          paddingTop: navbarHeight, // Navbar নিচে জায়গা রাখবে
        }}
      >
        {/* ✅ Fixed Sidebar */}
        <div
          style={{
            position: "fixed",
            top: navbarHeight,
            left: 0,
            height: `calc(100vh - ${navbarHeight})`,
            width: sidebarWidth,
            background: "#fff",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
            zIndex: 1040,
          }}
        >
          {renderSidebar()}
        </div>

        {/* ✅ Main Content Area */}
<div
  className="flex-grow-1 p-4"
  style={{
    marginLeft: `calc(${sidebarWidth} + 20px)`, // ⬅️ Sidebar থেকে 20px gap
    marginTop: 0,
    minHeight: "100vh",
    transition: "margin 0.3s ease",
    backgroundColor: "#f8f9fa",
  }}
>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
