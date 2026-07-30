const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDatabase } = require('./src/config/db');

const PORT = process.env.PORT || 3001;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
