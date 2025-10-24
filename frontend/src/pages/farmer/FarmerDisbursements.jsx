import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Badge, Button } from "react-bootstrap";
import api from "../../api/client";

export default function FarmerDisbursements() {
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisbursements();
  }, []);

  const fetchDisbursements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/disbursements");
      // Backend pagination structure (Laravel)
      setDisbursements(res.data.data || res.data);
    } catch (err) {
      console.error("❌ Failed to load disbursements:", err);
      alert("Failed to fetch disbursement data!");
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "paid":
        return <Badge bg="success">Paid</Badge>;
      case "approved":
        return <Badge bg="info">Approved</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-success">💰 Financial Disbursements</h3>
        <Button variant="outline-success" onClick={fetchDisbursements}>
          🔄 Refresh
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-success text-center">
              <tr>
                <th>#</th>
                <th>Budget Name</th>
                <th>Farm</th>
                <th>Amount (৳)</th>
                <th>Purpose</th>
                <th>Paid On</th>
                <th>Officer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.length > 0 ? (
                disbursements.map((d, i) => (
                  <tr key={d.id} className="align-middle text-center">
                    <td>{i + 1}</td>

                    {/* ✅ Budget Name */}
                    <td>{d.budget?.name || "N/A"}</td>

                    {/* ✅ Farm */}
                    <td>{d.farm?.name || "N/A"}</td>

                    {/* ✅ Amount */}
                    <td>
                      <strong>{d.amount?.toLocaleString() || 0}</strong>
                    </td>

                    {/* ✅ Purpose */}
                    <td>{d.purpose || "N/A"}</td>

                    {/* ✅ Paid On */}
                    <td>
                      {d.paid_on
                        ? new Date(d.paid_on).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* ✅ Officer Info */}
                    <td>
                      {d.disbursed_by_user ? (
                        <>
                          <div className="fw-semibold text-success">
                            {d.disbursed_by_user.name}
                          </div>
                          <div className="small text-muted">
                            {d.disbursed_by_user.phone || "No phone"}
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    {/* ✅ Status */}
                    <td>{renderStatus(d.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No disbursement records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
