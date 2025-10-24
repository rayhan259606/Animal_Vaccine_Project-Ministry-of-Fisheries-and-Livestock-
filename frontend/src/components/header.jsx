import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    // 🧹 লোকালস্টোরেজ ক্লিয়ার করো
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // 🔁 Login পেজে নিয়ে যাও
    navigate("/");
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          🐄 Livestock Management
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {!token ? (
              <>
                <Nav.Link as={Link} to="/">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            ) : (
              <>
                {role === "admin" && (
                  <Nav.Link as={Link} to="/admindashboard">
                    Admin Dashboard
                  </Nav.Link>
                )}
                {role === "officer" && (
                  <Nav.Link as={Link} to="/officer-dashboard">
                    Officer Dashboard
                  </Nav.Link>
                )}
                {role === "farmer" && (
                  <Nav.Link as={Link} to="/farmer-dashboard">
                    Farmer Dashboard
                  </Nav.Link>
                )}

                {/* 🚪 Logout বাটন */}
                <Nav.Link
                  onClick={handleLogout}
                  className="text-danger fw-semibold"
                >
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
