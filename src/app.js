const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ success: true, message: 'API is running' }));
app.use('/api', routes);

module.exports = app;
