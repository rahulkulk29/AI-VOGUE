import fetch from 'node-fetch';

const apiKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
const url = 'https://api.groq.com/openai/v1/chat/completions';

async function test() {
    console.log('Testing Groq API Key...');
    if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️ GROQ_API_KEY environment variable is not set. Please set it before running.');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('FAILED:', response.status);
            console.error('Body:', text);
        } else {
            const data = await response.json();
            console.log('SUCCESS!');
            console.log('Response:', data.choices[0].message.content);
        }
    } catch (error) {
        console.error('ERROR:', error);
    }
}

test();
