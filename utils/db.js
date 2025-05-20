const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://bobwsvn:<db_password>@cluster0.7vquwap.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client.db("vinagift"); // trả về instance database để dùng tiếp
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function closeDB() {
  await client.close();
  console.log("MongoDB connection closed");
}

module.exports = {
  connectDB,
  closeDB,
};
