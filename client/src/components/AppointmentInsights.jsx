import React from "react";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AppointmentInsights = ({ appointments = [] }) => {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    const key = toDateKey(date);
    return {
      key,
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: appointments.filter((appointment) => appointment.date === key).length
    };
  });
  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const statuses = [
    { name: "Scheduled", color: "#0284c7" },
    { name: "Completed", color: "#16a34a" },
    { name: "Cancelled", color: "#dc2626" }
  ].map((status) => ({
    ...status,
    count: appointments.filter((appointment) => appointment.status === status.name).length
  }));
  const specialties = Object.entries(appointments.reduce((result, appointment) => {
    const label = appointment.doctorSpecialization || "Unassigned";
    result[label] = (result[label] || 0) + 1;
    return result;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxSpecialty = Math.max(1, ...specialties.map(([, count]) => count));

  return (
    <section className="row g-3 mb-4" aria-label="Clinic activity insights">
      <div className="col-lg-8">
        <div className="card insight-card h-100">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <span className="insight-kicker">OPERATIONS</span>
                <h5 className="fw-bold mb-1">Appointment activity</h5>
                <p className="text-muted small mb-0">Daily volume across the last 14 days</p>
              </div>
              <span className="insight-total">{appointments.length}<small> total</small></span>
            </div>
            <div className="activity-chart" role="img" aria-label="Daily appointment volume for the last 14 days">
              {days.map((day, index) => (
                <div className="activity-day" key={day.key} title={`${day.label}: ${day.count} appointments`}>
                  <span className="activity-count">{day.count || ""}</span>
                  <div className="activity-track">
                    <div className="activity-bar" style={{ height: `${Math.max(day.count ? 12 : 4, (day.count / maxCount) * 100)}%` }} />
                  </div>
                  <span className={`activity-label ${index % 2 ? "activity-label-muted" : ""}`}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card insight-card h-100">
          <div className="card-body p-4">
            <span className="insight-kicker">CASE MIX</span>
            <h5 className="fw-bold mb-3">By specialty</h5>
            {specialties.length ? specialties.map(([name, count]) => (
              <div className="specialty-row" key={name}>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-truncate me-2">{name}</span>
                  <span className="text-muted fw-semibold">{count}</span>
                </div>
                <div className="specialty-track"><div style={{ width: `${(count / maxSpecialty) * 100}%` }} /></div>
              </div>
            )) : <p className="text-muted small mb-0">No appointments to summarize yet.</p>}
            <div className="status-legend mt-4 pt-3 border-top">
              {statuses.map((status) => (
                <div className="d-flex align-items-center justify-content-between small mb-2" key={status.name}>
                  <span><i className="status-dot me-2" style={{ backgroundColor: status.color }} />{status.name}</span>
                  <strong>{status.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentInsights;
