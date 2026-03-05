const gameCreatedEmail = ({
  userName,
  sport,
  groundName,
  date,
  slots,
  playersPerTeam,
  totalTeams,
}) => {
  return `
    <h2>Game Created Successfully 🎉</h2>

    <p>Hi <b>${userName}</b>,</p>

    <p>Your game has been created successfully. Here are the details:</p>

    <ul>
      <li><b>Sport:</b> ${sport}</li>
      <li><b>Ground:</b> ${groundName}</li>
      <li><b>Date:</b> ${date}</li>
      <li><b>Teams:</b> ${totalTeams}</li>
      <li><b>Players per Team:</b> ${playersPerTeam}</li>
      <li><b>Slots:</b> ${slots.join(", ")}</li>
    </ul>

    <p>Players can now join your game.</p>

    <p>Good luck and enjoy your match! ⚽</p>
  `;
};

module.exports = gameCreatedEmail;
