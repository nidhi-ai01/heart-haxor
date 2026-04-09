
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');
const http = require('http');

// Load environment variables manually
const envPath = path.resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const GROQ_API_KEY = envConfig.GROQ_API_KEY;
const VOICE_SERVICE_URL = envConfig.VOICE_SERVICE_URL;

console.log('--- DIAGNOSTICS START ---');
console.log(`GROQ_API_KEY Length: ${GROQ_API_KEY ? GROQ_API_KEY.length : 'MISSING'}`);
console.log(`VOICE_SERVICE_URL: ${VOICE_SERVICE_URL}`);

async function testGroq() {
    console.log('\nTesting Groq API...');
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here' || GROQ_API_KEY.includes('gsk_...')) {
        console.error('ERROR: GROQ_API_KEY appears to be a placeholder or invalid.');
        return;
    }

    try {
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Ping' }],
            model: 'llama3-8b-8192',
        });
        console.log('Groq API Success! Response:', completion.choices[0]?.message?.content);
    } catch (error) {
        console.error('Groq API Failed:', error.message);
    }
}

function testVoice() {
    console.log('\nTesting Voice Service...');
    if (!VOICE_SERVICE_URL) {
        console.error('ERROR: VOICE_SERVICE_URL is missing.');
        return;
    }

    const url = new URL(VOICE_SERVICE_URL);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: '/', // Suggest hitting root or health check
        method: 'GET',
        timeout: 2000
    };

    const req = http.request(options, (res) => {
        console.log(`Voice Service HTTP Status: ${res.statusCode}`);
        res.on('data', () => { }); // Consume data
    });

    req.on('error', (e) => {
        console.error('Voice Service Connection Failed:', e.message);
    });

    req.on('timeout', () => {
        req.destroy();
        console.error('Voice Service Timed Out');
    });

    req.end();
}

(async () => {
    await testGroq();
    testVoice();
})();
