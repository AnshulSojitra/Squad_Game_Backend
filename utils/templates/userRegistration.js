// `;
module.exports = ({ userName, userEmail, userPhone }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to BoxArena</title>
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
                Welcome to BoxArena 🎉
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px; color:#374151;">

              <h2 style="margin-top:0; color:#2563eb;">
                Account Created Successfully
              </h2>

              <p style="font-size:15px; line-height:1.6;">
                Hello <strong>${userName}</strong>,
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Your BoxArena account has been successfully created. 
                You can now explore grounds, book slots, and manage your activities easily.
              </p>

              <!-- Account Info Box -->
              <table width="100%" cellpadding="12" cellspacing="0"
                style="background:#f9fafb; border-radius:6px; margin:20px 0;">
                <tr>
                  <td style="font-size:14px; color:#111827;">
                    <strong>Email:</strong> ${userEmail}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px; color:#111827;">
                    <strong>Phone:</strong> ${userPhone}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px; color:#111827;">
                    <strong>Registration Time:</strong> ${new Date().toLocaleString()}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align:center; margin-top:30px;">
                <a href="#" 
                  style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:6px; font-size:14px;">
                  Explore Grounds
                </a>
              </div>

              <p style="font-size:13px; color:#6b7280; margin-top:30px;">
                If you did not create this account, please contact our support team immediately.
              </p>

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
