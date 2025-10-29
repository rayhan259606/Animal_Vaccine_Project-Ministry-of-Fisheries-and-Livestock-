import React, { useEffect, useState } from "react";
import { ListGroup, Button, Image } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";
import "../../App.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingFarmers, setPendingFarmers] = useState(0);

  useEffect(() => {
    fetchAdmin();
    fetchPendingFarmers();
  }, []);

  // ✅ Fetch Admin Info
  const fetchAdmin = async () => {
    try {
      const res = await api.get("/auth/me");
      setAdmin(res.data);
    } catch (err) {
      console.error("Failed to load admin info", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Pending Farmer Count
  const fetchPendingFarmers = async () => {
    try {
      const res = await api.get("/farmers/pending/count");
      setPendingFarmers(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending farmers count", err);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await api.post("/auth/logout");
      localStorage.clear();
      navigate("/");
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-white"
        style={{ height: "100vh", width: "260px" }}
      >
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/admin/profile", label: "Profile", icon: "👤" },
    { to: "/admin/users", label: "Manage Users", icon: "👥" },
    { to: "/admin/farmers", label: "Farmers", icon: "🌾" },
    { to: "/admin/officers", label: "Officers", icon: "🧑‍💼" },
    { to: "/admin/farms", label: "Farms", icon: "🏡" },
    { to: "/admin/vaccines", label: "Vaccines", icon: "💉" },
    { to: "/admin/budget", label: "Budget", icon: "💰" },
    { to: "/admin/reports", label: "Reports", icon: "📈" },
  ];

  return (
    <div
      className="admin-sidebar d-flex flex-column justify-content-between shadow-lg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "300px",
        background: "linear-gradient(180deg, #e8f5e9 0%, #ffffff 100%)",
        borderRight: "1px solid #ddd",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {/* === TOP SECTION === */}
      <div className="p-5">
        <h5 className="fw-bold mb-4 text-success text-center">
          🧑‍💼 Admin Panel
        </h5>

        {/* Admin Info */}
        {admin && (
          <div className="text-center mb-4">
            <Image
              src={
                admin.image
                  ? `http://localhost:8000/uploads/admins/${admin.image}`
                  : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Admin"
              roundedCircle
              style={{
                width: "85px",
                height: "85px",
                objectFit: "cover",
                border: "3px solid #28a745",
              }}
            />
            <p className="mt-2 mb-0 fw-semibold text-secondary">
              {admin.name || "Admin User"}
            </p>
            <small className="text-muted">{admin.email}</small>
          </div>
        )}

        {/* === Menu Links === */}
        <ListGroup variant="flush">
          {links.map((link, index) => {
            const isActive = location.pathname === link.to;
            return (
              <ListGroup.Item
                key={index}
                onClick={() => navigate(link.to)}
                className={`d-flex align-items-center fw-semibold py-2 sidebar-link ${
                  isActive ? "bg-success text-white" : ""
                }`}
                style={{
                  border: "none",
                  cursor: "pointer",
                  transition: "0.3s",
                  borderRadius: "5px",
                }}
              >
                <span className="me-2 fs-5">{link.icon}</span>
                {link.label}

                {/* 🔸 Pending Farmer Badge */}
                {link.to === "/admin/farmers" && pendingFarmers > 0 && (
                  <span className="badge bg-danger ms-auto">
                    {pendingFarmers}
                  </span>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>

      {/* === BOTTOM SECTION === */}
      <div className="p-3 border-top mt-auto">
        <Button
          variant="outline-danger"
          size="sm"
          className="w-100 fw-semibold mb-2"
          onClick={handleLogout}
        >
          🚪 Logout
        </Button>
        <small className="text-muted d-block text-center">
          v1.0.0 | © 2025 Vaccine System
        </small>
      </div>
    </div>
  );
}
