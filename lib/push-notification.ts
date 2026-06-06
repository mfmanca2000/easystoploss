const TELEGRAM_API = 'https://api.telegram.org';

export async function sendPushNotification(symbol: string, currentPrice: number, sma150: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Telegram env vars missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return;
  }

  const pctBelow = (((sma150 - currentPrice) / sma150) * 100).toFixed(2);

  const text =
    `⚠️ <b>${symbol}</b> is below its 150-day SMA\n\n` +
    `Price: <b>$${currentPrice.toFixed(2)}</b>\n` +
    `SMA150: <b>$${sma150.toFixed(2)}</b>\n` +
    `% below: <b>${pctBelow}%</b>`;

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Telegram API error ${res.status}: ${body}`);
  }
}
