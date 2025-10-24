import React, { useEffect, useState, useRef } from "react";
import { Card, Spinner, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import api from "../../api/client";

export default function FarmerReports() {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [filters, setFilters] = useState({ year: "", month: "" });

  // Canvas Refs for Mini Charts
  const allocationCanvas = useRef(null);
  const vaccinationCanvas = useRef(null);
  const disbursementCanvas = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allocRes, vacRes, disRes] = await Promise.all([
        api.get("/allocations"),
        api.get("/vaccinations"),
        api.get("/disbursements"),
      ]);

      setAllocations(allocRes.data.data || allocRes.data);
      setVaccinations(vacRes.data.data || vacRes.data);
      setDisbursements(disRes.data.data || disRes.data);
    } catch (err) {
      console.error("❌ Failed to load reports:", err);
      alert("Failed to load report data!");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const filterByDate = (list, dateKey) => {
    return list.filter((item) => {
      const d = new Date(item[dateKey]);
      const yearMatch = filters.year ? d.getFullYear() === parseInt(filters.year) : true;
      const monthMatch = filters.month ? d.getMonth() + 1 === parseInt(filters.month) : true;
      return yearMatch && monthMatch;
    });
  };

  const filteredAllocations = filterByDate(allocations, "created_at");
  const filteredVaccinations = filterByDate(vaccinations, "date_administered");
  const filteredDisbursements = filterByDate(disbursements, "paid_on");

  const handleExportPDF = () => {
    window.print(); // Export as PDF
  };

  useEffect(() => {
    drawBar(allocationCanvas.current, filteredAllocations);
    drawLine(vaccinationCanvas.current, filteredVaccinations);
    drawPie(disbursementCanvas.current, filteredDisbursements);
  }, [filteredAllocations, filteredVaccinations, filteredDisbursements]);

  // === Simple Canvas Charts ===
  const drawBar = (canvas, data) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 400, 200);
    const statuses = ["pending", "allocated", "issued", "administered"];
    const counts = statuses.map(
      (s) => data.filter((a) => a.status === s).length
    );
    const colors = ["#ffc107", "#17a2b8", "#198754", "#6f42c1"];
    const max = Math.max(...counts, 1);
    statuses.forEach((s, i) => {
      ctx.fillStyle = colors[i];
      const barHeight = (counts[i] / max) * 120;
      ctx.fillRect(50 + i * 70, 180 - barHeight, 40, barHeight);
      ctx.fillStyle = "#000";
      ctx.fillText(s, 50 + i * 70, 195);
    });
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Allocation Status Overview", 50, 20);
  };

  const drawLine = (canvas, data) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 400, 200);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const counts = months.map(
      (m) => data.filter((v) => new Date(v.date_administered).getMonth() + 1 === m).length
    );
    const max = Math.max(...counts, 1);
    ctx.beginPath();
    ctx.moveTo(50, 180 - (counts[0] / max) * 150);
    ctx.strokeStyle = "#198754";
    counts.forEach((c, i) => {
      const x = 50 + i * 25;
      const y = 180 - (c / max) * 150;
      ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillText("Vaccination Trend", 50, 20);
  };

  const drawPie = (canvas, data) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 300, 200);
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    const count = data.length;
    const colors = ["#28a745", "#17a2b8"];
    const angles = [(count / (count + total / 10000)) * 2 * Math.PI,
      ((total / 10000) / (count + total / 10000)) * 2 * Math.PI];
    let start = 0;
    angles.forEach((a, i) => {
      ctx.beginPath();
      ctx.moveTo(150, 100);
      ctx.arc(150, 100, 80, start, start + a);
      ctx.fillStyle = colors[i];
      ctx.fill();
      start += a;
    });
    ctx.fillText("Financial Overview", 90, 190);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  // === Summary Calculations ===
  const totalAllocated = filteredAllocations.length;
  const totalVaccinated = filteredVaccinations.length;
  const totalPaid = filteredDisbursements.reduce((sum, d) => sum + d.amount, 0);
  const pending = filteredAllocations.filter((a) => a.status === "pending").length;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success">🌾 Farmer Progress & Report Dashboard</h3>
        <Button variant="outline-danger" onClick={handleExportPDF}>
          🧾 Export as PDF
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  placeholder="Enter year (e.g. 2025)"
                  value={filters.year}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Select name="month" value={filters.month} onChange={handleFilterChange}>
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="success" className="w-100" onClick={fetchAll}>
                🔄 Refresh Data
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Charts */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <canvas ref={allocationCanvas} width="400" height="200"></canvas>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <canvas ref={vaccinationCanvas} width="400" height="200"></canvas>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <canvas ref={disbursementCanvas} width="300" height="200"></canvas>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Overview */}
      <Card className="shadow-sm mt-4 mb-4">
        <Card.Body>
          <h5 className="text-success mb-3 fw-bold">📋 Overall Summary</h5>
          <Row>
            <Col md={3}>
              <h4>{totalAllocated}</h4>
              <p className="text-muted">Total Allocations</p>
            </Col>
            <Col md={3}>
              <h4>{pending}</h4>
              <p className="text-muted">Pending Requests</p>
            </Col>
            <Col md={3}>
              <h4>{totalVaccinated}</h4>
              <p className="text-muted">Vaccinations Done</p>
            </Col>
            <Col md={3}>
              <h4>৳{totalPaid.toLocaleString()}</h4>
              <p className="text-muted">Total Financial Support</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tables */}
      <Row className="g-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="text-success mb-3 fw-bold">💉 Vaccine Allocations</h5>
              <Table striped bordered hover responsive>
                <thead className="table-success">
                  <tr>
                    <th>#</th>
                    <th>Vaccine</th>
                    <th>Farm</th>
                    <th>Animal</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllocations.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td>{a.vaccine?.name || "N/A"}</td>
                      <td>{a.farm?.name || "N/A"}</td>
                      <td>{a.animal?.species || "N/A"}</td>
                      <td>{a.quantity}</td>
                      <td>
                        <Badge bg={a.status === "pending" ? "warning" : "success"}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="text-success mb-3 fw-bold">🐄 Vaccinations Done</h5>
              <Table striped bordered hover responsive>
                <thead className="table-success">
                  <tr>
                    <th>#</th>
                    <th>Animal</th>
                    <th>Vaccine</th>
                    <th>Date</th>
                    <th>Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVaccinations.map((v, i) => (
                    <tr key={v.id}>
                      <td>{i + 1}</td>
                      <td>{v.animal?.tag || "N/A"}</td>
                      <td>{v.vaccine?.name || "N/A"}</td>
                      <td>{new Date(v.date_administered).toLocaleDateString()}</td>
                      <td>{v.officer?.name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="text-success mb-3 fw-bold">💰 Financial Disbursements</h5>
              <Table striped bordered hover responsive>
                <thead className="table-success">
                  <tr>
                    <th>#</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Paid On</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDisbursements.map((d, i) => (
                    <tr key={d.id}>
                      <td>{i + 1}</td>
                      <td>{d.purpose}</td>
                      <td>৳{d.amount}</td>
                      <td>{new Date(d.paid_on).toLocaleDateString()}</td>
                      <td>{d.reference_no}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
