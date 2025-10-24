import React, { useEffect, useState, useRef } from "react";
import api from "../../api/client";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const AdminVaccinePage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalType, setModalType] = useState(null);
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // Fetch vaccines
  const fetchVaccines = async (pageNo = 1, query = "", includeDeleted = showDeleted) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/vaccines?page=${pageNo}&search=${query}&show_deleted=${includeDeleted ? "true" : "false"}`
      );
      const data = res.data;
      setVaccines(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch vaccines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, [showDeleted]);

  // Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchVaccines(1, search);
  };

  // Delete vaccine
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vaccine?")) return;
    try {
      await api.delete(`/vaccines/${id}`);
      alert("🗑️ Vaccine deleted successfully!");
      fetchVaccines(page, search);
    } catch (err) {
      console.error("Failed to delete vaccine:", err);
    }
  };

  // Restore vaccine
  const handleRestore = async (id) => {
    if (!window.confirm("Restore this vaccine?")) return;
    try {
      await api.put(`/vaccines/${id}/restore`);
      alert("♻️ Vaccine restored successfully!");
      fetchVaccines(page, search);
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  // Show details
  const openVaccineDetails = async (vaccine) => {
    try {
      const res = await api.get(`/vaccines/${vaccine.id}`);
      setSelectedVaccine(res.data);
      setBatches(res.data.batches || []);
      setModalType("details");
      openModal();
    } catch (err) {
      console.error("Failed to load vaccine details:", err);
    }
  };

  // Add batch modal
  const openAddBatchModal = (vaccine) => {
    setSelectedVaccine(vaccine);
    setModalType("addBatch");
    openModal();
  };

  // Add new batch
  const handleAddBatch = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      vaccine_id: selectedVaccine.id,
      batch_no: form.batch_no.value,
      expiry_date: form.expiry_date.value,
      quantity: form.quantity.value,
      cost_per_unit: form.cost_per_unit.value,
    };
    try {
      await api.post("/stock/batches", data);
      alert("✅ Batch added successfully!");
      closeModal();
      openVaccineDetails(selectedVaccine);
    } catch (err) {
      console.error("Failed to add batch:", err);
      alert("Failed to add batch.");
    }
  };

  // Modal controls
  const openModal = () => {
    modalInstance.current = new bootstrap.Modal(modalRef.current, {
      backdrop: "static",
    });
    modalInstance.current.show();
  };

  const closeModal = () => {
    if (modalInstance.current) modalInstance.current.hide();
    setSelectedVaccine(null);
    setModalType(null);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">💉 Vaccine Management</h3>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="d-flex align-items-center gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search vaccines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {/* Toggle deleted */}
      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="showDeleted"
          checked={showDeleted}
          onChange={(e) => setShowDeleted(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="showDeleted">
          Show Deleted Vaccines
        </label>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle table-striped">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Unit</th>
                <th>Cost (৳)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.length > 0 ? (
                vaccines.map((v, i) => (
                  <tr key={v.id}>
                    <td>{i + 1}</td>
                    <td>{v.name}</td>
                    <td>{v.manufacturer}</td>
                    <td>{v.unit}</td>
                    <td>{v.cost_per_unit}</td>
                    <td>
                      <span
                        className={`badge ${v.is_active ? "bg-success" : "bg-secondary"}`}
                      >
                        {v.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {!v.deleted_at ? (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openVaccineDetails(v)}
                          >
                            👁 View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            onClick={() => openAddBatchModal(v)}
                          >
                            ➕ Add Batch
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(v.id)}
                          >
                            🗑 Delete
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleRestore(v.id)}
                        >
                          ♻️ Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No vaccines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={page <= 1}
          onClick={() => fetchVaccines(page - 1)}
        >
          &laquo; Prev
        </button>
        <span>
          Page {page} of {lastPage}
        </span>
        <button
          className="btn btn-outline-primary"
          disabled={page >= lastPage}
          onClick={() => fetchVaccines(page + 1)}
        >
          Next &raquo;
        </button>
      </div>

      {/* Modal */}
      <div className="modal fade" id="vaccineModal" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Details Modal */}
            {modalType === "details" && selectedVaccine && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Vaccine Details - {selectedVaccine.name}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Manufacturer:</strong> {selectedVaccine.manufacturer}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedVaccine.description || "N/A"}
                  </p>

                  <h6 className="mt-4">📦 Batches</h6>
                  {batches.length > 0 ? (
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Batch No</th>
                          <th>Expiry</th>
                          <th>Quantity</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batches.map((b, i) => (
                          <tr
                            key={b.id}
                            className={
                              new Date(b.expiry_date) < new Date()
                                ? "table-danger"
                                : ""
                            }
                          >
                            <td>{i + 1}</td>
                            <td>{b.batch_no}</td>
                            <td>{b.expiry_date}</td>
                            <td>{b.quantity}</td>
                            <td>{b.cost_per_unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted">No batch data available.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}

            {/* Add Batch Modal */}
            {modalType === "addBatch" && selectedVaccine && (
              <form onSubmit={handleAddBatch}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Add Batch for {selectedVaccine.name}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Batch No</label>
                    <input type="text" name="batch_no" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" name="expiry_date" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input type="number" name="quantity" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cost per Unit (৳)</label>
                    <input type="number" name="cost_per_unit" className="form-control" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Batch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVaccinePage;
