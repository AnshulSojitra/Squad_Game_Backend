module.exports = ({ name, email }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Changed</title>
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
                BoxArena Security Alert
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px; color:#374151;">

              <h2 style="margin-top:0; color:#16a34a;">
                Password Changed Successfully
              </h2>

              <p style="font-size:15px; line-height:1.6;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Your password has been successfully updated for your BoxArena account.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="12" cellspacing="0"
                style="background:#f9fafb; border-radius:6px; margin:20px 0;">
                <tr>
                  <td style="font-size:14px; color:#111827;">
                    <strong>Account Email:</strong> ${email}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px; color:#111827;">
                    <strong>Time:</strong> ${new Date().toLocaleString()}
                  </td>
                </tr>
              </table>

              <!-- Security Warning Box -->
              <div style="background:#fef2f2; padding:15px; border-radius:6px; margin-top:15px;">
                <p style="margin:0; font-size:14px; color:#991b1b;">
                  If you did not initiate this change, please contact our support team immediately and secure your account.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center; margin-top:30px;">
                <a href="#" 
                  style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:6px; font-size:14px;">
                  Go to My Account
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6; padding:20px; text-align:center; font-size:12px; color:#6b7280;">
              © ${new Date().getFullYear()} BoxArena. All rights reserved.
              <br/>
              This is an automated security notification. Please do not reply.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
