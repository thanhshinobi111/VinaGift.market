// functions/ton-connect-callback.js
const { TonConnectServer } = require('@tonconnect/sdk');

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    console.log("Request method:", event.httpMethod);
    console.log("Request body:", event.body);
    console.log("Query string parameters:", event.queryStringParameters);

    // Cho phép GET để debug trên trình duyệt
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "This endpoint expects a POST request from TON Connect. Use POST with address and proof in body or query parameters." })
      };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed. Use POST." })
      };
    }

    // TON Connect có thể gửi dữ liệu qua query string hoặc body
    let address, proof;
    if (event.queryStringParameters) {
      address = event.queryStringParameters.address;
      proof = event.queryStringParameters.proof;
    }

    if (!address || !proof) {
      if (!event.body) {
        console.log("No body or query parameters provided in request");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Request body or query parameters are empty" })
        };
      }

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

      address = body.address;
      proof = body.proof;
    }

    if (!address || !proof) {
      console.log("Missing address or proof in request:", { body: event.body, query: event.queryStringParameters });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing address or proof in request" })
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