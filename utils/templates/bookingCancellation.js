module.exports = ({ userName, groundName, date, slots }) => `
  <h2>Booking Cancelled ❌</h2>

  <p>Hi <strong>${userName}</strong>,</p>

  <p>Your booking has been <strong>cancelled successfully</strong>.</p>

  <hr />

  <p><strong>Ground:</strong> ${groundName}</p>
  <p><strong>Date:</strong> ${date}</p>

  <p><strong>Cancelled Slots:</strong></p>
  <ul>
    ${slots.map((s) => `<li>${s}</li>`).join("")}
  </ul>

  <hr />

  <p>If applicable, any refund will be processed shortly.</p>

  <p>Thank you for using Squad Game.</p>
`;
