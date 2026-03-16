import React, { useState, useEffect } from "react";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      if (!res.ok) {
        console.error("Server error:", res.status);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Approve employee
  const approveEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/approve/${id}`, {
        method: "PUT",
      });
      if (!res.ok) return console.error("Approve failed");
      fetchEmployees();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) return console.error("Delete failed");
      fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="employee-page">
      <h1>Employee Management</h1>

      <div className="employee-card">
        {loading ? (
          <p className="status-text">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="status-text">No employees found.</p>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Section</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.section}</td>
                  <td>
                    <span className={`status-badge ${emp.status}`}>{emp.status}</span>
                  </td>
                  <td className="actions-cell">
                    {emp.status === "pending" && (
                      <button className="approve-btn" onClick={() => approveEmployee(emp._id)}>
                        Approve
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => deleteEmployee(emp._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .employee-page {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 30px;
          background: #f0f2f5;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        h1 {
          margin-bottom: 25px;
          color: #2c3e50;
        }

        .employee-card {
          width: 100%;
          max-width: 1200px;
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        .status-text {
          text-align: center;
          color: #7f8c8d;
          padding: 20px 0;
        }

        .employee-table {
          width: 100%;
          border-collapse: collapse;
        }

        .employee-table th,
        .employee-table td {
          padding: 12px 15px;
          text-align: center;
          border-bottom: 1px solid #ecf0f1;
        }

        .employee-table th {
          background-color: #34495e;
          color: #fff;
          font-weight: 500;
        }

        .employee-table tr:hover {
          background-color: #f1f2f6;
        }

        .status-badge {
          padding: 5px 10px;
          border-radius: 12px;
          color: #fff;
          font-weight: bold;
          text-transform: capitalize;
          font-size: 0.85rem;
        }

        .status-badge.approved {
          background-color: #27ae60;
        }

        .status-badge.pending {
          background-color: #f39c12;
        }

        .actions-cell {
          display: flex;
          justify-content: center;
          gap: 10px; /* spacing between buttons */
        }

        button {
          padding: 6px 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.1s, background 0.2s;
        }

        .approve-btn {
          background-color: #27ae60;
          color: #fff;
        }

        .approve-btn:hover {
          transform: scale(1.05);
          background-color: #2ecc71;
        }

        .delete-btn {
          background-color: #c0392b;
          color: #fff;
        }

        .delete-btn:hover {
          transform: scale(1.05);
          background-color: #e74c3c;
        }

        @media (max-width: 768px) {
          .employee-table th,
          .employee-table td {
            font-size: 0.9rem;
            padding: 10px;
          }

          button {
            padding: 5px 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeePage;