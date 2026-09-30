/**
 * Backend / Serverless Function: Silent Background Support Inquiry Handler
 * Mirrors the silent dual-dispatch pattern from the Haryanvi Wedding Invitation project (/api/rsvp)
 * Compatible with Vercel Serverless Functions
 */

export default async function handler(req, res) {
  // 1. Handle CORS Pre-flight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const {
      _subject,
      Sender_Name,
      Sender_Email,
      Category,
      Subject,
      Message,
      Diagnostics,
      Target_Email = 'Navisingh2100@gmail.com',
      Submitted_At = new Date().toISOString()
    } = req.body || {};

    if (!Message || !Sender_Email) {
      return res.status(400).json({ error: 'Missing required fields: Message and Sender_Email' });
    }

    const payload = {
      _subject: _subject || `⚡ Pulse Support: [${Category || 'Feedback'}] ${Subject || 'Inquiry'}`,
      Sender_Name: Sender_Name || 'Pulse Operator',
      Sender_Email: Sender_Email,
      Category: Category || 'General',
      Subject: Subject || 'Support Request',
      Message: Message,
      Diagnostics: Diagnostics || 'N/A',
      Target_Email: Target_Email,
      Submitted_At: Submitted_At,
      _template: 'table',
      _captcha: 'false'
    };

    // Forward to FormSubmit in background with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      await fetch(`https://formsubmit.co/ajax/${Target_Email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).catch((err) => {
        console.warn('[Support Serverless] FormSubmit forward notice:', err?.message || err);
      });

      clearTimeout(timeoutId);
    } catch (forwardErr) {
      console.warn('[Support Serverless] Background forward notice:', forwardErr?.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Support inquiry recorded and dispatched to engineering team.',
      deliveredTo: Target_Email,
      timestamp: Submitted_At
    });

  } catch (error) {
    console.error('[Support Serverless] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing support inquiry.',
      details: error?.message
    });
  }
}
