require('dotenv').config();
const brevo = require('@getbrevo/brevo');

async function verifyKey() {
    console.log("Checking API Key...");
    if (!process.env.BREVO_API_KEY) {
        console.error("❌ No API KEY found in env");
        return;
    }
    console.log(`Key starts with: ${process.env.BREVO_API_KEY.substring(0, 10)}...`);

    const apiInstance = new brevo.AccountApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    try {
        const data = await apiInstance.getAccount();
        console.log(`✅ API Key Valid! Account: ${data.email}`);
    } catch (error) {
        console.error("❌ API Key Invalid or Network Error:");
        if (error.response) {
            console.error(`Status: ${error.response.statusCode}`);
            console.error(`Message: ${JSON.stringify(error.response.body)}`);
        } else {
            console.error(error.message);
        }

        if (process.env.BREVO_API_KEY.startsWith('xsmtpsib-')) {
            console.log("\n⚠️  WARNING: You provided a 'xsmtpsib-' key. This is an SMTP key.");
        }
    }
}

verifyKey();
