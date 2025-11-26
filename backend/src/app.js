const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ownerRouter = require('./routes/ownerRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Owner API
app.use('/api/owner', ownerRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Owner API running at http://localhost:${port}`);
});
