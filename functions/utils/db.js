const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://<bobwsvn>:<HdcFJCtND68G0K1f>@cluster0.mongodb.net/vinagiftmarket?retryWrites=true&w=majority'; // Thay bằng connection string thực
let client;
let db;

const getDb = async () => {
  if (db) return db;

  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db('vinagiftmarket');
  return db;
};

module.exports = { getDb };
