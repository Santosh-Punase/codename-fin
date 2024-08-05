import mongoose from 'mongoose';
import fs from 'fs';

import connectDB from '../src/config/db.js';

// New schema
const newSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
}, { timestamps: true, collection: 'paymentmodes' });

const PaymentMode = mongoose.model('PaymentMode', newSchema);

export default async function migrate() {
  try {
    await connectDB();
    console.log('Database connected');

    const oldDocuments = await PaymentMode.find();
    console.log(`Found ${oldDocuments.length} documents to migrate`);

    const migrationPromises = oldDocuments.map((doc) => PaymentMode.updateOne(
      { _id: doc._id },
      {
        $set: {
          balance: 0, // Default balance value, modify if needed
        },
      },
    ));

    await Promise.all(migrationPromises);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    fs.writeFileSync('./migration-error.log', error.toString());
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
}
