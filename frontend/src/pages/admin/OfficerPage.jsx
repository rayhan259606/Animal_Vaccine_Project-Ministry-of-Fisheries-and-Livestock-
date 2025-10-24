import React, { useEffect, useState, useRef } from "react";
import api from "../../api/client";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const OfficerPage = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
  });

  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // 🧭 Fetch Officers with pagination & search
  const fetchOfficers = async (pageNo = 1, query = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/officers?page=${pageNo}&search=${query}`);
      const data = res.data;
      setOfficers(data.data || []);
      setPage(data.current_page);
      setLastPage(data.last_page);
    } catch (err) {
      console.error("Failed to load officers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers(page, search);
  }, [page]);

  // 🧾 Handle Form Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔘 Open Modal
  const openModal = (officer = null) => {
    if (officer) {
      setEditMode(true);
      setCurrentId(officer.id);
      setForm({
        name: officer.name || "",
        email: officer.email || "",
        phone: officer.phone || "",
        designation: officer.designation || "",
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setForm({ name: "", email: "", phone: "", designation: "" });
    }

    modalInstance.current = new bootstrap.Modal(modalRef.current, {
      backdrop: "static",
    });
    modalInstance.current.show();
  };

  // 🔘 Close Modal
  const closeModal = () => {
    if (modalInstance.current) modalInstance.current.hide();
  };

  // 🆕 Add or Update Officer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentId) {
        await api.put(`/officers/${currentId}`, form);
        alert("✅ Officer updated successfully!");
      } else {
        const payload = { ...form, password: "password" };
        await api.post("/officers", payload);
        alert("✅ Officer added successfully! Default password: password");
      }
      closeModal();
      fetchOfficers(page, search);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save officer. Check console for details.");
    }
  };

  // ❌ Delete Officer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this officer?")) return;
    try {
      await api.delete(`/officers/${id}`);
      alert("🗑️ Officer deleted!");
      fetchOfficers(page, search);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete officer");
    }
  };

  // 🔁 Restore Officer
  const handleRestore = async (id) => {
    try {
      await api.put(`/users/${id}/restore`);
      alert("♻️ Officer restored successfully!");
      fetchOfficers(page, search);
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore officer");
    }
  };

  // 🔍 Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOfficers(1, search);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Officer Management</h3>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add Officer
        </button>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="d-flex align-items-center gap-2 mb-3"
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search officer by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {/* Loader */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Upazila</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {officers.length > 0 ? (
                  officers.map((officer, index) => (
                    <tr
                      key={officer.id}
                      className={officer.deleted_at ? "table-danger" : ""}
                    >
                      <td>{index + 1}</td>
                      <td>{officer.name}</td>
                      <td>{officer.email}</td>
                      <td>{officer.phone || "-"}</td>
                      <td>{officer.upazila|| "-"}</td>
                      <td>
                        {officer.deleted_at ? (
                          <span className="badge bg-danger">Deleted</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td>
                        {!officer.deleted_at ? (
                          <>
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => openModal(officer)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(officer.id)}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleRestore(officer.id)}
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No officers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              &laquo; Prev
            </button>
            <span>
              Page {page} of {lastPage}
            </span>
            <button
              className="btn btn-outline-primary"
              disabled={page >= lastPage}
              onClick={() => setPage(page + 1)}
            >
              Next &raquo;
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      <div className="modal fade" id="officerModal" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Edit Officer" : "Add Officer"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={editMode}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>



                {!editMode && (
                  <div className="alert alert-info py-2 mt-3 mb-0">
                    <small>
                      <strong>Default Password:</strong>{" "}
                      <code>password</code>
                    </small>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerPage;
