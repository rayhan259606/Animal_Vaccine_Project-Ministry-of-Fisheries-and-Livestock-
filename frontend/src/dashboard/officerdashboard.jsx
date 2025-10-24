import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import api from "../api/client";
import OfficerSidebar from "../components/sidebar/officerSidebar";
import OfficerNavbar from "../components/navbar/officerNavbar";

export default function OfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const fetchOfficerData = async () => {
    try {
      const [farms, farmers, animals, allocations, vaccinations] = await Promise.all([
        api.get("/farms"),
        api.get("/farmers"),
        api.get("/animals"),
        api.get("/allocations"),
        api.get("/vaccinations"),
      ]);

      setStats({
        farms: farms.data.length,
        farmers: farmers.data.length,
        animals: animals.data.length,
        allocations: allocations.data.length,
        vaccinations: vaccinations.data.length,
      });
    } catch (err) {
      console.error("Officer dashboard data fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <>
      <OfficerNavbar />
      <Container fluid className="d-flex">
        <OfficerSidebar />
        <div className="flex-grow-1 p-4 bg-light">
          <h3 className="fw-bold text-primary mb-4">
            Welcome to Officer Dashboard 👨‍🌾
          </h3>

          <Row>
            <Col md={4}>
              <Card className="shadow-sm border-primary mb-3">
                <Card.Body>
                  <h5 className="text-primary">Assigned Farms</h5>
                  <h2>{stats.farms}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-success mb-3">
                <Card.Body>
                  <h5 className="text-success">Farmers</h5>
                  <h2>{stats.farmers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-warning mb-3">
                <Card.Body>
                  <h5 className="text-warning">Animals</h5>
                  <h2>{stats.animals}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="shadow-sm border-info mb-3">
                <Card.Body>
                  <h5 className="text-info">Vaccine Allocations</h5>
                  <h2>{stats.allocations}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm border-danger mb-3">
                <Card.Body>
                  <h5 className="text-danger">Vaccinations Done</h5>
                  <h2>{stats.vaccinations}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
}
