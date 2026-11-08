import React from "react";

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 * Optional offsetDays shifts by + or - N days.
 * @param {number} [offsetDays=0]
 * @returns {string}
 */
export const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Returns the ordinal suffix ("st", "nd", "rd", "th") for a given day of the month.
 * @param {number|string} day
 * @returns {string}
 */
export const getOrdinalSuffix = (day) => {
  const d = parseInt(day, 10);
  if (isNaN(d)) return "th";
  if (d >= 11 && d <= 13) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const MONTH_NAMES = [
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
  "December"
];

/**
 * Parses date input (YYYY-MM-DD, ISO string, Date object) into formatted parts without timezone drift.
 * @param {string|Date} dateInput
 * @returns {{ year: number, month: string, monthShort: string, day: number, suffix: string } | null}
 */
export const parseDateParts = (dateInput) => {
  if (!dateInput) return null;

  let year, monthIdx, day;

  if (typeof dateInput === "number") {
    dateInput = new Date(dateInput);
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    year = dateInput.getFullYear();
    monthIdx = dateInput.getMonth();
    day = dateInput.getDate();
  } else if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // Check standard YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10);
      monthIdx = parseInt(ymdMatch[2], 10) - 1;
      day = parseInt(ymdMatch[3], 10);
    } else {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
        monthIdx = parsed.getMonth();
        day = parsed.getDate();
      } else {
        return null;
      }
    }
  } else {
    return null;
  }

  if (
    isNaN(year) ||
    isNaN(monthIdx) ||
    isNaN(day) ||
    monthIdx < 0 ||
    monthIdx > 11 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const month = MONTH_NAMES[monthIdx];
  const monthShort = month ? month.slice(0, 3) : "";
  const suffix = getOrdinalSuffix(day);

  return { year, month, monthShort, day, suffix };
};

/**
 * Formatted date component rendering: "month date(st,nd,rd,th superscript), year"
 * Example: October 14<sup>th</sup>, 2026
 */
export const FormattedDate = ({ date, className = "", short = false }) => {
  const parts = parseDateParts(date);
  if (!parts) {
    return <span className={className}>{date || "—"}</span>;
  }

  const monthLabel = short ? parts.monthShort : parts.month;

  return (
    <span className={`date-superscript ${className}`}>
      {monthLabel} {parts.day}
      <sup className="date-ordinal">{parts.suffix}</sup>, {parts.year}
    </span>
  );
};

export default FormattedDate;
