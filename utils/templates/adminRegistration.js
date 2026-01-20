module.exports = ({ adminName, adminEmail, adminPhone }) => `
  <h2>Admin Account Created 🎉</h2>
  <p>Hi <strong>${adminName}</strong>, you are now an Admin</p>

  <p>Your admin account has been successfully created.</p>

  <hr />

    <p><strong>Email:</strong> ${adminEmail}</p>

    <p><strong>Phone:</strong> ${adminPhone}</p>

  <hr />

  <p>Thank you for using Box Arena.</p>
`;
