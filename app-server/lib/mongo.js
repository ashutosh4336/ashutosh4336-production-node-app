import { MongoClient } from 'mongodb';
import logger from './logger.js';

// Connection URL
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);

// Database Name
const dbName = 'myDCTApp';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  logger.info('🎯 Successfully Connected to MongoDB.');

  const db = client.db(dbName);
  db.collection('prometheus');

  // the following code examples can be pasted here...

  return client;
}

export default main();
