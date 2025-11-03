import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Spinner,
  Button,
  Badge,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch allocations
  const fetchAllocations = async () => {
    try {
      const res = await api.get("/allocations");
      setAllocations(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch allocations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  // ✅ Update status (approve/cancel/reapprove)
  const handleUpdateStatus = async (id, newStatus) => {
    const confirmText =
      newStatus === "allocated"
        ? "✅ Are you sure you want to APPROVE this request?"
        : "❌ Are you sure you want to CANCEL this allocation?";

    if (!window.confirm(confirmText)) return;

    try {
      await api.put(`/allocations/${id}/status`, { status: newStatus });
      alert(
        newStatus === "allocated"
          ? "✅ Request approved successfully!"
          : "❌ Allocation cancelled successfully!"
      );
      fetchAllocations();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("❌ Something went wrong!");
    }
  };

  const handleView = (item) => {
    setSelected(item);
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <Container fluid className="py-5" style={{ background: "#f8fff8" }}>
      <Container>
        <Card className="shadow border-0 rounded-4">
          <Card.Header className="bg-success text-white fw-bold fs-5">
            📦 Vaccine Allocations ({allocations.length})
          </Card.Header>
          <Card.Body>
            {allocations.length === 0 ? (
              <div className="text-center text-muted py-5">
                No allocation requests found.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className="align-middle text-center">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Farm</th>
                      <th>Farmer</th>
                      <th>Vaccine</th>
                      <th>Animal</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((a, i) => (
                      <tr key={a.id}>
                        <td>{i + 1}</td>
                        <td>{a.farm?.name || "N/A"}</td>
                        <td>{a.farmer?.user?.name || "N/A"}</td>
                        <td>{a.vaccine?.name || "N/A"}</td>
                        <td>{a.animal?.tag || "-"}</td>
                        <td>{a.quantity}</td>
                        <td>
                          <Badge
                            bg={
                              a.status === "pending"
                                ? "warning"
                                : a.status === "allocated"
                                ? "success"
                                : a.status === "issued"
                                ? "info"
                                : a.status === "cancelled"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {a.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{new Date(a.created_at).toLocaleString()}</td>
                        <td>
                          <Button
                            variant="outline-success"
                            size="sm"
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

      {/* === Allocation Details Modal === */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">
            📋 Allocation Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected ? (
            <>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Farm:</strong> {selected.farm?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Farmer:</strong> {selected.farmer?.user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Vaccine:</strong> {selected.vaccine?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Animal Tag:</strong> {selected.animal?.tag || "-"}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {selected.quantity}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={
                        selected.status === "pending"
                          ? "warning"
                          : selected.status === "allocated"
                          ? "success"
                          : selected.status === "cancelled"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {selected.status.toUpperCase()}
                    </Badge>
                  </p>
                  <p>
                    <strong>Requested:</strong>{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Approved By:</strong>{" "}
                    {selected.allocated_by
                      ? selected.allocated_by.name || "Officer"
                      : "Not yet"}
                  </p>
                  {selected.batch && (
                    <>
                      <p>
                        <strong>Batch No:</strong>{" "}
                        {selected.batch?.batch_no || "N/A"}
                      </p>
                      <p>
                        <strong>Batch Expiry:</strong>{" "}
                        {new Date(
                          selected.batch?.expiry_date
                        ).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </Col>
              </Row>

              <hr />

              {/* ✅ Action Buttons */}
              <div className="text-end mt-3">
                {selected.status === "pending" ? (
                  <>
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={() =>
                        handleUpdateStatus(selected.id, "allocated")
                      }
                    >
                      ✅ Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        handleUpdateStatus(selected.id, "cancelled")
                      }
                    >
                      ❌ Reject
                    </Button>
                  </>
                ) : selected.status === "allocated" ? (
                  <Button
                    variant="outline-danger"
                    onClick={() =>
                      handleUpdateStatus(selected.id, "cancelled")
                    }
                  >
                    🔁 Cancel Allocation
                  </Button>
                ) : selected.status === "cancelled" ? (
                  <Button
                    variant="outline-success"
                    onClick={() =>
                      handleUpdateStatus(selected.id, "allocated")
                    }
                  >
                    🔁 Re-Approve Allocation
                  </Button>
                ) : (
                  <Badge bg="info" className="p-2">
                    This request is {selected.status}.
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-muted">No data found.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
