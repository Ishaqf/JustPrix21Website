const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const helmet  = require('helmet');
const path    = require('path');
//const mongoSanitize = require('express-mongo-sanitize');

require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'development' &&
        origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    if (origin === process.env.CLIENT_ORIGIN) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(mongoSanitize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes — uncomment as each one is built:
// app.use('/api/users',    require('./routes/userRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/orders',   require('./routes/orderRoutes'));
// app.use('/api/reviews',  require('./routes/reviewRoutes'));
// app.use('/api/reels',    require('./routes/reelRoutes'));
// app.use('/api/admin',    require('./routes/adminRoutes'));

app.get('/api', (req, res) => {
  res.json({ success: true, message: '📱 JustPrix21 API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});