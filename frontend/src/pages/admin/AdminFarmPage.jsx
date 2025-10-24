import React, { useEffect, useState, useRef } from "react";
import api from "../../api/client";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const AdminFarmPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [modalType, setModalType] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // 🧭 Fetch Farms (with search + toggle)
  const fetchFarms = async (pageNo = 1, query = "", includeDeleted = showDeleted) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/farms?page=${pageNo}&search=${query}&show_deleted=${includeDeleted ? "true" : "false"}`
      );
      const data = res.data;
      setFarms(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (err) {
      console.error("❌ Failed to load farms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [showDeleted]);

  // 🔍 Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchFarms(1, search);
  };

  // 🗑️ Delete Farm
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this farm?")) return;
    try {
      await api.delete(`/farms/${id}`);
      alert("🗑️ Farm deleted successfully!");
      fetchFarms(page, search);
    } catch (err) {
      console.error("Failed to delete farm:", err);
    }
  };

  // ♻️ Restore Farm
  const handleRestore = async (id) => {
    if (!window.confirm("Restore this farm?")) return;
    try {
      await api.put(`/farms/${id}/restore`);
      alert("✅ Farm restored successfully!");
      fetchFarms(page, search);
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore farm.");
    }
  };

  // 👁 Show Farm Details (with vaccination summary)
  const openFarmDetails = async (farm) => {
    try {
      const res = await api.get(`/farms/${farm.id}`);
      setSelectedFarm(res.data.farm);
      setSelectedFarm((prev) => ({
        ...prev,
        vaccination_summary: res.data.vaccination_summary || null,
      }));
      setModalType("details");
      openModal();
    } catch (err) {
      console.error("Failed to load farm details:", err);
    }
  };

  // 🧑‍💼 Open Assign Officer Modal
  const openAssignModal = async (farm) => {
    try {
      setSelectedFarm(farm);
      setModalType("assign");
      const res = await api.get("/officers");
      setOfficers(res.data.data || []);
      openModal();
    } catch (err) {
      console.error("Failed to load officers:", err);
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedOfficer) {
      alert("Please select an officer first!");
      return;
    }
    try {
      await api.post(`/farms/${selectedFarm.id}/assign-officer`, {
        officer_id: selectedOfficer,
      });
      alert("✅ Officer assigned successfully!");
      closeModal();
      fetchFarms(page, search);
    } catch (err) {
      console.error("Failed to assign officer:", err);
    }
  };

  // 🗑 Remove officer
  const handleRemoveOfficer = async (officerId) => {
    if (!window.confirm("Remove this officer from farm?")) return;
    try {
      await api.post(`/farms/${selectedFarm.id}/remove-officer`, {
        officer_id: officerId,
      });
      alert("♻️ Officer removed successfully!");
      openFarmDetails(selectedFarm); // refresh modal
    } catch (err) {
      console.error("Failed to remove officer:", err);
    }
  };

  // 🪟 Modal Controls
  const openModal = () => {
    modalInstance.current = new bootstrap.Modal(modalRef.current, {
      backdrop: "static",
    });
    modalInstance.current.show();
  };
  const closeModal = () => {
    if (modalInstance.current) modalInstance.current.hide();
    setSelectedFarm(null);
    setSelectedOfficer("");
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">🏡 Farm Management</h3>

      {/* 🔍 Search bar */}
      <form onSubmit={handleSearch} className="d-flex align-items-center gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search farms by name or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {/* 🧩 Toggle deleted farms */}
      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="showDeleted"
          checked={showDeleted}
          onChange={(e) => setShowDeleted(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="showDeleted">
          Show Deleted Farms
        </label>
      </div>

      {/* 🌀 Loader */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Farm Name</th>
                <th>Farmer</th>
                <th>District</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {farms.length > 0 ? (
                farms.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td>{f.name}</td>
                    <td>{f.farmer?.user?.name || "-"}</td>
                    <td>{f.district || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          f.status === "active"
                            ? "bg-success"
                            : f.status === "pending"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {f.status || "unknown"}
                      </span>
                    </td>
                    <td>
                      {!f.deleted_at ? (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openFarmDetails(f)}
                          >
                            👁 Show
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            onClick={() => openAssignModal(f)}
                          >
                            🧑‍💼 Assign Officer
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(f.id)}
                          >
                            🗑 Delete
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleRestore(f.id)}
                        >
                          ♻️ Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No farms found.
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
          onClick={() => fetchFarms(page - 1)}
        >
          &laquo; Prev
        </button>
        <span>
          Page {page} of {lastPage}
        </span>
        <button
          className="btn btn-outline-primary"
          disabled={page >= lastPage}
          onClick={() => fetchFarms(page + 1)}
        >
          Next &raquo;
        </button>
      </div>

      {/* 🪟 Modal */}
      <div className="modal fade" id="farmModal" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Farm Details Modal */}
            {modalType === "details" && selectedFarm && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">Farm Details - {selectedFarm.name}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Farmer:</strong> {selectedFarm.farmer?.user?.name || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Email:</strong> {selectedFarm.farmer?.user?.email || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>District:</strong> {selectedFarm.district || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Upazila:</strong> {selectedFarm.upazila || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Village:</strong> {selectedFarm.village || "-"}
                    </div>

                    {/* 🧠 Vaccination Summary */}
                    <div className="col-md-12 mt-3">
                      <h6>💉 Vaccination Summary</h6>
                      {selectedFarm.vaccination_summary ? (
                        <ul className="list-group">
                          <li className="list-group-item">
                            🐄 Total Animals: {selectedFarm.vaccination_summary.total_animals}
                          </li>
                          <li className="list-group-item">
                            💉 Vaccinated: {selectedFarm.vaccination_summary.vaccinated}
                          </li>
                          <li className="list-group-item">
                            ⏳ Pending: {selectedFarm.vaccination_summary.pending}
                          </li>
                          <li className="list-group-item">
                            🗓️ Last Vaccination:{" "}
                            {selectedFarm.vaccination_summary.last_vaccination_date
                              ? selectedFarm.vaccination_summary.last_vaccination_date
                              : "No record"}
                          </li>
                        </ul>
                      ) : (
                        <p className="text-muted">No vaccination data available.</p>
                      )}
                    </div>

                    {/* Officer List */}
                    <div className="col-md-12 mt-3">
                      <strong>Assigned Officers:</strong>
                      <ul className="list-group mt-2">
                        {selectedFarm.officers?.length > 0 ? (
                          selectedFarm.officers.map((off) => (
                            <li
                              key={off.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              {off.name} ({off.email})
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveOfficer(off.id)}
                              >
                                Remove
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="list-group-item text-muted">No officers assigned.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}

            {/* Assign Officer Modal */}
            {modalType === "assign" && selectedFarm && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">Assign Officer to {selectedFarm.name}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Select Officer</label>
                  <select
                    className="form-select"
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                  >
                    <option value="">-- Select Officer --</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.upazila})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAssignOfficer}>
                    Assign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFarmPage;
