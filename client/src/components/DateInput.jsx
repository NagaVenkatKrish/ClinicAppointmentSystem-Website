import React, { useRef } from "react";
import { FormattedDate, parseDateParts, getTodayString } from "../utils/dateUtils";

/**
 * Professional Healthcare Date Input Component
 * Formats the input of inserting date as:
 * "month date(st,nd,rd,th superscript), year"
 * (e.g. October 14th, 2026 with "th" superscript)
 */
const DateInput = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  required = true,
  id = "appointment-date-input",
  showQuickSelect = true
}) => {
  const nativeInputRef = useRef(null);

  const handleOpenPicker = () => {
    if (disabled) return;
    if (nativeInputRef.current) {
      try {
        if (typeof nativeInputRef.current.showPicker === "function") {
          nativeInputRef.current.showPicker();
          return;
        }
      } catch {
        // Fallback if browser restricts showPicker
      }
      try {
        nativeInputRef.current.focus();
        nativeInputRef.current.click();
      } catch {
        // Ignore fallback errors
      }
    }
  };

  // Quick select helper dates (YYYY-MM-DD)
  const quickDates = [
    { label: "Today", val: getTodayString(0) },
    { label: "Tomorrow", val: getTodayString(1) },
    { label: "In 2 Days", val: getTodayString(2) },
    { label: "In 1 Week", val: getTodayString(7) }
  ];

  const dateParts = parseDateParts(value);

  return (
    <div className="clinic-date-input-group">
      {/* Hidden/Synced Native Input for system calendar picker */}
      <input
        ref={nativeInputRef}
        id={id}
        type="date"
        className="visually-hidden-date-input"
        value={value || ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
      />

      {/* Styled Interactive Date Input Display */}
      <div
        className={`clinic-date-display-box ${disabled ? "disabled" : ""} ${value ? "has-value" : ""}`}
        onClick={handleOpenPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenPicker();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Appointment date selector"
      >
        <div className="d-flex align-items-center flex-grow-1 gap-2">
          <div className="date-icon-badge">
            <i className="bi bi-calendar3"></i>
          </div>

          <div className="date-text-container">
            <div className="date-sublabel">Appointment Date</div>
            <div className="date-primary-value">
              {dateParts ? (
                <span className="formatted-date-label">
                  {dateParts.month} {dateParts.day}
                  <sup className="date-ordinal-sup">{dateParts.suffix}</sup>, {dateParts.year}
                </span>
              ) : (
                <span className="text-muted">Choose appointment date</span>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary change-date-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPicker();
            }}
            disabled={disabled}
          >
            <i className="bi bi-calendar-event me-1"></i>
            <span>Select Date</span>
          </button>
        </div>
      </div>

      {/* Quick Date Chips for fast consultation booking */}
      {showQuickSelect && !disabled && (
        <div className="quick-date-chips mt-2 d-flex flex-wrap gap-1 align-items-center">
          <span className="text-muted small me-1" style={{ fontSize: "0.75rem" }}>
            Quick select:
          </span>
          {quickDates.map((qd) => {
            const isSelected = value === qd.val;
            return (
              <button
                key={qd.label}
                type="button"
                className={`btn btn-sm quick-chip ${isSelected ? "active" : ""}`}
                onClick={() => onChange(qd.val)}
                disabled={disabled}
              >
                {qd.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DateInput;
