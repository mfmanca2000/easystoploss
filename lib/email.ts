import { Resend } from 'resend';

export async function sendAlert(symbol: string, currentPrice: number, sma150: number) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pctBelow = (((sma150 - currentPrice) / sma150) * 100).toFixed(2);
  const date = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  await resend.emails.send({
    from: process.env.ALERT_FROM_EMAIL!,
    to: process.env.ALERT_TO_EMAIL!,
    subject: `Stock Alert: ${symbol} is below its 150-day SMA`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#dc2626;margin-bottom:8px">⚠ ${symbol} below 150-day SMA</h2>
        <p style="color:#6b7280;margin-bottom:24px">${date}</p>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:12px 0;color:#6b7280">Current Price</td>
            <td style="padding:12px 0;font-weight:600;text-align:right">$${currentPrice.toFixed(2)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:12px 0;color:#6b7280">150-day SMA</td>
            <td style="padding:12px 0;font-weight:600;text-align:right">$${sma150.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#6b7280">% Below SMA</td>
            <td style="padding:12px 0;font-weight:600;color:#dc2626;text-align:right">${pctBelow}%</td>
          </tr>
        </table>
      </div>
    `,
  });
}
