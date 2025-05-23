// functions/get-balance.js
const { TonClient, Address } = require('@ton/ton');
require('dotenv').config();

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Only POST method supported' }) };
    }

    const { address } = JSON.parse(event.body || '{}');
    if (!address) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing address parameter' }) };
    }

    const client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: process.env.TONCENTER_API_KEY
    });

    const balance = await client.getBalance(Address.parse(address));
    const balanceInTon = Number(balance) / 1e9; // Convert nanoTON to TON

    return {
      statusCode: 200,
      body: JSON.stringify({ balance: balanceInTon })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};