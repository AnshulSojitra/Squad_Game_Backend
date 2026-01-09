module.exports = ({
  userName,
  groundName,
  date,
  startTime,
  endTime,
  price,
  slots,
}) => `
  <h2>Booking Confirmed 🎉</h2>
  <p>Hi <strong>${userName}</strong>,</p>

  <p>Your booking has been successfully confirmed.</p>

  <hr />

  <p><strong>Ground:</strong> ${groundName}</p>
  <p><strong>Date:</strong> ${date}</p>
    <p><strong>Booked Slots:</strong></p>
  <ul>
    ${slots.map((s) => `<li>${s}</li>`).join("")}
  </ul>
  <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
  <p><strong>Total Price:</strong> ₹${price}</p>

  <hr />

  <p>Thank you for using Box Arena.</p>
`;
