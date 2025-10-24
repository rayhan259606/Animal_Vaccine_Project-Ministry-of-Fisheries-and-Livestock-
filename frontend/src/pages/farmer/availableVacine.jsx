import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Spinner,
  Button,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import api from "../../api/client";

export default function FarmerVaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [form, setForm] = useState({
    farm_id: "",
    animal_id: "",
    quantity: "",
  });

  const [quantityError, setQuantityError] = useState(""); // ⚠️ error message

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vacRes, allocRes, farmRes, animalRes] = await Promise.all([
        api.get("/vaccines"),
        api.get("/allocations"),
        api.get("/farms"),
        api.get("/animals"),
      ]);
      setVaccines(vacRes.data.data || vacRes.data);
      setAllocations(allocRes.data.data || allocRes.data);
      setFarms(farmRes.data.data || farmRes.data);
      setAnimals(animalRes.data.data || animalRes.data);
    } catch (err) {
      console.error("❌ Data load failed:", err);
      alert("Failed to load vaccine data!");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (vaccine) => {
    setSelectedVaccine(vaccine);
    setForm({ farm_id: "", animal_id: "", quantity: "" });
    setQuantityError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVaccine(null);
  };

  // ✅ Quantity check function (server-side validation)
  const checkQuantityAvailability = async (vaccineId, qty) => {
    try {
      const res = await api.get(`/vaccines/${vaccineId}`);
      const availableQty = res.data.quantity || 0; 
      if (qty > availableQty) {
        setQuantityError(`❌ Only ${availableQty} doses available`);
      } else {
        setQuantityError("");
      }
    } catch (err) {
      console.error("Stock check failed:", err);
      setQuantityError("⚠️ Unable to verify stock");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // When quantity changes → check availability
    if (name === "quantity" && selectedVaccine) {
      checkQuantityAvailability(selectedVaccine.id, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.farm_id || !form.animal_id || !form.quantity) {
      alert("⚠️ Please fill all fields!");
      return;
    }

    if (quantityError) {
      alert("❌ Cannot submit — quantity not available!");
      return;
    }

    const payload = {
      vaccine_id: selectedVaccine.id,
      farm_id: form.farm_id,
      animal_id: form.animal_id,
      quantity: form.quantity,
    };

    try {
      await api.post("/allocations", payload);
      alert("✅ Vaccine request submitted successfully!");
      handleCloseModal();
      fetchAll();
    } catch (err) {
      console.error("❌ Vaccine request failed:", err.response?.data || err);
      alert("Request failed. Please check your data and try again.");
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm("❌ Are you sure you want to cancel this request?")) return;
    try {
      await api.delete(`/allocations/${id}`);
      alert("🗑️ Vaccine request cancelled successfully!");
      fetchAll();
    } catch (err) {
      console.error("❌ Cancel failed:", err.response?.data || err);
      alert("Failed to cancel request. Please try again.");
    }
  };

  const renderStatus = (status) => {
    const colors = {
      pending: "warning text-dark",
      allocated: "info",
      issued: "primary",
      administered: "success",
      cancelled: "danger",
    };
    return <Badge bg={colors[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div className="p-4">
      {/* === Vaccine List === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-success">💉 Available Vaccines</h3>
        <Button variant="outline-success" onClick={fetchAll}>
          🔄 Refresh
        </Button>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-success">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.length > 0 ? (
                vaccines.map((v, i) => (
                  <tr key={v.id}>
                    <td>{i + 1}</td>
                    <td>{v.name}</td>
                    <td>{v.manufacturer || "N/A"}</td>
                    <td>{v.unit || "N/A"}</td>
                    <td>
                      <Badge bg={v.is_active ? "success" : "secondary"}>
                        {v.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        disabled={!v.is_active}
                        onClick={() => handleShowModal(v)}
                      >
                        📦 Request
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No vaccines available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* === My Vaccine Requests === */}
      <h4 className="fw-bold text-success mb-3">📋 My Vaccine Requests</h4>
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-success">
              <tr>
                <th>#</th>
                <th>Vaccine</th>
                <th>Farm</th>
                <th>Animal</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length > 0 ? (
                allocations.map((a, i) => (
                  <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td>{a.vaccine?.name || "N/A"}</td>
                    <td>{a.farm?.name || "N/A"}</td>
                    <td>
                      {a.animal
                        ? `${a.animal.species || "Animal"} (${a.animal.tag || "No Tag"})`
                        : "N/A"}
                    </td>
                    <td>{a.quantity}</td>
                    <td>{renderStatus(a.status)}</td>
                    <td>
                      {a.status === "pending" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelRequest(a.id)}
                        >
                          ❌ Cancel
                        </Button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* === Request Modal === */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-success">
            📦 Request Vaccine ({selectedVaccine?.name})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Farm</Form.Label>
              <Form.Select
                name="farm_id"
                value={form.farm_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Farm --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Animal</Form.Label>
              <Form.Select
                name="animal_id"
                value={form.animal_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Animal --</option>
                {animals
                  .filter((a) => a.farm_id === parseInt(form.farm_id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.tag} ({a.species})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
                isInvalid={!!quantityError}
              />
              {quantityError && (
                <Form.Text className="text-danger fw-bold">
                  {quantityError}
                </Form.Text>
              )}
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="success" type="submit" className="ms-2">
                ✅ Submit Request
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
