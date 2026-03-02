exports.to12Hour = (time24) => {
  if (!time24) return "";

  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
};

exports.to24Hours = (time) => {
  if (!time) return null;

  // If already 24-hour format (HH:mm)
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return time;
  }

  // If 12-hour format (hh:mm AM/PM)
  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let [, hour, minute, period] = match;
  hour = parseInt(hour, 10);

  if (hour < 1 || hour > 12) {
    throw new Error(`Invalid hour in time: ${time}`);
  }

  if (period.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, "0")}:${minute}`;
};

exports.formatDateToDDMMYYYY = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
