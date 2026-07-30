const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { prisma, connectDatabase };
