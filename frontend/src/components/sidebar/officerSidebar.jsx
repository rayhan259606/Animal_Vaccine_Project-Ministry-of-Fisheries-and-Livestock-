import React, { useEffect, useState } from "react";
import { ListGroup, Button, Image } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";
import "../../App.css";

export default function OfficerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingDisbursements, setPendingDisbursements] = useState(0);

  useEffect(() => {
    fetchOfficer();
    fetchPendingDisbursements();
  }, []);

  // ✅ Fetch Officer Info
  const fetchOfficer = async () => {
    try {
      const res = await api.get("/auth/me");
      setOfficer(res.data);
    } catch (err) {
      console.error("Failed to load officer info", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Pending Disbursements Count (optional)
  const fetchPendingDisbursements = async () => {
    try {
      const res = await api.get("/officer/disbursements/pending/count");
      setPendingDisbursements(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending disbursements count", err);
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

  // ✅ Officer Menu Links
  const links = [
    { to: "/officer/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/officer/profile", label: "Profile", icon: "👤" },
    { to: "/officer/farms", label: "Assigned Farms", icon: "🏡" },
    { to: "/officer/farmers", label: "Farmers", icon: "🌾" },
    { to: "/officer/animals", label: "Animals", icon: "🐄" },
    { to: "/officer/vaccines", label: "Vaccines", icon: "💉" },
    { to: "/officer/allocations", label: "Allocations", icon: "📦" },
    { to: "/officer/vaccinations", label: "Vaccinations", icon: "🧪" },
    { to: "/officer/disbursements", label: "Disbursements", icon: "💰" },
    { to: "/officer/reports", label: "Reports", icon: "📈" },
  ];

  return (
    <div
      className="officer-sidebar d-flex flex-column justify-content-between shadow-lg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "300px",
        background: "linear-gradient(180deg, #e3f2fd 0%, #ffffff 100%)",
        borderRight: "1px solid #ddd",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {/* === TOP SECTION === */}
      <div className="p-5">
        <h5 className="fw-bold mb-4 text-primary text-center">
          👨‍🔬 Officer Panel
        </h5>

        {/* Officer Info */}
        {officer && (
          <div className="text-center mb-4">
            <Image
              src={
                officer.image
                  ? `http://localhost:8000/uploads/officers/${officer.image}`
                  : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Officer"
              roundedCircle
              style={{
                width: "85px",
                height: "85px",
                objectFit: "cover",
                border: "3px solid #007bff",
              }}
            />
            <p className="mt-2 mb-0 fw-semibold text-secondary">
              {officer.name || "Field Officer"}
            </p>
            <small className="text-muted">{officer.email}</small>
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
                  isActive ? "bg-primary text-white" : ""
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

                {/* 🔸 Pending Disbursement Badge */}
                {link.to === "/officer/disbursements" &&
                  pendingDisbursements > 0 && (
                    <span className="badge bg-danger ms-auto">
                      {pendingDisbursements}
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
