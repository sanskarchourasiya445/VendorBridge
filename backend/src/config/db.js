// =============================================================================
// config/db.js — MongoDB Atlas persistence layer.
//
// Strategy: the app keeps its fast synchronous in-memory Collection model, but
// on boot we (1) connect to MongoDB, (2) load each collection from the DB,
// (3) seed the DB from the bundled seed the first time it is empty, and
// (4) bind a write-through hook so every create/update/remove is mirrored to
// MongoDB. Reads stay in-memory (sync, fast); writes persist to Atlas.
//
// If MONGODB_URI is not set, the app runs exactly as before (pure in-memory),
// so the project still works without a database for quick local demos.
// =============================================================================
import { MongoClient } from 'mongodb';
import models from '../models/index.js';

// Map our Collection singletons to MongoDB collection names.
const RESOURCES = [
  ['users', models.Users],
  ['vendors', models.Vendors],
  ['rfqs', models.Rfqs],
  ['quotations', models.Quotations],
  ['purchaseOrders', models.PurchaseOrders],
  ['invoices', models.Invoices],
  ['approvals', models.Approvals],
  ['activityLogs', models.ActivityLogs],
];

let client = null;
let db = null;

/** Strip Mongo's internal _id so our records stay clean (we key on `id`). */
function stripMongoId({ _id, ...rest }) {
  return rest;
}

/**
 * Connect to MongoDB Atlas, hydrate/seed collections, and wire write-through.
 * Returns true when a DB was attached, false when running in-memory.
 */
export async function initDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // eslint-disable-next-line no-console
    console.log('  [db] MONGODB_URI not set — running with in-memory data only.');
    return false;
  }

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'vendorbridge');
  // eslint-disable-next-line no-console
  console.log(`  [db] Connected to MongoDB → ${db.databaseName}`);

  for (const [name, collection] of RESOURCES) {
    const mongoCol = db.collection(name);
    const existing = await mongoCol.find({}).toArray();

    if (existing.length === 0) {
      // First run: seed Atlas from the bundled in-memory records.
      const seedRows = collection.all();
      if (seedRows.length) {
        await mongoCol.insertMany(seedRows.map((r) => ({ ...r })));
        await mongoCol.createIndex({ id: 1 }, { unique: true });
        // eslint-disable-next-line no-console
        console.log(`  [db] Seeded "${name}" with ${seedRows.length} records.`);
      }
    } else {
      // Subsequent runs: the database is the source of truth.
      collection.hydrate(existing.map(stripMongoId));
      // eslint-disable-next-line no-console
      console.log(`  [db] Loaded "${name}" (${existing.length} records).`);
    }

    // Mirror every future mutation to Atlas (upsert on `id`, delete by `id`).
    collection.bindPersistence(async (op, record) => {
      if (op === 'remove') {
        await mongoCol.deleteOne({ id: record.id });
      } else {
        await mongoCol.updateOne(
          { id: record.id },
          { $set: { ...record } },
          { upsert: true }
        );
      }
    });
  }

  return true;
}

/** Gracefully close the connection (called on shutdown). */
export async function closeDatabase() {
  if (client) await client.close();
  client = null;
  db = null;
}

export const getDb = () => db;
export default { initDatabase, closeDatabase, getDb };
