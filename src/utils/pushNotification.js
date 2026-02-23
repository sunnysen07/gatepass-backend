const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo();

/**
 * Send a push notification to a user's Expo push token.
 * @param {string} pushToken - The target user's Expo Push Token
 * @param {string} title - The notification title
 * @param {string} body - The notification body content
 * @param {object} data - Optional extra data payload
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
    if (!pushToken) {
        console.log("⚠️ Cannot send notification: No push token provided");
        return;
    }

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`❌ Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

    const messages = [
        {
            to: pushToken,
            sound: "default",
            title: title,
            body: body,
            data: data,
        },
    ];

    try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (let chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error("❌ Error sending push notification chunk:", error);
            }
        }

        console.log("✅ Push Notification sent successfully:", tickets);
        return tickets;
    } catch (error) {
        console.error("❌ Global error sending push notification:", error);
    }
};

module.exports = {
    sendPushNotification,
};
