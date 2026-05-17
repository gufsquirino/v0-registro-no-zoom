export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nome, email } = req.body;
  const [firstName, ...rest] = (nome || '').trim().split(' ');
  const lastName = rest.join(' ') || '-';

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const tokenRes = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    { method: 'POST', headers: { Authorization: `Basic ${credentials}` } }
  );
  const { access_token } = await tokenRes.json();

  const regRes = await fetch(
    `https://api.zoom.us/v2/webinars/WN_Gqz27rcrTlmRXkLm-CNXug/registrants`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
    }
  );
  const { join_url } = await regRes.json();

  return res.status(200).json({ join_url });
}