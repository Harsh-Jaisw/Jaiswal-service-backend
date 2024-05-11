"use strict";

const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const appRoutes = require("./routes/index");
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Load configuration from JSON file
const configPath = './config/default.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const port = config.port;
const httpsPort = 3000;  // Use the HTTPS port from the configuration or default to 3000

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

// Use your routes
app.use("/api/v1", (err, req, res, next) => {
    if (err && err.statusCode === 429) {
        res.status(429).json({ status: 429, message: "You have exceeded your 5 requests per minute limit." });
    } else {
        next(err);  // Propagate the error
    }
}, appRoutes);

// Determine environment (local or online)
const isLocal = config.environment === 'local';

if (isLocal) {
    const httpServer = http.createServer(app);

    httpServer.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
} else {
    const privateKeyPath = '/etc/letsencrypt/live/api.hdfonline.in/privkey.pem';
    const certificatePath = '/etc/letsencrypt/live/api.hdfonline.in/cert.pem';
    const chainPath = '/etc/letsencrypt/live/api.hdfonline.in/chain.pem';

    // Check if SSL certificate files exist
    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath) || !fs.existsSync(chainPath)) {
        console.error('SSL certificate files not found. Make sure the paths are correct.');
        process.exit(1);
    }

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const certificate = fs.readFileSync(certificatePath, 'utf8');
    const cas = fs.readFileSync(chainPath, 'utf8');

    const credentials = { key: privateKey, cert: certificate, ca: cas };

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(httpsPort, '0.0.0.0', () => {
        console.log(`Server is running at https://api.hdfonline.in`);
    });

    httpsServer.on('error', (error) => {
        console.error('HTTPS Server Error:', error);
    });

    httpsServer.on('listening', () => {
        console.log('HTTPS Server is listening on port', httpsServer.address().port);
    });
}
