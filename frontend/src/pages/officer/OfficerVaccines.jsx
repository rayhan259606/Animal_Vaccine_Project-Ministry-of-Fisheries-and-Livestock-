import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Spinner,
  Badge,
  Button,
  Modal,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerVaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch vaccines list
  const fetchVaccines = async (term = "") => {
    try {
      const res = await api.get("/vaccines", {
        params: { search: term },
      });
      setVaccines(res.data.data || []);
    } catch (error) {
      console.error("❌ Failed to load vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchVaccines(search);
  };

  const handleView = (vaccine) => {
    setSelectedVaccine(vaccine);
    setShowModal(true);
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
            💉 Available Vaccines ({vaccines.length})
          </Card.Header>
          <Card.Body>
            {/* 🔍 Search */}
            <Form onSubmit={handleSearch} className="mb-4">
              <Row>
                <Col md={10}>
                  <Form.Control
                    type="text"
                    placeholder="Search vaccine by name or manufacturer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button variant="success" type="submit" className="w-100">
                    🔍 Search
                  </Button>
                </Col>
              </Row>
            </Form>

            {vaccines.length === 0 ? (
              <div className="text-center text-muted py-5">
                No vaccines found.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className="align-middle text-center">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Manufacturer</th>
                      <th>Unit</th>
                      <th>Stock</th>
                      <th>Expired Batches</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccines.map((v, i) => (
                      <tr key={v.id}>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{v.name}</td>
                        <td>{v.manufacturer || "N/A"}</td>
                        <td>{v.unit || "N/A"}</td>
                        <td>
                          <Badge
                            bg={
                              Number(v.total_stock) > 100
                                ? "success"
                                : Number(v.total_stock) > 0
                                ? "warning"
                                : "danger"
                            }
                          >
                            {v.total_stock || 0}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={v.expired_batches > 0 ? "danger" : "secondary"}
                          >
                            {v.expired_batches}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={v.is_active ? "success" : "secondary"}>
                            {v.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleView(v)}
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

      {/* === Vaccine Details Modal === */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">
            💉 Vaccine Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVaccine ? (
            <>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Name:</strong> {selectedVaccine.name}
                  </p>
                  <p>
                    <strong>Manufacturer:</strong>{" "}
                    {selectedVaccine.manufacturer || "Unknown"}
                  </p>
                  <p>
                    <strong>Unit:</strong> {selectedVaccine.unit || "N/A"}
                  </p>
                  <p>
                    <strong>Dose (ml):</strong>{" "}
                    {selectedVaccine.dose_ml || "N/A"}
                  </p>
                  <p>
                    <strong>Cost/Unit:</strong> ৳
                    {selectedVaccine.cost_per_unit}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Total Stock:</strong>{" "}
                    <Badge bg="success">{selectedVaccine.total_stock}</Badge>
                  </p>
                  <p>
                    <strong>Expired Batches:</strong>{" "}
                    <Badge
                      bg={
                        selectedVaccine.expired_batches > 0
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {selectedVaccine.expired_batches}
                    </Badge>
                  </p>
                  <p>
                    <strong>Expiring Soon:</strong>{" "}
                    <Badge
                      bg={
                        selectedVaccine.expiring_soon > 0
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {selectedVaccine.expiring_soon}
                    </Badge>
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={selectedVaccine.is_active ? "success" : "secondary"}
                    >
                      {selectedVaccine.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                </Col>
              </Row>

              <hr />

              <h6 className="text-success fw-bold mb-3">
                📦 Vaccine Batches ({selectedVaccine.batches.length})
              </h6>

              {selectedVaccine.batches.length > 0 ? (
                <div className="table-responsive">
                  <Table bordered hover size="sm" className="align-middle">
                    <thead className="table-success">
                      <tr>
                        <th>#</th>
                        <th>Batch No</th>
                        <th>Quantity</th>
                        <th>Cost/Unit</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVaccine.batches.map((b, i) => (
                        <tr key={b.id}>
                          <td>{i + 1}</td>
                          <td>{b.batch_no}</td>
                          <td>{b.quantity}</td>
                          <td>৳{b.cost_per_unit}</td>
                          <td>
                            {b.expiry_date
                              ? new Date(b.expiry_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted small">
                  No batch records found for this vaccine.
                </p>
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
