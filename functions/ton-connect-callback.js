const { TonConnect } = require('@tonconnect/sdk');

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed. Use GET with tc query parameter.' })
      };
    }

    const query = event.queryStringParameters || {};

    if (!query.tc) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing TonConnect callback data (tc)' })
      };
    }

    let connectData;
    try {
      connectData = JSON.parse(decodeURIComponent(query.tc));
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid tc data format', details: parseError.message })
      };
    }

    const tonConnect = new TonConnect({
      manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json'
    });

    const walletInfo = await tonConnect.restoreConnection();
    if (!walletInfo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to restore wallet connection' })
      };
    }

    if (connectData.tonProof) {
      const isValid = await tonConnect.verifyTonProof(connectData.tonProof);
      if (!isValid) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Invalid TON proof' })
        };
      }
    }

    const address = walletInfo.account.address;
    return {
      statusCode: 302,
      headers: {
        Location: `https://t.me/VinaGiftBot?start=connected_${address}`
      },
      body: ''
    };

  } catch (error) {
    console.error('Error in ton-connect-callback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};