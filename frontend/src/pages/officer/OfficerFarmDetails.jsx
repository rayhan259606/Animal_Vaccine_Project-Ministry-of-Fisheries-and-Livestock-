import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Table,
  Badge,
  Button,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerFarmDetails() {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmDetails();
  }, [id]);

  const fetchFarmDetails = async () => {
    try {
      const res = await api.get(`/farms/${id}`);
      setFarm(res.data.farm);
      setSummary(res.data.vaccination_summary);
    } catch (error) {
      console.error("❌ Failed to fetch farm details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (!farm) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger fw-bold">Farm not found!</p>
        <Link to="/officer/farms" className="btn btn-outline-success">
          ← Back to Farms
        </Link>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="py-4"
      style={{ background: "linear-gradient(180deg, #f8fff8, #eafbea)" }}
    >
      <Container>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-success mb-0">🏡 {farm.name}</h3>
          <Link to="/officer/farms" className="btn btn-outline-success btn-sm">
            ← Back to Assigned Farms
          </Link>
        </div>

        {/* FARM DETAILS */}
        <Card className="shadow-sm border-0 rounded-4 mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Registration No:</strong> {farm.registration_no}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge bg={farm.status === "active" ? "success" : "secondary"}>
                    {farm.status || "N/A"}
                  </Badge>
                </p>
                <p>
                  <strong>Division:</strong> {farm.division || "N/A"}
                </p>
                <p>
                  <strong>District:</strong> {farm.district || "N/A"}
                </p>
                <p>
                  <strong>Upazila:</strong> {farm.upazila || "N/A"}
                </p>
              </Col>

              <Col md={6}>
                <p>
                  <strong>Union:</strong> {farm.union || "N/A"}
                </p>
                <p>
                  <strong>Village:</strong> {farm.village || "N/A"}
                </p>
                <p>
                  <strong>Latitude:</strong> {farm.latitude || "N/A"}
                </p>
                <p>
                  <strong>Longitude:</strong> {farm.longitude || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(farm.created_at).toLocaleDateString()}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* FARMER INFO */}
        <Card className="shadow-sm border-0 rounded-4 mb-4">
          <Card.Header className="bg-success text-white fw-bold">
            👨‍🌾 Farmer Information
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Name:</strong> {farm.farmer?.user?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {farm.farmer?.user?.email || "N/A"}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Phone:</strong> {farm.farmer?.user?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {farm.farmer?.user?.address_line || "N/A"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ANIMAL & VACCINATION SUMMARY */}
        <Card className="shadow-sm border-0 rounded-4 mb-4">
          <Card.Header className="bg-success text-white fw-bold">
            🐄 Vaccination Summary
          </Card.Header>
          <Card.Body>
            {summary ? (
              <Row>
                <Col md={3}>
                  <Card className="text-center shadow-sm border-0 bg-light">
                    <Card.Body>
                      <h4 className="text-success fw-bold">{summary.total_animals}</h4>
                      <p className="text-muted mb-0">Total Animals</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center shadow-sm border-0 bg-light">
                    <Card.Body>
                      <h4 className="text-success fw-bold">{summary.vaccinated}</h4>
                      <p className="text-muted mb-0">Vaccinated</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center shadow-sm border-0 bg-light">
                    <Card.Body>
                      <h4 className="text-warning fw-bold">{summary.pending}</h4>
                      <p className="text-muted mb-0">Pending</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center shadow-sm border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-success fw-bold">
                        {summary.last_vaccination_date
                          ? new Date(summary.last_vaccination_date).toLocaleDateString()
                          : "N/A"}
                      </h6>
                      <p className="text-muted mb-0">Last Vaccination</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            ) : (
              <p className="text-muted">No vaccination summary available.</p>
            )}
          </Card.Body>
        </Card>

        {/* ANIMAL LIST */}
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Header className="bg-success text-white fw-bold">
            🐮 Animal List
          </Card.Header>
          <Card.Body>
            {farm.animals && farm.animals.length > 0 ? (
              <Table bordered hover responsive className="mb-0">
                <thead className="table-success">
                  <tr>
                    <th>#</th>
                    <th>Tag</th>
                    <th>Species</th>
                    <th>Breed</th>
                    <th>Sex</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {farm.animals.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td>{a.tag || "N/A"}</td>
                      <td>{a.species || "N/A"}</td>
                      <td>{a.breed || "N/A"}</td>
                      <td>{a.sex || "N/A"}</td>
                      <td>{a.status || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted">No animals registered yet.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}
