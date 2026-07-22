const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const primaryURI = process.env.MONGO_URI;
  const fallbackURI = 'mongodb://127.0.0.1:27017/nutrition-assistant';

  // Override DNS servers to bypass Windows local DNS resolution failures for mongodb+srv
  if (primaryURI && primaryURI.startsWith('mongodb+srv')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('DNS servers configured to 8.8.8.8, 1.1.1.1 for Atlas connection.');
    } catch (dnsErr) {
      console.warn('DNS server override failed, using default system DNS:', dnsErr.message);
    }
  }

  try {
    console.log(`Attempting to connect to primary MongoDB...`);
    const conn = await mongoose.connect(primaryURI || fallbackURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary database connection error: ${error.message}`);
    if (primaryURI && primaryURI !== fallbackURI) {
      console.log(`Attempting connection fallback to local MongoDB database...`);
      try {
        const conn = await mongoose.connect(fallbackURI);
        console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
      } catch (fallbackError) {
        console.error(`Local MongoDB fallback connection failed: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
