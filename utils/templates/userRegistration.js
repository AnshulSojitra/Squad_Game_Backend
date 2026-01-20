module.exports = ({ userName, userEmail, userPhone }) => `
  <h2>Account Created 🎉</h2>
  <p>Hi <strong>${userName}</strong>, Welcome to Box Arena!</p>

  <p>Your account has been successfully created.</p>

  <hr />

    <p><strong>Email:</strong> ${userEmail}</p>

    <p><strong>Phone:</strong> ${userPhone}</p>

  <hr />

  <p>Thank you for using Box Arena.</p>
`;
