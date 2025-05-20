// functions/ton-connect-callback.js

const { TonConnectServer } = require('@tonconnect/server');

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Use POST with address and proof in body." })
      };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed. Use POST." })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in request body" })
      };
    }

    const { address, proof } = body;
    if (!address || !proof) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing address or proof" })
      };
    }

    const tonConnect = new TonConnectServer({
      manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json'
    });

    const isValid = await tonConnect.verifyProof(proof);
    if (!isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid proof" })
      };
    }

    // ✅ Nếu muốn redirect về Telegram bot
    return {
      statusCode: 302,
      headers: {
        Location: `https://t.me/VinaGiftBot?start=connected_${address}`
      },
      body: ''
    };

    // Hoặc trả về thông tin để xử lý tiếp tại client
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ success: true, address })
    // };
  } catch (error) {
    console.error("Error in ton-connect-callback:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
