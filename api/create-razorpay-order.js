// Serverless API: Create Razorpay Order
// Usage: POST /api/create-razorpay-order with { planId: 'monthly' | 'yearly' | 'lifetime', userId: '...', currency: 'INR' }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { planId, userId, userEmail, currency = 'INR' } = req.body || {};

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay API credentials not configured on server.' });
  }

  // Official Plan amounts in paise (INR)
  const PLAN_AMOUNTS = {
    monthly: 9900,     // ₹99.00
    yearly: 79900,     // ₹799.00
    lifetime: 149900,  // ₹1,499.00
    founder: 149900    // ₹1,499.00
  };

  const amount = PLAN_AMOUNTS[planId];
  if (!amount) {
    return res.status(400).json({ error: `Invalid planId '${planId}'. Must be monthly, yearly, or lifetime.` });
  }

  const receipt = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        receipt: receipt,
        notes: {
          userId: userId || 'anonymous',
          userEmail: userEmail || '',
          planId: planId
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Create Razorpay Order] Razorpay API error:', data);
      return res.status(response.status).json({ error: data.error?.description || 'Failed to create order with Razorpay.' });
    }

    return res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      keyId: keyId
    });
  } catch (error) {
    console.error('[Create Razorpay Order] Server error:', error);
    return res.status(500).json({ error: 'Internal server error creating Razorpay order.' });
  }
}
