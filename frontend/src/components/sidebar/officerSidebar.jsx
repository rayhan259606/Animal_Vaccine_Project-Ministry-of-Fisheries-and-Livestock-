import React from "react";
import { ListGroup } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

export default function OfficerSidebar() {
  const location = useLocation();

  const links = [
    { to: "/officerdashboard", label: "Dashboard" },
    { to: "/officer/farms", label: "Assigned Farms" },
    { to: "/officer/farmers", label: "Farmers" },
    { to: "/officer/animals", label: "Animals" },
    { to: "/officer/vaccines", label: "Vaccines" },
    { to: "/officer/allocations", label: "Allocations" },
    { to: "/officer/vaccinations", label: "Vaccinations" },
    { to: "/officer/reports", label: "Reports" },
  ];

  return (
    <div className="bg-primary text-white vh-100 p-3" style={{ width: "250px" }}>
      <h5 className="fw-bold mb-4 text-warning">Officer Menu</h5>
      <ListGroup variant="flush">
        {links.map((link, index) => (
          <ListGroup.Item
            key={index}
            as={Link}
            to={link.to}
            active={location.pathname === link.to}
            className="bg-primary text-white border-0 py-2"
          >
            {link.label}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
