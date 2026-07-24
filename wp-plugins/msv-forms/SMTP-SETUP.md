# Enabling SMTP for MSV Email Delivery

Add these lines to your wp-config.php on the VPS (before "That's all, stop editing!"):

define('MSV_FORMS_USE_SMTP', true);
define('MSV_FORMS_SMTP_PASS', 'YOUR-EMAIL-PASSWORD-HERE');

The other SMTP settings (host, port, user) are already set:
- Host: mail.mysecretvitality.com
- Port: 587 (TLS)
- User: no-reply@mysecretvitality.com

After adding these, all WooCommerce order emails AND contact form emails will
route through your SMTP server.

If you use a different email provider (e.g. SendGrid, Mailgun), update the
host/port/user constants in msv-forms.php accordingly.
