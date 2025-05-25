// utils/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;
let db;

async function connectDB() {
  if (db) return db;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = client.db('vinagift');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
      { $set: { telegramId, tonAddress, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`Saved mapping for telegramId: ${telegramId}, tonAddress: ${tonAddress}`);
  } catch (error) {
    console.error('Error saving user mapping:', error);
    throw error;
  }
}

async function saveNFTMetadata(nft) {
  try {
    const db = await connectDB();
    await db.collection('nfts').updateOne(
      { index: nft.index, owner: nft.owner },
      { $set: { ...nft, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`Saved NFT metadata: ${nft.index}`);
  } catch (error) {
    console.error('Error saving NFT metadata:', error);
    throw error;
  }
}

module.exports = { connectDB, getUserAddress, getNFTsByOwner, saveUserMapping, saveNFTMetadata };