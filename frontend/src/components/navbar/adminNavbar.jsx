import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/admindashboard" className="fw-bold text-light">
          🧭 Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar" />
        <Navbar.Collapse id="admin-navbar" className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} to="/admindashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin-reports">Reports</Nav.Link>
            <Nav.Link onClick={handleLogout} className="text-danger fw-semibold">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
