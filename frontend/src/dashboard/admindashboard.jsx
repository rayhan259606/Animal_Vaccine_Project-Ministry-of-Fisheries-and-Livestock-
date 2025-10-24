import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Table } from "react-bootstrap";
import api from "../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboardstats"); // তোমার Laravel API endpoint
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
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

  return (
    <div className="p-4 admin-dashboard">
      <h2 className="fw-bold text-success mb-4">🌿 Admin Dashboard Overview</h2>

      {/* === Top Stats Cards === */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center border-success">
            <Card.Body>
              <h5>Total Farmers</h5>
              <h2 className="text-success fw-bold">{stats.total_farmers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center border-info">
            <Card.Body>
              <h5>Total Officers</h5>
              <h2 className="text-info fw-bold">{stats.total_officers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center border-warning">
            <Card.Body>
              <h5>Total Farms</h5>
              <h2 className="text-warning fw-bold">{stats.total_farms}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center border-danger">
            <Card.Body>
              <h5>Total Animals</h5>
              <h2 className="text-danger fw-bold">{stats.total_animals}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Vaccine Overview === */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-primary">
            <Card.Body className="text-center">
              <h5>Vaccines Available</h5>
              <h2 className="fw-bold text-primary">{stats.total_vaccines}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-secondary">
            <Card.Body className="text-center">
              <h5>Total Allocations</h5>
              <h2 className="fw-bold text-secondary">
                {stats.total_allocations}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-success">
            <Card.Body className="text-center">
              <h5>Completed Vaccinations</h5>
              <h2 className="fw-bold text-success">
                {stats.total_vaccinations}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Budget Summary Table === */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white fw-bold">
          💰 Budget & Disbursement Summary
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-success">
              <tr>
                <th>#</th>
                <th>Budget Name</th>
                <th>Fiscal Year</th>
                <th>Total Amount</th>
                <th>Disbursed</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {stats.budgets?.length > 0 ? (
                stats.budgets.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td>{b.name}</td>
                    <td>{b.fiscal_year}</td>
                    <td>{b.total_amount}</td>
                    <td>{b.disbursed_amount}</td>
                    <td>{b.remaining_amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No budget data available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* === Activity Summary === */}
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white fw-bold">
          📋 Recent Activities
        </Card.Header>
        <Card.Body>
          {stats.recent_activities?.length > 0 ? (
            <ul className="list-group list-group-flush">
              {stats.recent_activities.map((a, i) => (
                <li key={i} className="list-group-item">
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-center">No recent activities found.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
