import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import api from "../api/client";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nid: "",
    address_line: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    password: "",
    password_confirmation: "",
    image: null, // 🖼️ added
  });

  const [preview, setPreview] = useState(null); // image preview
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file)); // show image preview
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Create form data
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await api.post("/auth/register-farmer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("🎉 Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      setError("Registration failed. Please check your information.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card className="shadow p-4 w-100" style={{ maxWidth: "850px" }}>
        <h3 className="text-center mb-4 text-success fw-bold">🐄 Farmer Registration</h3>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleRegister} encType="multipart/form-data">
          {/* === IMAGE UPLOAD === */}
         

          {/* === BASIC INFO === */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* === CONTACT INFO === */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 017XXXXXXXX"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>NID Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter NID"
                  onChange={(e) => setForm({ ...form, nid: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* === ADDRESS INFO === */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Division</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter division"
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>District</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter district"
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Upazila</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter upazila"
                  onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Union</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter union"
                  onChange={(e) => setForm({ ...form, union: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Village</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter village"
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address Line</Form.Label>
            <Form.Control
              type="text"
              placeholder="House/Road details"
              onChange={(e) => setForm({ ...form, address_line: e.target.value })}
            />
          </Form.Group>

          {/* === PASSWORD === */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
             <Form.Group className="mb-4 text-center">
            <Form.Label className="fw-semibold">Upload Profile Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 rounded-circle"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
            )}
          </Form.Group>
          </Row>

          <Button variant="success" type="submit" className="w-100 mt-2">
            Register
          </Button>
        </Form>

        <p className="text-center mt-3">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </Card>
    </Container>
  );
}
