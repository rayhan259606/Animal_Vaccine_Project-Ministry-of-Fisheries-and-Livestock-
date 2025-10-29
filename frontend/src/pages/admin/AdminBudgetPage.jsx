import React, { useEffect, useState } from "react";
import api from "../../api/client";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminBudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [formData, setFormData] = useState({ fiscal_year: "", total_amount: "", notes: "" });
  const [summary, setSummary] = useState({});
  const [selected, setSelected] = useState(null);

  // Fetch budgets + summary
  const fetchBudgets = async (page = 1) => {
    try {
      const res = await api.get(`/budgets?page=${page}`);
      setBudgets(res.data.data.data);
      setPagination({
        current_page: res.data.data.current_page,
        last_page: res.data.data.last_page,
      });
      setSummary(res.data.summary);
    } catch (err) {
      alert("Error loading budgets");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.put(`/budgets/${selected.id}`, formData);
        alert("✅ Updated");
      } else {
        await api.post("/budgets", formData);
        alert("✅ Created");
      }
      setFormData({ fiscal_year: "", total_amount: "", notes: "" });
      setSelected(null);
      fetchBudgets(pagination.current_page);
    } catch {
      alert("Error saving");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete(`/budgets/${id}`);
    fetchBudgets(pagination.current_page);
  };

  const handleRestore = async (id) => {
    await api.put(`/budgets/${id}/restore`);
    fetchBudgets(pagination.current_page);
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">💰 Budget Management</h3>

      {/* Budget Summary */}
      {summary && (
        <div className="alert alert-info text-center">
          <b>Total Budget:</b> {summary.total_budget || 0} |
          <b> Procurement:</b> {summary.total_procurement || 0} |
          <b> Disbursed:</b> {summary.total_disbursement || 0} |
          <b> Remaining:</b> {summary.remaining || 0}
        </div>
      )}

      {/* Add/Edit Form */}
      <form onSubmit={handleSave} className="border p-3 bg-light mb-4 rounded">
        <div className="row">
          <div className="col-md-3 mb-2">
            <input
              name="fiscal_year"
              className="form-control"
              placeholder="Fiscal Year (e.g. 2025-2026)"
              value={formData.fiscal_year}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              name="total_amount"
              type="number"
              className="form-control"
              placeholder="Total Amount"
              value={formData.total_amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              name="notes"
              className="form-control"
              placeholder="Notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-2">
            <button className="btn btn-primary w-100">
              {selected ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* Budget List */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Fiscal Year</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((b, i) => (
            <tr key={b.id} className={b.deleted_at ? "table-secondary" : ""}>
              <td>{i + 1}</td>
              <td>{b.fiscal_year}</td>
              <td>{b.total_amount}</td>
              <td>{b.deleted_at ? "Deleted" : "Active"}</td>
              <td>
                {!b.deleted_at ? (
                  <>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        setFormData(b);
                        setSelected(b);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleRestore(b.id)}
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
          onClick={() => fetchBudgets(pagination.current_page - 1)}
        >
          Prev
        </button>
        <span className="align-self-center">
          Page {pagination.current_page} of {pagination.last_page}
        </span>
        <button
          className="btn btn-secondary ms-2"
          disabled={pagination.current_page === pagination.last_page}
          onClick={() => fetchBudgets(pagination.current_page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
