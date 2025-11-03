import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Badge,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerDisbursementEntry() {
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    farm_id: "",
    farmer_id: "",
    amount: "",
    purpose: "",
    paid_on: "",
    reference_no: "",
  });

  // 🔹 Fetch Farms (Officer assigned farms)
  const fetchFarms = async () => {
    const res = await api.get("/farms");
    setFarms(res.data.data || res.data);
  };

  // 🔹 Fetch Farmers (all farmers for simplicity)
  const fetchFarmers = async () => {
    const res = await api.get("/farmers");
    setFarmers(res.data.data || res.data);
  };

  // 🔹 Fetch running budget summary
  const fetchBudgetSummary = async () => {
    const res = await api.get("/budgets/summary");
    setBudgetSummary(res.data);
  };

  // 🔹 Fetch disbursements (officer’s assigned farms)
  const fetchDisbursements = async () => {
    const res = await api.get("/disbursements");
    setDisbursements(res.data.data || res.data);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchFarms(),
        fetchFarmers(),
        fetchDisbursements(),
        fetchBudgetSummary(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

 // 🔹 Submit Disbursement
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.farm_id || !form.farmer_id || !form.amount) {
    alert("Please fill all required fields!");
    return;
  }

  try {
    const payload = {
      ...form,
      budget_id: budgetSummary?.budget_id, // ✅ এখান থেকে পাঠাও
    };

    await api.post("/disbursements", payload);
    alert("✅ Disbursement created successfully!");
    setForm({
      farm_id: "",
      farmer_id: "",
      amount: "",
      purpose: "",
      paid_on: "",
      reference_no: "",
    });
    fetchDisbursements();
    fetchBudgetSummary();
  } catch (err) {
    console.error(err);
    alert("❌ Failed to create disbursement");
  }
};


  // 🔹 Calculate officer’s total disbursed amount
  const totalDisbursed = disbursements.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0
  );

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {/* ================= Budget Summary ================= */}
        {/* ================= Budget Summary ================= */}
<Col md={4}>
  <Card className="shadow border-0 rounded-4 overflow-hidden">
    <div className="bg-success text-white text-center py-3">
      <h5 className="fw-bold mb-0">💰 Running Budget Summary</h5>
      <small className="text-light">
        Budget ID:{" "}
        <Badge bg="light" text="dark">
          #{budgetSummary?.budget_id || "N/A"}
        </Badge>
      </small>
    </div>

    <Card.Body className="bg-light">
      {/* Total Budget */}
      <div className="p-3 mb-3 rounded-3 bg-white shadow-sm">
        <p className="mb-1 text-muted small">Total Budget</p>
        <h5 className="fw-bold text-success mb-0">
          ৳{budgetSummary?.total_budget?.toLocaleString() || 0}
        </h5>
      </div>

      {/* Total Procurement */}
      <div className="p-3 mb-3 rounded-3 bg-white shadow-sm">
        <p className="mb-1 text-muted small">Procurement Cost</p>
        <h5 className="fw-bold text-primary mb-0">
          ৳{budgetSummary?.total_procurement?.toLocaleString() || 0}
        </h5>
      </div>

      {/* Total Disbursement */}
      <div className="p-3 mb-3 rounded-3 bg-white shadow-sm">
        <p className="mb-1 text-muted small">Total Disbursed</p>
        <h5 className="fw-bold text-warning mb-0">
          ৳{budgetSummary?.total_disbursement?.toLocaleString() || 0}
        </h5>
      </div>

      {/* Remaining Budget */}
      <div className="p-3 mb-4 rounded-3 bg-white shadow-sm">
        <p className="mb-1 text-muted small">Remaining Budget</p>
        <h5 className="fw-bold text-danger mb-0">
          ৳{budgetSummary?.remaining?.toLocaleString() || 0}
        </h5>
      </div>

      {/* Financial Status Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between">
          <small className="text-muted">Financial Status</small>
          <small className="fw-bold text-success">
            {(
              ((budgetSummary?.total_disbursement || 0) /
                (budgetSummary?.total_budget || 1)) *
              100
            ).toFixed(1)}
            %
          </small>
        </div>
        <div className="progress" style={{ height: "10px" }}>
          <div
            className="progress-bar bg-success"
            style={{
              width: `${
                ((budgetSummary?.total_disbursement || 0) /
                  (budgetSummary?.total_budget || 1)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Officer's Own Disbursement */}
      <div className="bg-white p-3 rounded-3 shadow-sm text-center">
        <p className="mb-1 text-muted small">My Total Disbursed</p>
        <h5 className="fw-bold text-info mb-0">
          ৳{totalDisbursed.toLocaleString()}
        </h5>
      </div>
    </Card.Body>
  </Card>
</Col>


        {/* ================= Add Disbursement Form ================= */}
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-primary text-white fw-bold">
              ➕ Add New Disbursement
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Farm</Form.Label>
                      <Form.Select
                        value={form.farm_id}
                        onChange={(e) =>
                          setForm({ ...form, farm_id: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Farm</option>
                        {farms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.division})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Farmer</Form.Label>
                      <Form.Select
                        value={form.farmer_id}
                        onChange={(e) =>
                          setForm({ ...form, farmer_id: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Farmer</option>
                        {farmers.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.user?.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Amount (৳)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        placeholder="Enter amount"
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Paid On</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.paid_on}
                        onChange={(e) =>
                          setForm({ ...form, paid_on: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Purpose</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter purpose"
                        value={form.purpose}
                        onChange={(e) =>
                          setForm({ ...form, purpose: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Reference No</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter reference number"
                        value={form.reference_no}
                        onChange={(e) =>
                          setForm({ ...form, reference_no: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="text-end">
                    <Button type="submit" variant="success" className="px-4">
                      💾 Save Disbursement
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ================= Disbursement List ================= */}
      <Row className="mt-5">
        <Col>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-secondary text-white fw-bold">
              📋 My Disbursements
            </Card.Header>
            <Card.Body>
              {disbursements.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No disbursements found.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover className="align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Farm</th>
                        <th>Farmer</th>
                        <th>Amount</th>
                        <th>Purpose</th>
                        <th>Paid On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disbursements.map((d, i) => (
                        <tr key={d.id}>
                          <td>{i + 1}</td>
                          <td>{d.farm?.name || "N/A"}</td>
                          <td>{d.farmer?.user?.name || "N/A"}</td>
                          <td>৳{d.amount?.toLocaleString() || 0}</td>
                          <td>{d.purpose || "-"}</td>
                          <td>
                            {d.paid_on
                              ? new Date(d.paid_on).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <Badge
                              bg={
                                d.status === "approved"
                                  ? "success"
                                  : d.status === "cancelled"
                                  ? "danger"
                                  : "primary"
                              }
                            >
                              {d.status?.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
