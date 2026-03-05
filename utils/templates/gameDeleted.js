const gameDeletedEmail = ({ userName, sport, groundName, date }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Game Deleted</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <!-- MAIN CARD -->
          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

            <!-- HEADER -->
            <tr>
              <td style="background:#111827;padding:22px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:22px;">
                  BoxArena
                </h1>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:40px;color:#374151;">

                <h2 style="margin-top:0;color:#dc2626;">
                  Your Game Has Been Deleted ❌
                </h2>

                <p style="font-size:15px;">
                  Hello <strong>${userName}</strong>,
                </p>

                <p style="font-size:15px;line-height:1.6;">
                  The game you created on <b>BoxArena</b> has been successfully deleted.
                </p>

                <!-- GAME DETAILS -->
                <table width="100%" cellpadding="10" cellspacing="0"
                  style="background:#f9fafb;border-radius:6px;margin-top:20px;font-size:14px;">

                  <tr>
                    <td><strong>Sport</strong></td>
                    <td>${sport}</td>
                  </tr>

                  <tr>
                    <td><strong>Ground</strong></td>
                    <td>${groundName}</td>
                  </tr>

                  <tr>
                    <td><strong>Date</strong></td>
                    <td>${date}</td>
                  </tr>

                </table>

                <p style="margin-top:25px;font-size:15px;">
                  If this action was intentional, no further steps are needed.
                </p>

                <p style="font-size:15px;">
                  You can create a new game anytime and invite players again ⚽
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f3f4f6;padding:20px;text-align:center;font-size:12px;color:#6b7280;">
                © ${new Date().getFullYear()} BoxArena. All rights reserved.
                <br>
                This is an automated notification. Please do not reply.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

module.exports = gameDeletedEmail;
