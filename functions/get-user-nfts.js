// functions/get-user-address.js
const { getUserAddress } = require('../utils/db');
require('dotenv').config();

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Only POST method supported' })
      };
    }

    const { telegramId } = JSON.parse(event.body || '{}');
    if (!telegramId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing telegramId parameter' })
      };
    }

    const address = await getUserAddress(telegramId);
    if (!address) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No TON address found for this Telegram ID' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ address })
    };
  } catch (error) {
    console.error('Error in get-user-address:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch address: ${error.message}` })
    };
  }
};