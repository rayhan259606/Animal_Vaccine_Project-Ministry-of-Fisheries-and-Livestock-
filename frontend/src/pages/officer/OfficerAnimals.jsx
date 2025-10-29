import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Card,
  Spinner,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerAnimals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch animals (only officer assigned farms)
  const fetchAnimals = async (term = "") => {
    try {
      const res = await api.get("/animals", {
        params: { search: term },
      });
      setAnimals(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to load animals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchAnimals(search);
  };

  // ✅ View animal details in modal
  const handleView = (animal) => {
    setSelectedAnimal(animal);
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
            🐄 Animals List ({animals.length})
          </Card.Header>
          <Card.Body>
            {/* 🔍 Search Bar */}
            <Form onSubmit={handleSearch} className="mb-4">
              <Row>
                <Col md={10}>
                  <Form.Control
                    type="text"
                    placeholder="Search by species, breed, or farm name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button type="submit" variant="success" className="w-100">
                    🔍 Search
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* 🧩 Animal Table */}
            {animals.length === 0 ? (
              <div className="text-center text-muted py-5">
                No animals found for your assigned farms.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className="align-middle text-center">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Tag / Code</th>
                      <th>Species</th>
                      <th>Breed</th>
                      <th>Sex</th>
                      <th>Farm</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animals.map((a, i) => (
                      <tr key={a.id}>
                        <td>{i + 1}</td>
                        <td>
                          <Badge bg="secondary">
                            {a.tag || a.code || `#${a.id}`}
                          </Badge>
                        </td>
                        <td>{a.species || "N/A"}</td>
                        <td>{a.breed || "N/A"}</td>
                        <td>
                          {a.sex === "male" ? "♂️ Male" : a.sex === "female" ? "♀️ Female" : "Unknown"}
                        </td>
                        <td>{a.farm?.name || "N/A"}</td>
                        <td>
                          <Badge
                            bg={
                              a.status === "active"
                                ? "success"
                                : a.status === "sold"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {a.status || "Unknown"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleView(a)}
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

      {/* === Animal Details Modal === */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">
            🐄 Animal Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAnimal ? (
            <>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Species:</strong> {selectedAnimal.species || "N/A"}
                  </p>
                  <p>
                    <strong>Breed:</strong> {selectedAnimal.breed || "N/A"}
                  </p>
                  <p>
                    <strong>Sex:</strong>{" "}
                    {selectedAnimal.sex || "Unknown"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={
                        selectedAnimal.status === "healthy"
                          ? "success"
                          : selectedAnimal.status === "sick"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {selectedAnimal.status || "Unknown"}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Farm:</strong> {selectedAnimal.farm?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Farmer:</strong>{" "}
                    {selectedAnimal.farm?.farmer?.user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>District:</strong>{" "}
                    {selectedAnimal.farm?.district || "N/A"}
                  </p>
                  <p>
                    <strong>Upazila:</strong>{" "}
                    {selectedAnimal.farm?.upazila || "N/A"}
                  </p>
                </Col>
              </Row>

              <hr />

              {/* Vaccination History */}
              <h6 className="text-success fw-bold mb-3">💉 Vaccination History</h6>
              {selectedAnimal.vaccinations && selectedAnimal.vaccinations.length > 0 ? (
                <Table bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vaccine</th>
                      <th>Dose</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAnimal.vaccinations.map((v, i) => (
                      <tr key={v.id}>
                        <td>{i + 1}</td>
                        <td>{v.vaccine?.name || "N/A"}</td>
                        <td>{v.dose || "N/A"}</td>
                        <td>
                          {v.date_administered
                            ? new Date(v.date_administered).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted small">
                  No vaccination records found for this animal.
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
