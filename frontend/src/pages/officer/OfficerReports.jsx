import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Badge,
  ProgressBar,
  Table,
  Button,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerReports() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  // 🔹 Fetch report data from API
  const fetchReport = async () => {
    try {
      const res = await api.get("/reports/financials");
      setReport(res.data);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  const totalAmount = report?.total_amount || 0;
  const totalCount = report?.total_count || 0;
  const byStatus = report?.by_status || [];
  const byMonth = report?.by_month || [];

  // 🔹 Month helper
  const monthName = (num) =>
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][num - 1] || "";

  // 🔹 Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-success mb-0">📊 Officer Disbursement Reports</h4>
        <Button variant="outline-primary" onClick={handlePrint}>
          🖨️ Print / Export PDF
        </Button>
      </div>

      <Row className="g-4">
        {/* ========== Summary Card ========== */}
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-success text-white fw-bold">
              💰 Financial Summary
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Total Disbursement:</strong>{" "}
                <Badge bg="success">৳{totalAmount.toLocaleString()}</Badge>
              </p>
              <p>
                <strong>Total Transactions:</strong>{" "}
                <Badge bg="info">{totalCount}</Badge>
              </p>
              <hr />
              <p className="fw-bold mb-2">Status Breakdown:</p>
              {byStatus.length === 0 ? (
                <p className="text-muted">No data available.</p>
              ) : (
                byStatus.map((s, i) => (
                  <div key={i} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge
                        bg={
                          s.status === "approved"
                            ? "success"
                            : s.status === "cancelled"
                            ? "danger"
                            : s.status === "paid"
                            ? "primary"
                            : "secondary"
                        }
                      >
                        {s.status.toUpperCase()}
                      </Badge>
                      <span>
                        ৳{s.total?.toLocaleString()} ({s.count})
                      </span>
                    </div>
                    <ProgressBar
                      now={(s.total / totalAmount) * 100}
                      variant={
                        s.status === "approved"
                          ? "success"
                          : s.status === "cancelled"
                          ? "danger"
                          : "info"
                      }
                      style={{ height: "8px" }}
                    />
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ========== Monthly Summary ========== */}
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-primary text-white fw-bold">
              📅 Monthly Disbursement Summary
            </Card.Header>
            <Card.Body>
              {byMonth.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No monthly data available.
                </div>
              ) : (
                <Table bordered hover responsive className="align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Month</th>
                      <th>Total Transactions</th>
                      <th>Total Amount (৳)</th>
                      <th>Contribution (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byMonth.map((m, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{monthName(m.month)}</td>
                        <td>{m.count}</td>
                        <td>৳{m.total?.toLocaleString()}</td>
                        <td>
                          <ProgressBar
                            now={(m.total / totalAmount) * 100}
                            variant="success"
                            label={`${((m.total / totalAmount) * 100).toFixed(1)}%`}
                            style={{ height: "8px" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ========== Status Details Table ========== */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-secondary text-white fw-bold">
              📋 Status-wise Details
            </Card.Header>
            <Card.Body>
              {byStatus.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No status data to display.
                </div>
              ) : (
                <Table bordered hover responsive className="align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Total Amount (৳)</th>
                      <th>Percent of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byStatus.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>
                          <Badge
                            bg={
                              row.status === "approved"
                                ? "success"
                                : row.status === "cancelled"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {row.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{row.count}</td>
                        <td>৳{row.total?.toLocaleString()}</td>
                        <td>
                          {((row.total / totalAmount) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ========== Footer ========== */}
      <div className="text-center text-muted small mt-4">
        Generated on: {new Date().toLocaleString()}
      </div>
    </Container>
  );
}
