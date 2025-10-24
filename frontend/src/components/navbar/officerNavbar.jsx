import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function OfficerNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/officerdashboard" className="fw-bold">
          🧑‍🌾 Officer Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="officer-navbar" />
        <Navbar.Collapse id="officer-navbar" className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} to="/officerdashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/officer-reports">Reports</Nav.Link>
            <Nav.Link onClick={handleLogout} className="text-warning fw-semibold">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
