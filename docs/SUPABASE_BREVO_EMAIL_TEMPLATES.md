# Supabase Auth Custom Email Templates (Pulse Life Tracker & Brevo SMTP)

This guide provides the official, production-ready HTML email templates for **Pulse Life Tracker** configured with **Supabase Authentication** and delivered via **Brevo SMTP**.

### Enhancements in this Version:
1. **Official Pulse Logo**: Replaced generic emoji (`⚡️`) with the high-resolution branded **Pulse Logo** icon (`https://pulse-life-tracker.vercel.app/pwa-192x192.png`).
2. **Dual-Theme High Contrast (Dark & Light Mode Safe)**:
   - Uses `color-scheme: light dark` meta tags and `@media (prefers-color-scheme: dark)` overrides.
   - Replaced low-contrast mid-tones (`#cbd5e1`, `#94a3b8`) with high-contrast text (`#ffffff`, `#f1f5f9`, and `#f8fafc`).
   - If viewed in dark mode or on clients that invert backgrounds (e.g., Gmail / Outlook dark mode), text inverts to deep high-contrast charcoal (`#0f172a`) instead of washed-out faded grey.
   - Includes CSS gradient background preservation (`background-image: linear-gradient(...)`) to keep the dark card intact across email clients.
3. **Complete Template Suite**:
   - `Confirm signup` / Verify email address
   - `Reset password` / Password recovery
   - `Change email address` / Confirm new email address
   - `Magic link` / Passwordless instant sign-in

---

## 1. Confirm Signup / Verify Email

