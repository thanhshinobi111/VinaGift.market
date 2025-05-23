// utils/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
let client;

async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('vinagift');
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
  }
}

async function saveNFTMetadata(ownerAddress, metadata) {
  const db = await connectDB();
  await db.collection('nfts').insertOne({
    owner: ownerAddress,
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    attributes: metadata.attributes || [],
    content_url: metadata.content_url,
    collection: metadata.collectionAddress,
    index: metadata.index,
    created_at: new Date()
  });
  await closeDB();
}

async function getNFTsByOwner(ownerAddress) {
  const db = await connectDB();
  const nfts = await db.collection('nfts').find({ owner: ownerAddress }).toArray();
  await closeDB();
  return nfts;
}

async function saveUserMapping(telegramId, tonAddress) {
  const db = await connectDB();
  await db.collection('users').updateOne(
    { telegramId },
    { $set: { tonAddress, updated_at: new Date() } },
    { upsert: true }
  );
  await closeDB();
}

async function getUserAddress(telegramId) {
  const db = await connectDB();
  const user = await db.collection('users').findOne({ telegramId });
  await closeDB();
  return user?.tonAddress;
}

module.exports = { connectDB, closeDB, saveNFTMetadata, getNFTsByOwner, saveUserMapping, getUserAddress };