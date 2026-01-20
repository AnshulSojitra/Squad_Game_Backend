module.exports = ({ adminName, adminEmail }) => `
  <h2>Admin Login Successful 🎉</h2>
  <p>Hi <strong>${adminName}</strong>, Welcome back to Box Arena!</p>

  <p>Your admin account has been successfully logged in.</p>

  <hr />

    <p><strong>Email:</strong> ${adminEmail}</p>
   
  <hr />

  <p>Thank you for using Box Arena.</p>
`;
