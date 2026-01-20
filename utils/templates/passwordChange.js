module.exports = ({ name, email }) => `
  <h2>Password Changed Successfully 🎉</h2>
  <p>Hi <strong>${name}</strong>, Your password has been successfully changed.</p>

    <p>If you did not initiate this change, please contact our support team immediately.</p>
  <hr />

    <p><strong>Email:</strong> ${email}</p>
   
  <hr />

  <p>Thank you for using Box Arena.</p>
`;
