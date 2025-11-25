import fetch from 'node-fetch';

const apiKey = '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';
const url = 'https://api.groq.com/openai/v1/chat/completions';

async function test() {
    console.log('Testing Groq API Key...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
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
