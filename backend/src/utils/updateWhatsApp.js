import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  settings.whatsappNumber = '919549710379';
  settings.contact = {
    ...(settings.contact?.toObject?.() || settings.contact || {}),
    phone: '+919549710379',
  };
  await settings.save();
  console.log('WhatsApp updated:', settings.whatsappNumber);
  console.log('Phone updated:', settings.contact.phone);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
