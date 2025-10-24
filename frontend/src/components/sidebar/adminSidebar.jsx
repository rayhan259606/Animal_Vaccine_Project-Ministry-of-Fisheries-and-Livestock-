import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingFarmers, setPendingFarmers] = useState(0);

  useEffect(() => {
    fetchAdmin();
    fetchPendingFarmers();
  }, []);

  // 🔹 Fetch admin info
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

  // 🔹 Fetch pending farmer count
  const fetchPendingFarmers = async () => {
    try {
      const res = await api.get("/farmers/pending/count");
      setPendingFarmers(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending farmers count", err);
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

  return (
    <aside className="admin-sidebar shadow-sm">
      {/* 🔹 Profile Section */}
      <div className="admin-profile text-center">
        <img
          src={
            admin?.image
              ? `http://localhost:8000/uploads/admins/${admin.image}`
              : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="Admin Avatar"
          className="admin-avatar"
        />
        <h5 className="admin-name mt-2 mb-1">{admin?.name || "Admin User"}</h5>
        <p className="admin-email">{admin?.email || "admin@system.com"}</p>
        <button
          className="admin-profile-btn"
          onClick={() => navigate("/admin/profile")}
        >
          View Profile
        </button>
      </div>

      {/* 🔹 Menu */}
      <Nav className="flex-column admin-menu mt-3">
        <Nav.Link onClick={() => navigate("/admin/dashboard")} className="admin-link">
          📊 Dashboard
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/profile")} className="admin-link">
          👤 Profile
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/users")} className="admin-link">
          👥 Manage Users
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/farmers")} className="admin-link d-flex justify-content-between align-items-center">
          <span>🌾 Farmers</span>
          {pendingFarmers > 0 && (
            <span className="badge bg-danger">{pendingFarmers}</span>
          )}
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/officers")} className="admin-link">
          🧑‍💼 Officers
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/farms")} className="admin-link">
          🏡 Farms
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/vaccines")} className="admin-link">
          💉 Vaccines
        </Nav.Link>

        <Nav.Link onClick={() => navigate("/admin/reports")} className="admin-link">
          📈 Reports
        </Nav.Link>
      </Nav>

      {/* 🔹 Footer */}
      <footer className="admin-footer text-center mt-auto">
        <hr />
        <p className="admin-version">v1.0.0</p>
        <p className="admin-credit">© 2025 Vaccine System</p>
      </footer>
    </aside>
  );
}
