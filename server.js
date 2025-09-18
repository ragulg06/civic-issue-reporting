const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const postRoutes = require('./routes/post');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const ivrRoutes = require('./routes/ivr');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

mongoose
  .connect('mongodb://127.0.0.1:27017/civic')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:' + PORT);
  console.log('IVR endpoints available at http://0.0.0.0:' + PORT + '/api/ivr/voice');
  console.log('Admin endpoints available at http://0.0.0.0:' + PORT + '/api/admin/complaints');
});
