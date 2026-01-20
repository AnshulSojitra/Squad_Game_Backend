module.exports = ({ userName, userEmail }) => `
  <h2>Login Successful 🎉</h2>
  <p>Hi <strong>${userName}</strong>, Welcome back to Box Arena!</p>

  <p>Your account has been successfully logged in.</p>

  <hr />

    <p><strong>Email:</strong> ${userEmail}</p>
   
  <hr />

  <p>Thank you for using Box Arena.</p>
`;