- **Supabase Template:** `Confirm signup`
- **Email Subject:** `Verify your email address - Pulse Life Tracker`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Verify your email address - Pulse Life Tracker</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0b1120 !important; background-image: linear-gradient(#0b1120, #0b1120) !important; }
      .card-bg { background-color: #131d33 !important; background-image: linear-gradient(#131d33, #131d33) !important; border-color: #1e293b !important; }
      .text-heading { color: #ffffff !important; }
      .text-primary { color: #f8fafc !important; }
      .text-body { color: #f1f5f9 !important; }
      .box-bg { background-color: #1e293b !important; background-image: linear-gradient(#1e293b, #1e293b) !important; border-color: #334155 !important; }
      .box-text { color: #ffffff !important; }
      .footer-bg { background-color: #0b1120 !important; border-color: #1e293b !important; }
      .footer-text { color: #94a3b8 !important; }
    }
    [data-ogsc] body, [data-ogsc] .email-bg { background-color: #0b1120 !important; }
    [data-ogsc] .card-bg { background-color: #131d33 !important; border-color: #1e293b !important; }
    [data-ogsc] .text-heading { color: #ffffff !important; }
    [data-ogsc] .text-primary { color: #f8fafc !important; }
    [data-ogsc] .text-body { color: #f1f5f9 !important; }
    [data-ogsc] .box-bg { background-color: #1e293b !important; border-color: #334155 !important; }
    [data-ogsc] .box-text { color: #ffffff !important; }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #f1f5f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px 16px;">
        <!-- Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="card-bg" style="max-width: 540px; background-color: #131d33; background-image: linear-gradient(#131d33, #131d33); border: 1px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #6366f1 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header / Pulse Logo -->
          <tr>
            <td align="center" style="padding: 36px 32px 18px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" valign="middle" style="padding-right: 14px;">
                    <!-- Pulse Branded Logo Icon -->
                    <img src="https://pulse-life-tracker.vercel.app/pwa-192x192.png" width="48" height="48" alt="Pulse Logo" style="width: 48px; height: 48px; border-radius: 12px; display: block; border: 0; outline: none; text-decoration: none;" />
                  </td>
                  <td align="left" valign="middle">
                    <div class="text-heading" style="font-size: 22px; font-weight: 800; color: #ffffff !important; letter-spacing: -0.5px; line-height: 1.15;">Pulse</div>
                    <div style="font-size: 11px; font-weight: 700; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.15; margin-top: 3px;">Life Tracker</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 16px 36px 32px 36px; text-align: left;">
              <h1 class="text-heading" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #ffffff !important; line-height: 1.35; text-align: center;">
                Welcome to Pulse!
              </h1>
              
              <p class="text-body" style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #f1f5f9 !important;">
                Thanks for creating your account. You're one step away from tracking habits, managing finances, structuring tasks, and elevating your daily operating rhythm.
              </p>

              <p class="text-primary" style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: #ffffff !important; font-weight: 600;">
                Please verify your email address to activate your account and access your dashboard.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ .ConfirmationURL }}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="25%" fillcolor="#6366f1" stroke="f">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Verify My Email</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); background-color: #4f46e5; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 38px; border-radius: 12px; box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.5); letter-spacing: 0.2px; text-align: center;">
                      Verify My Email &rarr;
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Expiration Notice Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="box-bg" style="background-color: #1e293b; background-image: linear-gradient(#1e293b, #1e293b); border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p class="box-text" style="margin: 0; font-size: 13px; color: #ffffff !important; line-height: 1.55;">
                      <strong style="color: #38bdf8 !important;">Link expires in 24 hours.</strong> Once verified, you can sign in to your newly activated account.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p class="text-body" style="margin: 0 0 8px 0; font-size: 13px; color: #e2e8f0 !important; line-height: 1.5;">
                If the button above does not work, copy and paste this link directly into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8 !important; text-decoration: underline; font-weight: 600;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <!-- Security Disclaimer -->
              <p class="footer-text" style="margin: 0; padding-top: 18px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8 !important; line-height: 1.55;">
                If you didn't create a Pulse Life Tracker account, you can safely ignore this email. No account will be activated without verification.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="padding: 24px 36px; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); border-top: 1px solid #1e293b; text-align: center;">
              <p class="footer-text" style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8 !important;">
                &copy; 2026 Pulse Life Tracker. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b !important;">
                Delivered securely via Brevo SMTP &bull; Encrypted TLS 1.3
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password Email

- **Supabase Template:** `Reset password`
- **Email Subject:** `Reset your password - Pulse Life Tracker`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Reset your password - Pulse Life Tracker</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0b1120 !important; background-image: linear-gradient(#0b1120, #0b1120) !important; }
      .card-bg { background-color: #131d33 !important; background-image: linear-gradient(#131d33, #131d33) !important; border-color: #1e293b !important; }
      .text-heading { color: #ffffff !important; }
      .text-primary { color: #f8fafc !important; }
      .text-body { color: #f1f5f9 !important; }
      .box-bg { background-color: #1e293b !important; background-image: linear-gradient(#1e293b, #1e293b) !important; border-color: #334155 !important; }
      .box-text { color: #ffffff !important; }
      .footer-bg { background-color: #0b1120 !important; border-color: #1e293b !important; }
      .footer-text { color: #94a3b8 !important; }
    }
    [data-ogsc] body, [data-ogsc] .email-bg { background-color: #0b1120 !important; }
    [data-ogsc] .card-bg { background-color: #131d33 !important; border-color: #1e293b !important; }
    [data-ogsc] .text-heading { color: #ffffff !important; }
    [data-ogsc] .text-primary { color: #f8fafc !important; }
    [data-ogsc] .text-body { color: #f1f5f9 !important; }
    [data-ogsc] .box-bg { background-color: #1e293b !important; border-color: #334155 !important; }
    [data-ogsc] .box-text { color: #ffffff !important; }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #f1f5f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px 16px;">
        <!-- Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="card-bg" style="max-width: 540px; background-color: #131d33; background-image: linear-gradient(#131d33, #131d33); border: 1px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Accent Warning Line (Amber/Rose) -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #6366f1 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header / Pulse Logo -->
          <tr>
            <td align="center" style="padding: 36px 32px 18px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" valign="middle" style="padding-right: 14px;">
                    <img src="https://pulse-life-tracker.vercel.app/pwa-192x192.png" width="48" height="48" alt="Pulse Logo" style="width: 48px; height: 48px; border-radius: 12px; display: block; border: 0; outline: none; text-decoration: none;" />
                  </td>
                  <td align="left" valign="middle">
                    <div class="text-heading" style="font-size: 22px; font-weight: 800; color: #ffffff !important; letter-spacing: -0.5px; line-height: 1.15;">Pulse</div>
                    <div style="font-size: 11px; font-weight: 700; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.15; margin-top: 3px;">Life Tracker</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 16px 36px 32px 36px; text-align: left;">
              <h1 class="text-heading" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #ffffff !important; line-height: 1.35; text-align: center;">
                Reset Your Password
              </h1>
              
              <p class="text-body" style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #f1f5f9 !important;">
                We received a request to reset the password for your Pulse Life Tracker account.
              </p>

              <p class="text-primary" style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: #ffffff !important; font-weight: 600;">
                Click the button below to set a new password. This link is valid for <strong style="color: #38bdf8 !important;">60 minutes</strong> and can only be used once.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ .ConfirmationURL }}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="25%" fillcolor="#6366f1" stroke="f">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Reset Password</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); background-color: #4f46e5; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 38px; border-radius: 12px; box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.5); letter-spacing: 0.2px; text-align: center;">
                      Reset Password &rarr;
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Security Notice Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="box-bg" style="background-color: #1e293b; background-image: linear-gradient(#1e293b, #1e293b); border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p class="box-text" style="margin: 0; font-size: 13px; color: #ffffff !important; line-height: 1.55;">
                      <strong style="color: #f59e0b !important;">Didn't request this change?</strong> You can safely ignore this email. Your current password remains active and secure.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p class="text-body" style="margin: 0 0 8px 0; font-size: 13px; color: #e2e8f0 !important; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8 !important; text-decoration: underline; font-weight: 600;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <!-- Security Tip -->
              <p class="footer-text" style="margin: 0; padding-top: 18px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8 !important; line-height: 1.55;">
                For your security, never forward or share this link. Pulse support will never ask you for your account password.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="padding: 24px 36px; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); border-top: 1px solid #1e293b; text-align: center;">
              <p class="footer-text" style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8 !important;">
                &copy; 2026 Pulse Life Tracker. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b !important;">
                Delivered securely via Brevo SMTP &bull; Encrypted TLS 1.3
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Confirm Your New Email Address (Change Email)

- **Supabase Template:** `Change email address`
- **Email Subject:** `Confirm your new email address - Pulse Life Tracker`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Confirm your new email address - Pulse Life Tracker</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0b1120 !important; background-image: linear-gradient(#0b1120, #0b1120) !important; }
      .card-bg { background-color: #131d33 !important; background-image: linear-gradient(#131d33, #131d33) !important; border-color: #1e293b !important; }
      .text-heading { color: #ffffff !important; }
      .text-primary { color: #f8fafc !important; }
      .text-body { color: #f1f5f9 !important; }
      .box-bg { background-color: #1e293b !important; background-image: linear-gradient(#1e293b, #1e293b) !important; border-color: #334155 !important; }
      .box-text { color: #ffffff !important; }
      .footer-bg { background-color: #0b1120 !important; border-color: #1e293b !important; }
      .footer-text { color: #94a3b8 !important; }
    }
    [data-ogsc] body, [data-ogsc] .email-bg { background-color: #0b1120 !important; }
    [data-ogsc] .card-bg { background-color: #131d33 !important; border-color: #1e293b !important; }
    [data-ogsc] .text-heading { color: #ffffff !important; }
    [data-ogsc] .text-primary { color: #f8fafc !important; }
    [data-ogsc] .text-body { color: #f1f5f9 !important; }
    [data-ogsc] .box-bg { background-color: #1e293b !important; border-color: #334155 !important; }
    [data-ogsc] .box-text { color: #ffffff !important; }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #f1f5f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px 16px;">
        <!-- Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="card-bg" style="max-width: 540px; background-color: #131d33; background-image: linear-gradient(#131d33, #131d33); border: 1px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #6366f1 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header / Pulse Logo -->
          <tr>
            <td align="center" style="padding: 36px 32px 18px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" valign="middle" style="padding-right: 14px;">
                    <img src="https://pulse-life-tracker.vercel.app/pwa-192x192.png" width="48" height="48" alt="Pulse Logo" style="width: 48px; height: 48px; border-radius: 12px; display: block; border: 0; outline: none; text-decoration: none;" />
                  </td>
                  <td align="left" valign="middle">
                    <div class="text-heading" style="font-size: 22px; font-weight: 800; color: #ffffff !important; letter-spacing: -0.5px; line-height: 1.15;">Pulse</div>
                    <div style="font-size: 11px; font-weight: 700; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.15; margin-top: 3px;">Life Tracker</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 16px 36px 32px 36px; text-align: left;">
              <h1 class="text-heading" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #ffffff !important; line-height: 1.35; text-align: center;">
                Confirm Your New Email
              </h1>
              
              <p class="text-body" style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #f1f5f9 !important;">
                We received a request to update the primary email address for your Pulse Life Tracker account to this address.
              </p>

              <p class="text-primary" style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: #ffffff !important; font-weight: 600;">
                Click the button below to verify this new email address and finalize the update.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ .ConfirmationURL }}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="25%" fillcolor="#6366f1" stroke="f">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Confirm Email Address</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); background-color: #4f46e5; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 38px; border-radius: 12px; box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.5); letter-spacing: 0.2px; text-align: center;">
                      Confirm Email Address &rarr;
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="box-bg" style="background-color: #1e293b; background-image: linear-gradient(#1e293b, #1e293b); border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p class="box-text" style="margin: 0; font-size: 13px; color: #ffffff !important; line-height: 1.55;">
                      <strong style="color: #38bdf8 !important;">Link valid for 24 hours.</strong> Once confirmed, your login email will be updated across all your devices.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p class="text-body" style="margin: 0 0 8px 0; font-size: 13px; color: #e2e8f0 !important; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8 !important; text-decoration: underline; font-weight: 600;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <!-- Security Disclaimer -->
              <p class="footer-text" style="margin: 0; padding-top: 18px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8 !important; line-height: 1.55;">
                If you did not request this email change, please sign in to your Pulse account immediately and update your password, or contact support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="padding: 24px 36px; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); border-top: 1px solid #1e293b; text-align: center;">
              <p class="footer-text" style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8 !important;">
                &copy; 2026 Pulse Life Tracker. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b !important;">
                Delivered securely via Brevo SMTP &bull; Encrypted TLS 1.3
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Magic Link Sign-In Email

- **Supabase Template:** `Magic link`
- **Email Subject:** `Your login link - Pulse Life Tracker`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Your login link - Pulse Life Tracker</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0b1120 !important; background-image: linear-gradient(#0b1120, #0b1120) !important; }
      .card-bg { background-color: #131d33 !important; background-image: linear-gradient(#131d33, #131d33) !important; border-color: #1e293b !important; }
      .text-heading { color: #ffffff !important; }
      .text-primary { color: #f8fafc !important; }
      .text-body { color: #f1f5f9 !important; }
      .box-bg { background-color: #1e293b !important; background-image: linear-gradient(#1e293b, #1e293b) !important; border-color: #334155 !important; }
      .box-text { color: #ffffff !important; }
      .footer-bg { background-color: #0b1120 !important; border-color: #1e293b !important; }
      .footer-text { color: #94a3b8 !important; }
    }
    [data-ogsc] body, [data-ogsc] .email-bg { background-color: #0b1120 !important; }
    [data-ogsc] .card-bg { background-color: #131d33 !important; border-color: #1e293b !important; }
    [data-ogsc] .text-heading { color: #ffffff !important; }
    [data-ogsc] .text-primary { color: #f8fafc !important; }
    [data-ogsc] .text-body { color: #f1f5f9 !important; }
    [data-ogsc] .box-bg { background-color: #1e293b !important; border-color: #334155 !important; }
    [data-ogsc] .box-text { color: #ffffff !important; }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #f1f5f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px 16px;">
        <!-- Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="card-bg" style="max-width: 540px; background-color: #131d33; background-image: linear-gradient(#131d33, #131d33); border: 1px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5); overflow: hidden;">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header / Pulse Logo -->
          <tr>
            <td align="center" style="padding: 36px 32px 18px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" valign="middle" style="padding-right: 14px;">
                    <img src="https://pulse-life-tracker.vercel.app/pwa-192x192.png" width="48" height="48" alt="Pulse Logo" style="width: 48px; height: 48px; border-radius: 12px; display: block; border: 0; outline: none; text-decoration: none;" />
                  </td>
                  <td align="left" valign="middle">
                    <div class="text-heading" style="font-size: 22px; font-weight: 800; color: #ffffff !important; letter-spacing: -0.5px; line-height: 1.15;">Pulse</div>
                    <div style="font-size: 11px; font-weight: 700; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.15; margin-top: 3px;">Life Tracker</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 16px 36px 32px 36px; text-align: left;">
              <h1 class="text-heading" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #ffffff !important; line-height: 1.35; text-align: center;">
                Instant Sign-In Link
              </h1>
              
              <p class="text-body" style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #f1f5f9 !important;">
                Click the button below to sign in directly to your Pulse Life Tracker dashboard without entering your password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ .ConfirmationURL }}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="25%" fillcolor="#6366f1" stroke="f">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Sign In to Pulse</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); background-color: #4f46e5; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 38px; border-radius: 12px; box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.5); letter-spacing: 0.2px; text-align: center;">
                      Sign In to Pulse &rarr;
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="box-bg" style="background-color: #1e293b; background-image: linear-gradient(#1e293b, #1e293b); border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p class="box-text" style="margin: 0; font-size: 13px; color: #ffffff !important; line-height: 1.55;">
                      <strong style="color: #38bdf8 !important;">Link valid for 10 minutes.</strong> For your protection, this single-use link will expire immediately after use.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p class="text-body" style="margin: 0 0 8px 0; font-size: 13px; color: #e2e8f0 !important; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all; line-height: 1.5;">
                <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8 !important; text-decoration: underline; font-weight: 600;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <!-- Security Disclaimer -->
              <p class="footer-text" style="margin: 0; padding-top: 18px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8 !important; line-height: 1.55;">
                If you did not request this login link, you can safely ignore this email. No changes have been made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="padding: 24px 36px; background-color: #0b1120; background-image: linear-gradient(#0b1120, #0b1120); border-top: 1px solid #1e293b; text-align: center;">
              <p class="footer-text" style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8 !important;">
                &copy; 2026 Pulse Life Tracker. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b !important;">
                Delivered securely via Brevo SMTP &bull; Encrypted TLS 1.3
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. How to Update Templates in Supabase Dashboard

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/hxrvffpoevfvoscwvcvd).
2. Go to **Authentication** &rarr; **Email Templates**.
3. For each template:
   - Select the template type (**Confirm signup**, **Reset password**, **Change email address**, or **Magic link**).
   - Update the **Subject line** as specified above.
   - Paste the corresponding HTML code into the **Body** editor.
   - Click **Save changes**.
