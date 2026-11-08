import React, { useState, useEffect } from "react";
import { getDoctors, getAvailability } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import AlertMessage from "./AlertMessage";
import DateInput from "./DateInput";
import { FormattedDate, getTodayString } from "../utils/dateUtils";

const AppointmentForm = ({
  initialValues = {},
  onSubmit,
  isRescheduling = false,
  onCancel,
  patientId,
  patientName
}) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    initialValues.doctorId ? String(initialValues.doctorId) : ""
  );
  const [selectedDate, setSelectedDate] = useState(
    initialValues.date || getTodayString()
  );
  const [selectedTime, setSelectedTime] = useState(initialValues.time || "");
  const [reason, setReason] = useState(initialValues.reason || "");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const todayStr = getTodayString();

  // Load doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const docs = await getDoctors();
        setDoctors(docs);
        if (!selectedDoctorId && docs.length > 0) {
          setSelectedDoctorId(String(docs[0].id));
        }
      } catch (err) {
        setErrorMessage("Failed to load doctors list.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slot availability whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setErrorMessage("");
        const data = await getAvailability(selectedDoctorId, selectedDate);
        setAvailableSlots(data.slots || []);

        // If currently selected time is not in available slots (unless it's the one we're rescheduling from on the same doctor/date)
        if (selectedTime) {
          const match = data.slots.find((s) => s.time === selectedTime);
          const isCurrentRescheduleSlot =
            isRescheduling &&
            initialValues.time === selectedTime &&
            initialValues.date === selectedDate &&
            String(initialValues.doctorId) === String(selectedDoctorId);

          if (match && !match.isAvailable && !isCurrentRescheduleSlot) {
            setSelectedTime("");
          }
        }
      } catch (err) {
        console.error("Availability error:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedDoctorId) {
      setErrorMessage("Please select a doctor.");
      return;
    }
    if (!selectedDate) {
      setErrorMessage("Please select an appointment date.");
      return;
    }
    if (!selectedTime) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        doctorId: Number(selectedDoctorId),
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim() || "General Consultation",
        ...(patientId ? { patientId: Number(patientId) } : {})
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while booking. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctors) {
    return <LoadingSpinner message="Loading appointment form..." />;
  }

  const selectedDoctorObj = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <AlertMessage
        type="danger"
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {patientName && (
        <div className="mb-3">
          <label className="form-label text-muted small fw-bold">PATIENT</label>
          <div className="form-control bg-light fw-medium">
            <i className="bi bi-person me-2 text-primary"></i>
            {patientName}
          </div>
        </div>
      )}

      {/* Doctor selection */}
      <div className="mb-3">
        <label className="form-label text-muted small fw-bold">SELECT DOCTOR</label>
        <select
          className="form-select"
          value={selectedDoctorId}
          onChange={(e) => {
            setSelectedDoctorId(e.target.value);
            setSelectedTime("");
          }}
          disabled={submitting}
          required
        >
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} — {doc.specialization}
            </option>
          ))}
        </select>
        {selectedDoctorObj && (
          <div className="mt-2 text-muted small">
            <span className="badge bg-info-subtle text-info-emphasis me-2">
              {selectedDoctorObj.specialization}
            </span>
            <i className="bi bi-telephone me-1"></i> {selectedDoctorObj.phone}
          </div>
        )}
      </div>

      {/* Date selection */}
      <div className="mb-4">
        <label className="form-label text-muted small fw-bold d-flex justify-content-between align-items-center">
          <span>SELECT DATE</span>
          {selectedDate && (
            <span className="text-primary fw-medium small" style={{ textTransform: "none" }}>
              Selected: <FormattedDate date={selectedDate} />
            </span>
          )}
        </label>
        <DateInput
          value={selectedDate}
          min={todayStr}
          disabled={submitting}
          required
          onChange={(newDate) => {
            setSelectedDate(newDate);
            setSelectedTime("");
          }}
        />
      </div>

      {/* Time Slot selection */}
      <div className="mb-4">
        <label className="form-label text-muted small fw-bold d-flex justify-content-between align-items-center">
          <span>AVAILABLE TIME SLOTS</span>
          {loadingSlots && (
            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
          )}
        </label>

        {loadingSlots ? (
          <div className="text-center py-3 text-muted small">Checking doctor schedule...</div>
        ) : availableSlots.length === 0 ? (
          <div className="alert alert-secondary py-2 small">
            Select a doctor and date to view available time slots.
          </div>
        ) : (
          <div>
            <div className="slot-grid">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                // In reschedule mode, keep existing slot selectable only on the exact original date and doctor
                const isCurrentRescheduleSlot =
                  isRescheduling &&
                  initialValues.time === slot.time &&
                  initialValues.date === selectedDate &&
                  String(initialValues.doctorId) === String(selectedDoctorId);
                const canSelect = slot.isAvailable || isCurrentRescheduleSlot;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    className={`slot-btn ${isSelected ? "selected" : ""}`}
                    disabled={!canSelect || submitting}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {slot.time}
                    {!canSelect && (
                      <span className="d-block text-danger" style={{ fontSize: "0.65rem" }}>
                        Booked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedTime ? (
              <div className="mt-2 text-success small fw-medium">
                <i className="bi bi-check-circle me-1"></i> Selected Slot: <strong>{selectedTime}</strong>
              </div>
            ) : (
              <div className="mt-2 text-muted small">Please click a slot above to select your time.</div>
            )}
          </div>
        )}
      </div>

      {/* Reason for consultation */}
      <div className="mb-4">
        <label className="form-label text-muted small fw-bold">REASON FOR VISIT</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Brief description of symptoms or consultation reason (e.g. Routine checkup, Persistent cough)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={submitting}
          required
        ></textarea>
      </div>

      {/* Submit / Cancel Actions */}
      <div className="d-flex gap-2 justify-content-end">
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary px-4 fw-medium d-flex align-items-center"
          disabled={submitting || !selectedTime}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {isRescheduling ? "Rescheduling..." : "Booking..."}
            </>
          ) : (
            <>
              <i className="bi bi-check2 me-2"></i>
              {isRescheduling ? "Confirm Reschedule" : "Confirm Appointment"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
