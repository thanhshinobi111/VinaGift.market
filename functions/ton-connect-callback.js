const { TonConnectServer } = require('@tonconnect/sdk');

exports.handler = async (event) => {
  try {
    console.log("Received event:", event); // Log toàn bộ event để debug
    console.log("Request method:", event.httpMethod);
    console.log("Request body:", event.body);

    // Kiểm tra phương thức request
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed. Use POST." })
      };
    }

    // Kiểm tra event.body
    if (!event.body) {
      console.log("No body provided in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Request body is empty" })
      };
    }

    // Parse JSON với kiểm tra lỗi
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.log("Failed to parse body:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in request body" })
      };
    }

    // Kiểm tra các trường cần thiết
    const { address, proof } = body;
    if (!address || !proof) {
      console.log("Missing address or proof in body:", body);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing address or proof in request body" })
      };
    }

    const tonConnect = new TonConnectServer({
      manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json'
    });

    const isValid = await tonConnect.verifyProof(proof);
    if (!isValid) {
      console.log("Invalid proof:", proof);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid proof' })
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: `https://t.me/VinaGiftBot?start=connected_${address}`
      },
      body: ''
    };
  } catch (error) {
    console.error("Error in ton-connect-callback:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};