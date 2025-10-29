import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Spinner, Button, Badge } from "react-bootstrap";
import api from "../../api/client";
import { Link } from "react-router-dom";

export default function OfficerFarms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const res = await api.get("/farms");
      setFarms(res.data.data || res.data);
    } catch (error) {
      console.error("❌ Failed to fetch assigned farms:", error);
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
    <Container
      fluid
      className="py-4"
      style={{ background: "linear-gradient(180deg, #f8fff8, #eafbea)" }}
    >
      <Container>
        <h3 className="fw-bold text-success mb-4">🏡 Assigned Farms</h3>

        {farms.length === 0 ? (
          <Card className="p-4 text-center border-0 shadow-sm">
            <p className="text-muted">No farms assigned yet.</p>
          </Card>
        ) : (
          <Row>
            {farms.map((farm) => (
              <Col md={6} lg={4} key={farm.id} className="mb-4">
                <Card className="shadow-sm border-0 rounded-4 h-100">
                  <Card.Body>
                    <h5 className="text-success fw-bold mb-2">{farm.name}</h5>
                    <p className="text-muted mb-1">
                      👨‍🌾 Farmer:{" "}
                      <span className="fw-semibold">
                        {farm.farmer?.user?.name || "N/A"}
                      </span>
                    </p>
                    <p className="mb-1">
                      📍 {farm.district}, {farm.division}
                    </p>
                    <p className="small text-secondary">
                      🐄 Status:{" "}
                      <Badge bg={farm.status === "active" ? "success" : "secondary"}>
                        {farm.status || "N/A"}
                      </Badge>
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Link
                        to={`/officer/farms/${farm.id}`}
                        className="btn btn-outline-success btn-sm px-3"
                      >
                        🔍 View Details
                      </Link>
                      <span  className="text-muted small fw-bold">
                        Reg: {farm.registration_no}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Container>
  );
}
