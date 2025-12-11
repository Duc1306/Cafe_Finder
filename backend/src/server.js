// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / root
app.get('/', (req, res) => {
  res.json({ message: '☕ Welcome to Café Finder API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Routes
const authRoutes = require("./routes/authRoute");
const userRoutes = require('./routes/userRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminCafeRoutes = require('./routes/adminCafeRoutes');
const adminStatsRoutes = require("./routes/adminStatsRoutes");


const termsRoutes = require('./routes/termsRoutes');
const userCafeRoutes = require('./routes/userCafeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const nearbyRoutes = require('./routes/nearbyRoutes');
const { testConnection } = require('./config/database');


app.use('/api/terms', termsRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user/cafes', userCafeRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/user/favorites', favoriteRoutes);
app.use('/api/owner', ownerRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use('/api/admin/cafes', adminCafeRoutes);
app.use('/api/admin/terms', termsRoutes);

app.use("/uploads", express.static("uploads"));

// Error handling middleware (đặt sau các route)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


(async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
})();


// Nếu sau này cần import app ở chỗ khác (test unit, v.v.)
module.exports = app;
