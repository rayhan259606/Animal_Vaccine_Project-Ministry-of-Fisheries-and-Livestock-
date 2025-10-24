import React, { useEffect, useState } from "react";
import { Table, Card, Spinner, Badge } from "react-bootstrap";
import api from "../../api/client";

export default function FarmerAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const res = await api.get("/allocations");
      setAllocations(res.data);
    } catch (error) {
      console.error("Failed to load allocations:", error);
      alert("Failed to load allocations!");
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    const colors = {
      pending: "warning",
      allocated: "info",
      issued: "success",
      administered: "primary",
      cancelled: "danger",
    };
    const color = colors[status] || "secondary";
    return <Badge bg={color}>{status.toUpperCase()}</Badge>;
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success">📦 My Vaccine Allocations</h3>
        <button className="btn btn-outline-success" onClick={fetchAllocations}>
          🔄 Refresh
        </button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-success">
              <tr>
                <th>#</th>
                <th>Vaccine Name</th>
                <th>Farm</th>
                <th>Animal (Tag)</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Allocated By</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No allocations found.
                  </td>
                </tr>
              ) : (
                allocations.map((a, i) => (
                  <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td>{a.vaccine?.name || "N/A"}</td>
                    <td>{a.farm?.name || "N/A"}</td>

                    {/* ✅ Animal Name & Tag */}
                    <td>
                      {a.animal
                        ? `${a.animal.species || "Animal"} (${a.animal.tag || "No Tag"})`
                        : "N/A"}
                    </td>

                    <td>{a.quantity}</td>
                    <td>{renderStatus(a.status)}</td>

                    {/* ✅ Officer/Admin info */}
                    <td>{a.allocated_by ? a.allocated_by.name : "—"}</td>
                    <td>{a.allocated_by ? a.allocated_by.phone || "N/A" : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
