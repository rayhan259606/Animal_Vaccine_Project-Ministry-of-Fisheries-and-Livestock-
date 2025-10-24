import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Form, Badge } from "react-bootstrap";
import api from "../../api/client";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to load users", err);
      alert("Error loading users!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      alert("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete user!");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this user?")) return;
    try {
      await api.put(`/users/${id}/restore`);
      alert("✅ User restored successfully!");
      fetchUsers();
    } catch (err) {
      console.error("❌ Restore failed:", err);
      alert("Failed to restore user!");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = filter === "all" || u.role === filter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="fw-bold text-success mb-4">👤 User Management</h2>

      {/* === Filter Section === */}
      <Card className="shadow-sm mb-3">
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="officer">Officers</option>
              <option value="farmer">Farmers</option>
            </Form.Select>
            <Button variant="outline-success" onClick={fetchUsers}>
              🔄 Refresh
            </Button>
          </div>

          <Form.Control
            type="text"
            placeholder="🔍 Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "300px" }}
          />
        </Card.Body>
      </Card>

      {/* === User Table === */}
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-success text-center">
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>
                      <img
                        src={
                          u.image
                            ? `http://localhost:8000/uploads/${u.role}s/${u.image}`
                            : "/default-avatar.png"
                        }
                        alt="user"
                        width="45"
                        height="45"
                        className="rounded-circle border"
                      />
                    </td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <Badge
                        bg={
                          u.role === "admin"
                            ? "danger"
                            : u.role === "officer"
                            ? "info"
                            : "success"
                        }
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{u.phone || "N/A"}</td>
                    <td>
                      <Badge bg={u.deleted_at ? "secondary" : "success"}>
                        {u.deleted_at ? "Deleted" : "Active"}
                      </Badge>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {!u.deleted_at ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                        >
                          🗑️ Delete
                        </Button>
                      ) : (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleRestore(u.id)}
                        >
                          ♻️ Restore
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No users found.
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
