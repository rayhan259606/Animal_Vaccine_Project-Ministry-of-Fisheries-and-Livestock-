import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Image,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import api from "../../api/client";

export default function OfficerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Officer profile data fetch
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      setForm(res.data);
    } catch (error) {
      console.error("❌ Failed to load officer profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Officer profile update
const handleUpdate = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("_method", "PUT");

  Object.entries(form).forEach(([key, value]) => {
    if (value !== null && value !== undefined && key !== "image") {
      formData.append(key, value);
    }
  });

  if (image instanceof File) formData.append("image", image);

  try {
    const res = await api.post(`/officer/profile/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("✅ Profile updated successfully!");

    // ✅ Backend sends 'user', not 'officer'
    setUser(res.data.user);

    // ✅ Rebuild preview to force UI refresh
    if (res.data.user.image) {
      setPreview(`http://localhost:8000/uploads/officers/${res.data.user.image}`);
    }

    setShowModal(false);
    setImage(null);
  } catch (error) {
    console.error("❌ Profile update failed:", error.response?.data || error);
    alert("❌ Update failed. Please try again.");
  }
};


  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <Container
      fluid
      className="py-5"
      style={{ background: "linear-gradient(180deg, #f8fff8, #eafbea)" }}
    >
      <Container>
        <Card className="shadow border-0 rounded-4 overflow-hidden">
          <Card.Body>
            <Row>
              {/* LEFT SIDE: PROFILE IMAGE */}
              <Col md={4} className="text-center border-end">
                <Image
                  src={
                    user?.image
                      ? `http://localhost:8000/uploads/officers/${user.image}`
                      : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
                  roundedCircle
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                    border: "4px solid #28a745",
                  }}
                />
                <h5 className="mt-3 fw-bold text-success">{user?.name}</h5>
                <p className="text-muted">{user?.email}</p>
                <p className="text-secondary small">
                  <strong>Role:</strong>{" "}
                  <span className="badge bg-success">{user?.role}</span>
                </p>

                <Button
                  variant="success"
                  size="sm"
                  className="mt-2 px-4 fw-semibold"
                  onClick={() => setShowModal(true)}
                >
                  ✏️ Edit Profile
                </Button>
              </Col>

              {/* RIGHT SIDE: OFFICER DETAILS */}
              <Col md={8}>
                <h4 className="fw-bold text-success mb-3">
                  🧑‍💼 Officer Information
                </h4>

                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Phone:</strong> {user?.phone || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>NID:</strong> {user?.nid || "N/A"}
                    </p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Division:</strong> {user?.division || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>District:</strong> {user?.district || "N/A"}
                    </p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Upazila:</strong> {user?.upazila || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Union:</strong> {user?.union || "N/A"}
                    </p>
                  </Col>
                </Row>

                <p>
                  <strong>Address:</strong> {user?.address_line || "N/A"}
                </p>

                <p>
                  <strong>Joined At:</strong>{" "}
                  {new Date(user?.created_at).toLocaleDateString() || "N/A"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      {/* === EDIT MODAL === */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-success fw-bold">
            ✏️ Edit Officer Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={form.email || ""} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NID</Form.Label>
                  <Form.Control
                    name="nid"
                    value={form.nid || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Division</Form.Label>
                  <Form.Control
                    name="division"
                    value={form.division || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Control
                    name="district"
                    value={form.district || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Upazila</Form.Label>
                  <Form.Control
                    name="upazila"
                    value={form.upazila || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Union</Form.Label>
                  <Form.Control
                    name="union"
                    value={form.union || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address_line"
                value={form.address_line || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
              />
              {preview && (
                <Image
                  src={preview}
                  roundedCircle
                  className="mt-2"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              )}
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                💾 Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
