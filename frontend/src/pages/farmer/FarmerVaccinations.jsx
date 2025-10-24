import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Button } from "react-bootstrap";
import api from "../../api/client";

export default function FarmerVaccinations() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vaccinations");
      setRecords(res.data.data || res.data);
    } catch (error) {
      console.error("❌ Fetch failed:", error);
      alert("Failed to load vaccination records!");
    } finally {
      setLoading(false);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success">💉 Completed Vaccinations</h3>
        <Button variant="outline-success" onClick={fetchVaccinations}>
          🔄 Refresh
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white fw-bold">
          ✅ Vaccination Records
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Vaccine</th>
                <th>Animal</th>
                <th>Dose (ml)</th>
                <th>Date</th>
                <th>Officer Name</th>
                <th>Officer Contact</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No vaccination records found.
                  </td>
                </tr>
              ) : (
                records.map((v, i) => (
                  <tr key={v.id}>
                    <td>{i + 1}</td>
                    <td>{v.vaccine?.name || "N/A"}</td>
                    <td>
                      {v.animal
                        ? `${v.animal.species || "Animal"} (${v.animal.tag || "Tag N/A"})`
                        : "N/A"}
                    </td>
                    <td>{v.dose || "-"}</td>
                    <td>{new Date(v.date_administered).toLocaleDateString()}</td>
                    <td>{v.officer?.name || "N/A"}</td>
                    <td>{v.officer?.phone || "N/A"}</td>
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
