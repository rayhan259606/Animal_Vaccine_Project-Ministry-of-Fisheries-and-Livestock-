import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import api from "../../api/client";

export default function FarmerAnimals() {
  const [animals, setAnimals] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const [form, setForm] = useState({
    farm_id: "",
    tag: "",
    species: "",
    breed: "",
    sex: "unknown",
    dob: "",
    status: "active",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [animalRes, farmRes] = await Promise.all([
        api.get("/animals"),
        api.get("/farms"),
      ]);

      setAnimals(animalRes.data.data || animalRes.data);
      setFarms(farmRes.data.data || farmRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("❌ Failed to load animals or farms.");
    } finally {
      setLoading(false);
    }
  };

  const handleShow = (animal = null) => {
    if (animal) {
      setEditingAnimal(animal);
      setForm({
        farm_id: animal.farm_id || "",
        tag: animal.tag || "",
        species: animal.species || "",
        breed: animal.breed || "",
        sex: animal.sex || "unknown",
        dob: animal.dob || "",
        status: animal.status || "active",
      });
    } else {
      setEditingAnimal(null);
      setForm({
        farm_id: "",
        tag: "",
        species: "",
        breed: "",
        sex: "unknown",
        dob: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnimal) {
        await api.put(`/animals/${editingAnimal.id}`, form);
        alert("✅ Animal updated successfully!");
      } else {
        await api.post("/animals", form);
        alert("✅ Animal added successfully!");
      }
      handleClose();
      fetchData();
    } catch (error) {
      console.error("Save failed:", error.response?.data || error);
      alert("❌ Failed to save animal. Please check your inputs.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this animal?")) return;
    try {
      await api.delete(`/animals/${id}`);
      alert("🗑️ Animal deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("❌ Failed to delete animal.");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success mb-0">🐄 My Animals</h3>
        <Button variant="success" onClick={() => handleShow()}>
          ➕ Add Animal
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {animals.length === 0 ? (
            <p className="text-muted">No animals found.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Tag</th>
                  <th>Species</th>
                  <th>Breed</th>
                  <th>Sex</th>
                  <th>Qantity</th>
                  <th>Status</th>
                  <th>Farm</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal, index) => (
                  <tr key={animal.id}>
                    <td>{index + 1}</td>
                    <td>{animal.tag}</td>
                    <td>{animal.species}</td>
                    <td>{animal.breed || "N/A"}</td>
                    <td>{animal.sex}</td>
                    <td>{animal.dob || "N/A"}</td>
                    <td>{animal.status}</td>
                    <td>{animal.farm?.name || "N/A"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShow(animal)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(animal.id)}
                      >
                        🗑️ Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-success">
            {editingAnimal ? "✏️ Edit Animal" : "➕ Add New Animal"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Farm</Form.Label>
                  <Form.Select
                    name="farm_id"
                    value={form.farm_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Farm</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Animal Tag</Form.Label>
                  <Form.Control
                    name="tag"
                    value={form.tag}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Species</Form.Label>
                  <Form.Control
                    name="species"
                    value={form.species}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Breed</Form.Label>
                  <Form.Control
                    name="breed"
                    value={form.breed}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sex</Form.Label>
                  <Form.Select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="text"
                    name="dob"
                    value={form.dob || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="sick">Sick</option>
                    <option value="sold">Sold</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                💾 Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
