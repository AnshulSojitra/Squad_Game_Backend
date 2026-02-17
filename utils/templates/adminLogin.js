module.exports = ({ adminName, adminEmail }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Admin Login Successful</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827; padding:25px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:22px;">
                BoxArena Admin Panel
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px; color:#374151;">

              <h2 style="margin-top:0; color:#111827;">
                Login Successful
              </h2>

              <p style="font-size:15px; line-height:1.6;">
                Hello <strong>${adminName}</strong>,
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Your admin account has been successfully logged in to 
                <strong>BoxArena</strong>.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="12" cellspacing="0"
                style="background:#f9fafb; border-radius:6px; margin:20px 0;">
                <tr>
                  <td style="font-size:14px; color:#111827;">
                    <strong>Email:</strong> ${adminEmail}
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#6b7280;">
                If this login was not performed by you, please reset your password immediately.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin-top:30px;">
                <a href="#" 
                  style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:6px; font-size:14px;">
                  Go to Admin Dashboard
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6; padding:20px; text-align:center; font-size:12px; color:#6b7280;">
              © ${new Date().getFullYear()} BoxArena. All rights reserved.
              <br/>
              This is an automated message. Please do not reply.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
