import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import api from "../api/client";

export default function FarmerDashboard() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [meRes, animalRes, vaccinationRes, farmRes, disburseRes] =
        await Promise.all([
          api.get("/auth/me"),
          api.get("/animals"),
          api.get("/vaccinations"),
          api.get("/farms"),
          api.get("/disbursements"),
        ]);

      setUser(meRes.data);

      setStats({
        farms: farmRes.data.data
          ? farmRes.data.data.length
          : farmRes.data.length || 0,
        animals: animalRes.data.data
          ? animalRes.data.data.length
          : animalRes.data.length || 0,
        vaccinations: vaccinationRes.data.data
          ? vaccinationRes.data.data.length
          : vaccinationRes.data.length || 0,
        disbursements: disburseRes.data.data
          ? disburseRes.data.data.length
          : disburseRes.data.length || 0,
      });
    } catch (error) {
      console.error("Dashboard data fetch failed", error);
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
    <Container fluid className="p-4">
      <h3 className="fw-bold text-success mb-4">
        🌾 Farmer Dashboard Overview
      </h3>

      {/* === Summary Cards === */}
      <Row>
        <Col md={3}>
          <Card className="shadow-sm border-success mb-3">
            <Card.Body className="text-center">
              <h6 className="text-success">🏡 My Farms</h6>
              <h2>{stats.farms}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-primary mb-3">
            <Card.Body className="text-center">
              <h6 className="text-primary">🐄 Animals</h6>
              <h2>{stats.animals}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-warning mb-3">
            <Card.Body className="text-center">
              <h6 className="text-warning">💉 Vaccinations</h6>
              <h2>{stats.vaccinations}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-info mb-3">
            <Card.Body className="text-center">
              <h6 className="text-info">💰 Disbursements</h6>
              <h2>{stats.disbursements}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Farmer Info Section === */}
      {user?.farmer_profile && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <h5 className="fw-bold text-success mb-3">👩‍🌾 Farmer Information</h5>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Registration No:</strong>{" "}
                  <span className="text-primary fw-semibold">
                    {user.farmer_profile.registration_no}
                  </span>
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    bg={
                      user.farmer_profile.status === "active"
                        ? "success"
                        : user.farmer_profile.status === "pending"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {user.farmer_profile.status}
                  </Badge>
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
