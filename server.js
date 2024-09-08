'use strict';

const fs = require('fs');
const http = require('http');
const express = require('express');
const appRoutes = require('./routes/index');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');
const common = require('./helpers/common'); // Ensure this path is correct

const app = express();

// Load configuration from JSON file
const configPath = './config/default.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const port = config.port;

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(helmet());
app.use(compression());
app.disable('x-powered-by');
app.use(morgan('combined'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/v1', appRoutes);

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('welcome', { message: 'Welcome to the server!' });

  // const intervalId = setInterval(() => {
  //   io.emit('serverUpdate', {
  //     time: new Date().toISOString(),
  //     message: 'Server is still running'
  //   });
  // }, 5000);

  // const clientIntervalId = setInterval(() => {
  //   socket.emit('clientUpdate', {
  //     time: new Date().toISOString(),
  //     message: 'This is a message just for you'
  //   });
  // }, 3000);

  socket.on('sendCoordinates', async (data, callback) => {
    console.log('Received coordinates:', data);
    try {
      if (!data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
        console.error('Invalid coordinates data:', data);
        return callback({
          success: false,
          message: 'Invalid coordinates data',
          error: 'Invalid coordinates data',
        });
      }

      const { latitude, longitude } = data;
      const address = await common.getAddressFromCoordinates(latitude, longitude);
      if (address) {
        callback({
          success: true,
          message: 'Address fetched successfully',
          address: address,
        });
      } else {
        callback({
          success: false,
          message: 'Unable to fetch address',
          error: 'No address found',
        });
      }
    } catch (error) {
      console.error('Error in sendCoordinates:', error);
      callback({
        success: false,
        message: 'Error fetching address',
        error: error.message,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    // clearInterval(intervalId);
    // clearInterval(clientIntervalId);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_timeout', (timeout) => {
    console.error('Connection timeout:', timeout);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
