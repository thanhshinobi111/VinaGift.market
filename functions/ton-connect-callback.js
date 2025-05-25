const crypto = require('crypto');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST method is allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const { account, clientSessionId } = body;

    if (!account || !clientSessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing account or clientSessionId' }),
      };
    }

    // 👉 Lấy địa chỉ ví từ dữ liệu TonConnect
    const walletAddress = account.address;

    // 👉 Mã hóa base64 để gửi qua Telegram start param
    const startParam = Buffer.from(walletAddress).toString('base64');

    // 👉 Tên bot Telegram (lấy từ biến môi trường hoặc mặc định)
    const telegramBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'VinaGift_bot';

    const redirectUrl = `https://t.me/${telegramBotUsername}?start=${startParam}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Wallet connected successfully',
        redirectUrl,
        walletAddress,
      }),
    };
  } catch (error) {
    console.error('TonConnect callback error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
