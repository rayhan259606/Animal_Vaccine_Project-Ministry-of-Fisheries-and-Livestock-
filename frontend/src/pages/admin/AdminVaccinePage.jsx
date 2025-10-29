import React, { useEffect, useState } from "react";
import api from "../../api/client";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminVaccinePage() {
  const [vaccines, setVaccines] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    unit: "dose",
    dose_ml: "",
    cost_per_unit: "",
    description: "",
  });
  const [batches, setBatches] = useState([]);
  const [batchForm, setBatchForm] = useState({
    vaccine_id: "",
    batch_no: "",
    expiry_date: "",
    quantity: "",
    cost_per_unit: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Format date (remove T, Z)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  // =========================
  // Fetch All Vaccines with Pagination
  // =========================
  const fetchVaccines = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/vaccines?page=${page}`);
      setVaccines(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
      });
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching vaccines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  // =========================
  // Vaccine CRUD
  // =========================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedVaccine) {
        await api.put(`/vaccines/${selectedVaccine.id}`, formData);
        alert("✅ Vaccine updated successfully!");
      } else {
        await api.post("/vaccines", formData);
        alert("✅ Vaccine added successfully!");
      }
      resetForm();
      fetchVaccines(pagination.current_page);
    } catch (err) {
      alert("❌ Error saving vaccine");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      manufacturer: "",
      unit: "dose",
      dose_ml: "",
      cost_per_unit: "",
      description: "",
    });
    setSelectedVaccine(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this vaccine?")) return;
    await api.delete(`/vaccines/${id}`);
    fetchVaccines(pagination.current_page);
  };

  const handleRestore = async (id) => {
    await api.put(`/vaccines/${id}/restore`);
    fetchVaccines(pagination.current_page);
  };

  // =========================
  // Batch CRUD
  // =========================
  const fetchBatches = async (vaccineId) => {
    try {
      const res = await api.get(`/vaccine-batches?vaccine_id=${vaccineId}`);
      setBatches(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Error loading batches");
    }
  };

  const handleBatchChange = (e) =>
    setBatchForm({ ...batchForm, [e.target.name]: e.target.value });

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    try {
      if (batchForm.id) {
        await api.put(`/vaccine-batches/${batchForm.id}`, batchForm);
        alert("✅ Batch updated!");
      } else {
        await api.post("/vaccine-batches", batchForm);
        alert("✅ Batch added!");
      }
      fetchBatches(batchForm.vaccine_id);
      resetBatchForm();
    } catch (err) {
      alert("❌ Error saving batch");
    }
  };

  const resetBatchForm = () =>
    setBatchForm({
      vaccine_id: "",
      batch_no: "",
      expiry_date: "",
      quantity: "",
      cost_per_unit: "",
    });

  const handleDeleteBatch = async (id, vaccineId) => {
    if (!window.confirm("Are you sure to delete this batch?")) return;
    await api.delete(`/vaccine-batches/${id}`);
    fetchBatches(vaccineId);
  };

  const handleRestoreBatch = async (id, vaccineId) => {
    await api.put(`/vaccine-batches/${id}/restore`);
    fetchBatches(vaccineId);
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">💉 Vaccine & Batch Management</h3>

      {/* Add/Edit Vaccine */}
      <form onSubmit={handleSave} className="border p-3 rounded bg-light mb-4">
        <h5>{selectedVaccine ? "Edit Vaccine" : "Add New Vaccine"}</h5>
        <div className="row">
          <div className="col-md-3 mb-2">
            <input
              className="form-control"
              name="name"
              placeholder="Vaccine Name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              className="form-control"
              name="manufacturer"
              placeholder="Manufacturer"
              value={formData.manufacturer || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              type="number"
              className="form-control"
              name="dose_ml"
              placeholder="Dose (ml)"
              value={formData.dose_ml || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              type="number"
              className="form-control"
              name="cost_per_unit"
              placeholder="Cost/Unit"
              value={formData.cost_per_unit || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-2">
            <button className="btn btn-primary w-100" disabled={loading}>
              {selectedVaccine ? "Update" : "Add"}
            </button>
          </div>
        </div>
        <textarea
          className="form-control mb-2"
          name="description"
          placeholder="Description"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </form>

      {/* Vaccine List */}
      <h5>All Vaccines</h5>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vaccines.map((v, i) => (
            <tr key={v.id} className={v.deleted_at ? "table-secondary" : ""}>
              <td>{(pagination.current_page - 1) * 15 + (i + 1)}</td>
              <td>{v.name}</td>
              <td>{v.manufacturer || "-"}</td>
              <td>{v.deleted_at ? "Deleted" : "Active"}</td>
              <td>
                {!v.deleted_at ? (
                  <>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => {
                        setSelectedVaccine(v);
                        setFormData(v);
                        setBatchForm({ ...batchForm, vaccine_id: v.id });
                        fetchBatches(v.id);
                      }}
                    >
                      Batches
                    </button>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        setSelectedVaccine(v);
                        setFormData(v);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(v.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleRestore(v.id)}
                  >
                    Restore
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3">
        <button
          className="btn btn-secondary me-2"
          disabled={pagination.current_page === 1}
          onClick={() => fetchVaccines(pagination.current_page - 1)}
        >
          Prev
        </button>
        <span className="align-self-center">
          Page {pagination.current_page} of {pagination.last_page}
        </span>
        <button
          className="btn btn-secondary ms-2"
          disabled={pagination.current_page === pagination.last_page}
          onClick={() => fetchVaccines(pagination.current_page + 1)}
        >
          Next
        </button>
      </div>

      {/* Batch Section */}
      {selectedVaccine && (
        <div className="mt-5">
          <h5>📦 Batches for: {selectedVaccine.name}</h5>
          <form onSubmit={handleSaveBatch} className="border p-3 bg-light rounded mb-3">
            <div className="row">
              <div className="col-md-3 mb-2">
                <input
                  className="form-control"
                  name="batch_no"
                  placeholder="Batch No"
                  value={batchForm.batch_no || ""}
                  onChange={handleBatchChange}
                />
              </div>
              <div className="col-md-3 mb-2">
                <input
                  type="date"
                  className="form-control"
                  name="expiry_date"
                  value={formatDate(batchForm.expiry_date)}
                  onChange={handleBatchChange}
                  required
                />
              </div>
              <div className="col-md-2 mb-2">
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  placeholder="Qty"
                  value={batchForm.quantity || ""}
                  onChange={handleBatchChange}
                  required
                />
              </div>
              <div className="col-md-2 mb-2">
                <input
                  type="number"
                  className="form-control"
                  name="cost_per_unit"
                  placeholder="Cost/Unit"
                  value={batchForm.cost_per_unit || ""}
                  onChange={handleBatchChange}
                />
              </div>
              <div className="col-md-2 mb-2">
                <button className="btn btn-primary w-100">
                  {batchForm.id ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </form>

          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Batch No</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b, i) => (
                <tr key={b.id} className={b.deleted_at ? "table-secondary" : ""}>
                  <td>{i + 1}</td>
                  <td>{b.batch_no}</td>
                  <td>{formatDate(b.expiry_date)}</td>
                  <td>{b.quantity}</td>
                  <td>{b.cost_per_unit}</td>
                  <td>{b.deleted_at ? "Deleted" : "Active"}</td>
                  <td>
                    {!b.deleted_at ? (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => setBatchForm(b)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteBatch(b.id, selectedVaccine.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleRestoreBatch(b.id, selectedVaccine.id)}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
