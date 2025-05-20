const { connectDB, closeDB } = require("../utils/db");

exports.handler = async (event) => {
  try {
    const db = await connectDB();
    let nfts = [];

    if (event.httpMethod === 'POST') {
      const { address } = JSON.parse(event.body || '{}');
      if (address) {
        nfts = await db.collection('nfts').find({ owner: address }).toArray();
      }
    } else {
      nfts = await db.collection('nfts').find().limit(10).toArray();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ nfts })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await closeDB();
  }
};