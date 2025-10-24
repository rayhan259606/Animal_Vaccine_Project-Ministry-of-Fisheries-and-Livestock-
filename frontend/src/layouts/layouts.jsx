import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../api/client";

// সব Navbar এবং Sidebar ইমপোর্ট করো
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

  return (
    <>
      {renderNavbar()}
      <Container fluid className="d-flex">
        {renderSidebar()}

        {/* 📌 এখানেই পেজের মূল content লোড হবে */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
          <Outlet />
        </div>
      </Container>
    </>
  );
}
