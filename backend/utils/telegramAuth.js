const crypto = require('crypto');

function verifyTelegramInitData(initDataRaw, botToken) {
  try {
    if (!initDataRaw) {
      return { ok: false, error: 'Missing initData' };
    }

    const urlSearchParams = new URLSearchParams(initDataRaw);
    const data = {};
    let hash = null;

    for (const [key, value] of urlSearchParams.entries()) {
      if (key === 'hash') {
        hash = value;
      } else {
        data[key] = value;
      }
    }

    if (!hash) {
      return { ok: false, error: 'Missing hash in initData' };
    }

    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hmac !== hash) {
      return { ok: false, error: 'Invalid initData hash' };
    }

    const parsed = {};
    Object.keys(data).forEach((key) => {
      if (key === 'user') {
        parsed.user = JSON.parse(data[key]);
      } else if (key === 'chat') {
        parsed.chat = JSON.parse(data[key]);
      } else if (key === 'auth_date') {
        parsed.auth_date = parseInt(data[key], 10);
      } else {
        parsed[key] = data[key];
      }
    });

    return { ok: true, data: parsed };
  } catch (err) {
    return { ok: false, error: 'Failed to verify initData' };
  }
}

module.exports = { verifyTelegramInitData };

