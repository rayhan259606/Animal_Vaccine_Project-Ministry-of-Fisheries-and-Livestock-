import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ Token এবং Role LocalStorage এ সংরক্ষণ করো
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

     // alert("✅ Login successful!");

      // ✅ Role অনুযায়ী Redirect করো
      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "officer") {
        navigate("/officer/dashboard");
      } else if (res.data.role === "farmer") {
        navigate("/farmerdashboard");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      setError("Invalid credentials, please try again.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="shadow p-4" style={{ width: "25rem" }}>
        <h3 className="text-center mb-4 text-primary">Login</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" className="w-100 mt-2">
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
