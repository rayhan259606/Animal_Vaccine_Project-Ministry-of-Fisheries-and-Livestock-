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

export default function FarmerFarms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address_line: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
  });

  // ✅ Load Farms on Page Load
  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/farms");
      const farmsData = res.data.data || res.data || [];
      setFarms(farmsData);
    } catch (error) {
      console.error("Failed to fetch farms:", error);
      alert("❌ Failed to load farms.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show Modal (Add/Edit)
  const handleShow = (farm = null) => {
    if (farm) {
      setEditingFarm(farm);
      setForm({
        name: farm.name || "",
        address_line: farm.address_line || "",
        division: farm.division || "",
        district: farm.district || "",
        upazila: farm.upazila || "",
        union: farm.union || "",
        village: farm.village || "",
      });
    } else {
      setEditingFarm(null);
      setForm({
        name: "",
        address_line: "",
        division: "",
        district: "",
        upazila: "",
        union: "",
        village: "",
      });
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Save (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm.id}`, form);
        alert("✅ Farm updated successfully!");
      } else {
        await api.post(`/farms`, form);
        alert("✅ Farm added successfully!");
      }
      handleClose();
      fetchFarms();
    } catch (error) {
      console.error("Farm save failed:", error.response?.data || error);
      if (error.response?.data?.message) {
        alert("❌ " + error.response.data.message);
      } else {
        alert("❌ Failed to save farm. Please try again.");
      }
    }
  };

  // ✅ Delete Farm
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this farm?")) return;
    try {
      await api.delete(`/farms/${id}`);
      alert("🗑️ Farm deleted successfully!");
      fetchFarms();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("❌ Failed to delete farm.");
    }
  };

  // ✅ Loader
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success mb-0">🏡 My Farms</h3>
        <Button variant="success" onClick={() => handleShow()}>
          ➕ Add Farm
        </Button>
      </div>

      {/* === Farms Table === */}
      <Card className="shadow-sm">
        <Card.Body>
          {farms.length === 0 ? (
            <p className="text-muted">No farms found.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Reg:No</th>
                  <th>Farm Name</th>
                  <th>Division</th>
                  <th>District</th>
                  <th>Upazila</th>
                  <th>Village</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((farm, index) => (
                  <tr key={farm.id}>
                    <td>{index + 1}</td>
                    <td>{farm.registration_no||"N/A"}</td>
                    <td>{farm.name}</td>
                    <td>{farm.division || "N/A"}</td>
                    <td>{farm.district || "N/A"}</td>
                    <td>{farm.upazila || "N/A"}</td>
                    <td>{farm.village || "N/A"}</td>
                    <td>{farm.status || "N/A"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShow(farm)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(farm.id)}
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

      {/* === Add/Edit Modal === */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-success">
            {editingFarm ? "✏️ Edit Farm" : "➕ Add New Farm"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Farm Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address Line</Form.Label>
                  <Form.Control
                    type="text"
                    name="address_line"
                    value={form.address_line}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Division</Form.Label>
                  <Form.Control
                    name="division"
                    value={form.division}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Control
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Upazila</Form.Label>
                  <Form.Control
                    name="upazila"
                    value={form.upazila}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Union</Form.Label>
                  <Form.Control
                    name="union"
                    value={form.union}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Village</Form.Label>
                  <Form.Control
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <Button variant="secondary" onClick={handleClose} className="me-2">
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
