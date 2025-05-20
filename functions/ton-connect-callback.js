// functions/ton-connect-callback.js
exports.handler = async (event) => {
  const { tc } = event.queryStringParameters;

  if (!tc) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing tc parameter' })
    };
  }

  try {
    const decodedTc = decodeURIComponent(tc);
    const parsedTc = JSON.parse(decodedTc);
    const address = parsedTc?.client_id?.split('_')?.[1];

    if (!address) {
      throw new Error('Invalid tc format');
    }

    const telegramBotUrl = `https://t.me/VinaGiftBot?start=connected_${address}`;
    return {
      statusCode: 302,
      headers: {
        Location: telegramBotUrl
      },
      body: ''
    };
  } catch (error) {
    console.error('Error processing tc:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};