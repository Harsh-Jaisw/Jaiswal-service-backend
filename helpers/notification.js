const admin = require('firebase-admin');
const serviceAccount = require('../config/firebse.config.json'); // Corrected typo

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

const sendFCMNotification = {
    sendFCMNotification: async (token, title, body) => {
        const message = {
            notification: { title, body },
            token: token
        };

        try {
            const response = await messaging.send(message); // Directly use messaging.send
            console.log('FCM notification sent successfully', response);
            return response;
        } catch (error) {
            console.error('Error sending FCM notification:', error);
        }
    }
};

module.exports = sendFCMNotification;
