import { MongoClient } from 'mongodb';
import logger from './logger.js';

// Connection URL
const url = 'mongodb://mongodb:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myDCTApp';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  logger.info('Connected successfully to server');

  const db = client.db(dbName);
  const collection = db.collection('prometheus');

  // the following code examples can be pasted here...

  return 'done.';
}

main()
  .then(logger.info)
  .catch(logger.error)
  .finally(() => client.close());
