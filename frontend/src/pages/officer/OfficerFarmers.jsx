import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Card,
  Button,
  Badge,
  Spinner,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function OfficerFarms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFarms();
  }, []);

  // ✅ Fetch assigned farms for officer
  const fetchFarms = async () => {
    try {
      const res = await api.get("/farms");
      setFarms(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch farms:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch farm vaccination summary from backend
  const fetchFarmSummary = async (farmId) => {
    try {
      const res = await api.get(`/farms/${farmId}/vaccination-summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("❌ Failed to load summary:", err);
      setSummary(null);
    }
  };

  // ✅ Open modal and load summary
  const handleViewDetails = (farm) => {
    setSelectedFarm(farm);
    setShowModal(true);
    fetchFarmSummary(farm.id);
  };



  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <Container
      fluid
      className="py-5"
      style={{ background: "linear-gradient(180deg, #f8fff8, #eafbea)" }}
    >
      <Container>
        <Card className="shadow border-0 rounded-4">
          <Card.Header className="bg-success text-white fw-bold fs-5">
            🏡 Assigned Farms ({farms.length})
          </Card.Header>
          <Card.Body>
            {farms.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No farms assigned yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover bordered className="align-middle text-center">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Farm Name</th>
                      <th>Registration No</th>
                      <th>Farmer</th>
                      <th>Division</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farms.map((farm, i) => (
                      <tr key={farm.id}>
                        <td>{i + 1}</td>
                        <td>{farm.name || "N/A"}</td>
                        <td>
                          <Badge bg="secondary">
                            {farm.registration_no || "N/A"}
                          </Badge>
                        </td>
                        <td>{farm.farmer?.user?.name || "N/A"}</td>
                        <td>{farm.division || "N/A"}</td>
                        <td>{farm.district || "N/A"}</td>
                        <td>
                          <Badge
                            bg={
                              farm.status === "active"
                                ? "success"
                                : farm.status === "pending"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {farm.status}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewDetails(farm)}
                          >
                            👁️ View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* === Farm Details Modal === */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">
            🏡 Farm Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFarm ? (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Farm Name:</strong> {selectedFarm.name || "N/A"}
                  </p>
                  <p>
                    <strong>Registration No:</strong>{" "}
                    {selectedFarm.registration_no || "N/A"}
                  </p>
                  <p>
                    <strong>Farmer:</strong>{" "}
                    {selectedFarm.farmer?.user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedFarm.farmer?.user?.phone || "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Division:</strong> {selectedFarm.division || "N/A"}
                  </p>
                  <p>
                    <strong>District:</strong> {selectedFarm.district || "N/A"}
                  </p>
                  <p>
                    <strong>Upazila:</strong> {selectedFarm.upazila || "N/A"}
                  </p>
                  <p>
                    <strong>Union:</strong> {selectedFarm.union || "N/A"}
                  </p>
                </Col>
              </Row>

              <hr />

              {/* 🧩 Vaccination Summary Section */}
              <h6 className="text-success mb-3 fw-bold">
                🐄 Animal & 💉 Vaccination Summary
              </h6>

              {!summary ? (
                <div className="text-center text-muted">
                  <Spinner animation="border" size="sm" /> Loading summary...
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Total Animals:</strong>{" "}
                    {summary.total_animals ?? 0}
                  </p>
                  <p>
                    <strong>Total Vaccinations:</strong>{" "}
                    {summary.total_vaccinations ?? 0}
                  </p>
                  <p>
                    <strong>Vaccinated Animals:</strong>{" "}
                    {summary.vaccinated_animals ?? 0}
                  </p>
                  <p>
                    <strong>Pending Vaccinations:</strong>{" "}
                    {summary.pending_vaccinations ?? 0}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted text-center">No data found.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
