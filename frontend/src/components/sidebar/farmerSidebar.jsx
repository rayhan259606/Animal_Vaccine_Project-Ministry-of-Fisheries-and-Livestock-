import React, { useEffect, useState } from "react";
import { ListGroup, Button, Image } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";
import "../../App.css";

export default function FarmerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    fetchFarmerProfile();
  }, []);

  const fetchFarmerProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setFarmer(res.data);
    } catch (error) {
      console.error("Failed to load farmer profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.clear();
      navigate("/");
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await api.delete("/auth/me");
        alert("Your account has been deleted.");
        localStorage.clear();
        navigate("/");
      } catch (error) {
        alert("Account deletion failed.");
      }
    }
  };

  const links = [
    { to: "/farmerdashboard", label: "Dashboard", icon: "🏠" },
    { to: "/farmerprofile", label: "My Profile", icon: "👤" },
    { to: "/farmer-farms", label: "My Farms", icon: "🏡" },
    { to: "/farmer-animals", label: "My Animals", icon: "🐄" },
    { to: "/farmer-vaccines", label: "Available Vaccines", icon: "💉" },
    { to: "/farmer-vaccinations", label: "Vaccination Records", icon: "📋" },
    { to: "/farmer-allocations", label: "Vaccine Allocations", icon: "📦" },
    { to: "/farmer-disbursements", label: "Financial Support", icon: "💰" },
    { to: "/farmer-reports", label: "Reports", icon: "📊" },
  ];

  // ✅ যদি farmer pending হয়, শুধু dashboard রাখো
  const filteredLinks =
    farmer?.farmer_profile?.status === "active"
      ? links
      : links.filter((link) => link.to === "/farmerdashboard");

  return (
    <div
      className="farmer-sidebar border-end d-flex flex-column justify-content-between p-3 shadow-lg"
      style={{
        width: "260px",
        background: "linear-gradient(180deg, #e8f5e9 0%, #ffffff 100%)",
      }}
    >
      <div>
        <h5 className="fw-bold mb-4 text-success text-center">
          🌾 Farmer Dashboard
        </h5>

        {farmer && (
          <div className="text-center mb-4">
            <Image
              src={
                farmer.image
                  ? `http://localhost:8000/uploads/farmers/${farmer.image}`
                  : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Farmer"
              roundedCircle
              style={{
                width: "85px",
                height: "85px",
                objectFit: "cover",
                border: "3px solid #28a745",
              }}
            />
            <p className="mt-2 mb-0 fw-semibold text-secondary">
              {farmer.name}
            </p>
            <small className="text-muted">{farmer.email}</small>
            <div className="mt-2">
              <span
                className={`badge ${
                  farmer?.farmer_profile?.status === "active"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {farmer?.farmer_profile?.status || "unknown"}
              </span>
            </div>
          </div>
        )}

        {/* === Sidebar Links === */}
        <ListGroup variant="flush">
          {filteredLinks.map((link, index) => {
            const isActive = location.pathname === link.to;
            return (
              <ListGroup.Item
                key={index}
                as={Link}
                to={link.to}
                className={`sidebar-link d-flex align-items-center rounded fw-semibold py-2 ${
                  isActive ? "active-link" : ""
                }`}
              >
                <span className="me-2 fs-5">{link.icon}</span>
                {link.label}
              </ListGroup.Item>
            );
          })}
        </ListGroup>

        {/* যদি pending হয়, user কে একটা warning দেখাও */}
        {farmer?.farmer_profile?.status === "pending" && (
          <div className="alert alert-warning mt-3 p-2 text-center small">
            ⚠️ Your account is pending approval.  
            <br /> Only dashboard access is available.
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Button
          variant="outline-success"
          size="sm"
          className="w-100 mb-2 fw-semibold"
          onClick={handleLogout}
        >
          🚪 Logout
        </Button>

        <Button
          variant="danger"
          size="sm"
          className="w-100 fw-semibold"
          onClick={handleDeleteAccount}
        >
          ❌ Delete Account
        </Button>
      </div>
    </div>
  );
}
