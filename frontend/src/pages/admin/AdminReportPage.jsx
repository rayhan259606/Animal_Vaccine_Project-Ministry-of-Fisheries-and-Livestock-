import React, { useEffect, useState } from "react";
import api from "../../api/client";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminReportPage() {
  const [summary, setSummary] = useState({});
  const [financials, setFinancials] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch summary & financial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [res1, res2] = await Promise.all([
        api.get("/reports/summary"),
        api.get("/reports/financials"),
      ]);
      setSummary(res1.data);
      setFinancials(res2.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>📈 System Reports</h3>
        <button className="btn btn-outline-primary" onClick={handlePrint}>
          🖨 Export / Print PDF
        </button>
      </div>

      {/* Summary Section */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3 bg-light">
            <h6>Total Farmers</h6>
            <h3 className="text-primary">{summary.farmers || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3 bg-light">
            <h6>Total Officers</h6>
            <h3 className="text-success">{summary.officers || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3 bg-light">
            <h6>Total Vaccinations</h6>
            <h3 className="text-info">{summary.vaccinations || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3 bg-light">
            <h6>Total Stock Doses</h6>
            <h3 className="text-warning">{summary.stock_total_doses || 0}</h3>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">💰 Financial Overview</h5>
        </div>
        <div className="card-body">
          <p>
            <strong>Total Disbursement Amount: </strong>৳{" "}
            {financials.total_amount || 0}
          </p>
          <p>
            <strong>Total Disbursement Count: </strong>
            {financials.total_count || 0}
          </p>

          {/* Budget Utilization Chart (Bootstrap Progress Bars) */}
          <div>
            <h6 className="mt-3">📅 Disbursement by Status</h6>
            {financials.by_status && financials.by_status.length > 0 ? (
              financials.by_status.map((item, i) => {
                const percent = Math.round(
                  (item.total / (financials.total_amount || 1)) * 100
                );
                return (
                  <div key={i} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>
                        {item.status.toUpperCase()} — ৳ {item.total}
                      </span>
                      <small>{percent}%</small>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className={`progress-bar ${
                          i % 2 === 0 ? "bg-success" : "bg-info"
                        }`}
                        role="progressbar"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted">No disbursement data available</p>
            )}
          </div>

          {/* Monthly Breakdown */}
          <div className="mt-4">
            <h6>📆 Disbursement by Month</h6>
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Count</th>
                  <th>Total Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {financials.by_month && financials.by_month.length > 0 ? (
                  financials.by_month.map((item, i) => (
                    <tr key={i}>
                      <td>{getMonthName(item.month)}</td>
                      <td>{item.count}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Disbursement Total Card */}
      <div className="text-end text-muted mt-3">
        <small>
          Last updated: {new Date().toLocaleString()} | Animal Vaccine Management
          System
        </small>
      </div>
    </div>
  );
}

// Helper Function for Month Name
function getMonthName(monthNum) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[(monthNum || 1) - 1];
}
