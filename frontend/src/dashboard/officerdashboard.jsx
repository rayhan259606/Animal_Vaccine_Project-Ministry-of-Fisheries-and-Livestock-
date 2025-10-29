import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import api from "../api/client";
export default function OfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalAnimals: 0,
    totalVaccinations: 0,
    totalDisbursements: 0,
  });
  const [officer, setOfficer] = useState(null);

  useEffect(() => {
    fetchOfficer();
    fetchDashboardStats();
  }, []);

  // ✅ Fetch Officer Info
  const fetchOfficer = async () => {
    try {
      const res = await api.get("/auth/me");
      setOfficer(res.data);
    } catch (err) {
      console.error("Failed to fetch officer info", err);
    }
  };

  // ✅ Fetch Officer Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      const [farms, animals, vaccinations, disbursements] = await Promise.all([
        api.get("/farms"),
        api.get("/animals"),
        api.get("/vaccinations"),
        api.get("/disbursements"),
      ]);

      setStats({
        totalFarms: farms.data.total || farms.data.data?.length || 0,
        totalAnimals: animals.data.total || animals.data.data?.length || 0,
        totalVaccinations:
          vaccinations.data.data?.length ||
          vaccinations.data.total ||
          vaccinations.data.length ||
          0,
        totalDisbursements: disbursements.data.total || disbursements.data.data?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>

        <Container className="py-4">
          <h3 className="fw-bold mb-4 text-success">
            👨‍🔬 Officer Dashboard
          </h3>

          {/* Officer Info Card */}
          {officer && (
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-semibold text-primary mb-1">{officer.name}</h5>
                <p className="mb-0 text-muted">{officer.email}</p>
                <small className="text-secondary">Role: {officer.role?.toUpperCase()}</small>
              </Card.Body>
            </Card>
          )}

          {/* Stats Overview */}
          <Row className="g-4">
            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center p-3 bg-white rounded-4">
                <h2 className="text-success fw-bold mb-0">{stats.totalFarms}</h2>
                <p className="mb-0 text-muted">Assigned Farms</p>
              </Card>
            </Col>

            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center p-3 bg-white rounded-4">
                <h2 className="text-info fw-bold mb-0">{stats.totalAnimals}</h2>
                <p className="mb-0 text-muted">Animals</p>
              </Card>
            </Col>

            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center p-3 bg-white rounded-4">
                <h2 className="text-warning fw-bold mb-0">{stats.totalVaccinations}</h2>
                <p className="mb-0 text-muted">Vaccinations</p>
              </Card>
            </Col>

            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center p-3 bg-white rounded-4">
                <h2 className="text-danger fw-bold mb-0">{stats.totalDisbursements}</h2>
                <p className="mb-0 text-muted">Disbursements</p>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
