// utils/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = "mongodb+srv://bobwsvn:<db_password>@cluster0.7vquwap.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client;

async function connectDB() {
  if (!client) {
    try {
      client = new MongoClient(uri);
      await client.connect();
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  return client.db('vinagift');
}

async function closeDB() {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed');
      client = null;
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

async function saveNFTMetadata(ownerAddress, metadata) {
  try {
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
  } catch (error) {
    console.error('Error saving NFT metadata:', error);
    throw error;
  }
}

async function getNFTsByOwner(ownerAddress) {
  try {
    const db = await connectDB();
    const nfts = await db.collection('nfts').find({ owner: ownerAddress }).toArray();
    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
}

async function saveUserMapping(telegramId, tonAddress) {
  try {
    const db = await connectDB();
    await db.collection('users').updateOne(
      { telegramId },
      { $set: { tonAddress, updated_at: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error saving user mapping:', error);
    throw error;
  }
}

async function getUserAddress(telegramId) {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ telegramId });
    return user?.tonAddress;
  } catch (error) {
    console.error('Error fetching user address:', error);
    throw error;
  }
}

module.exports = {
  connectDB,
  closeDB,
  saveNFTMetadata,
  getNFTsByOwner,
  saveUserMapping,
  getUserAddress
};