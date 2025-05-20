const { connectDB, closeDB } = require("../utils/db");

exports.handler = async (event) => {
  try {
    const db = await connectDB();
    const collections = await db.collections();
    const collectionNames = collections.map(c => c.collectionName);

    return {
      statusCode: 200,
      body: JSON.stringify({ collections: collectionNames })
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