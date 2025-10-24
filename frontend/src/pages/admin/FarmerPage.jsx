import React, { useEffect, useState, useRef } from "react";
import api from "../../api/client";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const FarmerPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending"); // pending | approved
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // 🧭 Fetch farmers (pending or approved)
  const fetchFarmers = async (pageNo = 1) => {
    try {
      setLoading(true);
      const endpoint =
        tab === "pending"
          ? `/farmers/pending?page=${pageNo}`
          : `/farmers?page=${pageNo}`;
      const res = await api.get(endpoint);
      const data = res.data;

      let list = [];
      if (tab === "approved") {
        list = (data.data || []).filter(
          (f) => f.is_approved === true || f.status === "active"
        );
      } else {
        list = data.data || [];
      }

      setFarmers(list);
      setPage(data.current_page);
      setLastPage(data.last_page);
    } catch (err) {
      console.error("❌ Failed to load farmers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [tab]);

  // 🔍 Show Farmer Details
  const openModal = (farmer) => {
    setSelectedFarmer(farmer);
    modalInstance.current = new bootstrap.Modal(modalRef.current, {
      backdrop: "static",
    });
    modalInstance.current.show();
  };

  // ❌ Close Modal
  const closeModal = () => {
    if (modalInstance.current) modalInstance.current.hide();
    setSelectedFarmer(null);
  };

  // ✅ Approve Farmer
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this farmer?")) return;
    try {
      await api.put(`/farmers/${id}/approve`);
      alert("✅ Farmer approved successfully!");
      fetchFarmers();

      // 🔄 Sidebar কে event পাঠানো হবে
      window.dispatchEvent(
        new CustomEvent("sidebarEvent", { detail: "refreshPendingFarmers" })
      );
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve farmer.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">🌾 Farmer Management</h3>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "pending" ? "active" : ""}`}
            onClick={() => setTab("pending")}
          >
            Pending Farmers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "approved" ? "active" : ""}`}
            onClick={() => setTab("approved")}
          >
            Approved Farmers
          </button>
        </li>
      </ul>

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
                  <th>Registration No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {farmers.length > 0 ? (
                  farmers.map((f, i) => (
                    <tr key={f.id}>
                      <td>{i + 1}</td>
                      <td>{f.registration_no}</td>
                      <td>{f.user?.name}</td>
                      <td>{f.user?.email}</td>
                      <td>{f.user?.phone || "-"}</td>
                      <td>
                        {f.is_approved ? (
                          <span className="badge bg-success">Approved</span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openModal(f)}
                        >
                          👁 Show
                        </button>
                        {!f.is_approved && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(f.id)}
                          >
                            ✅ Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-3">
                      No {tab} farmers found.
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
              onClick={() => {
                const newPage = page - 1;
                setPage(newPage);
                fetchFarmers(newPage);
              }}
            >
              &laquo; Prev
            </button>
            <span>
              Page {page} of {lastPage}
            </span>
            <button
              className="btn btn-outline-primary"
              disabled={page >= lastPage}
              onClick={() => {
                const newPage = page + 1;
                setPage(newPage);
                fetchFarmers(newPage);
              }}
            >
              Next &raquo;
            </button>
          </div>
        </>
      )}

      {/* Farmer Details Modal */}
      <div className="modal fade" id="farmerModal" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Farmer Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body">
              {selectedFarmer ? (
                <>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Registration No:</strong>{" "}
                      {selectedFarmer.registration_no}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Name:</strong> {selectedFarmer.user?.name}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Email:</strong> {selectedFarmer.user?.email}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Phone:</strong>{" "}
                      {selectedFarmer.user?.phone || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>NID:</strong> {selectedFarmer.user?.nid || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Division:</strong>{" "}
                      {selectedFarmer.user?.division || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>District:</strong>{" "}
                      {selectedFarmer.user?.district || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Upazila:</strong>{" "}
                      {selectedFarmer.user?.upazila || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Union:</strong>{" "}
                      {selectedFarmer.user?.union || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Village:</strong>{" "}
                      {selectedFarmer.user?.village || "-"}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Status:</strong>{" "}
                      {selectedFarmer.is_approved ? (
                        <span className="badge bg-success">Approved</span>
                      ) : (
                        <span className="badge bg-warning text-dark">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted">No data available.</div>
              )}
            </div>
            <div className="modal-footer">
              {!selectedFarmer?.is_approved && (
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedFarmer.id)}
                >
                  ✅ Approve Farmer
                </button>
              )}
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerPage;
