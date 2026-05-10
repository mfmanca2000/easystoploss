const PUSHOVER_API = 'https://api.pushover.net/1/messages.json';

export async function sendPushNotification(symbol: string, currentPrice: number, sma150: number) {
  const token = process.env.PUSHOVER_APP_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;

  if (!token || !user) return;

  const pctBelow = (((sma150 - currentPrice) / sma150) * 100).toFixed(2);

  await fetch(PUSHOVER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      user,
      title: `${symbol} below 150-day SMA`,
      message: `Price: $${currentPrice.toFixed(2)} · SMA150: $${sma150.toFixed(2)} · ${pctBelow}% below`,
      priority: 1,
    }),
  });
}
