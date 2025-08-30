const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

const envPath =
  env === 'production'
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env.development');

dotenv.config({ path: envPath });

console.log(`Running ${env.toUpperCase()} Environment`);
