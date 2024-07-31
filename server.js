"use strict";

const fs = require('fs');
const http = require('http');
const express = require('express');
const appRoutes = require("./routes/index");
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Load configuration from JSON file
const configPath = './config/default.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const port = config.port;


// Enable CORS
app.use(cors({ origin: '*' }));

// Body parser middleware
app.use(express.json());

// Helmet for security headers
app.use(helmet());

// Compression middleware
app.use(compression());

// Disable x-powered-by header
app.disable('x-powered-by');

// Use morgan for request logging
app.use(morgan('combined'));


// Serve static files from the "public" directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Use your routes
app.use("/api/v1", (err, req, res, next) => {
    if (err && err.statusCode === 429) {
        res.status(429).json({ status: 429, message: "You have exceeded your 5 requests per minute limit." });
    } else {
        next(err);  // Propagate the error
    }
}, appRoutes);




const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


