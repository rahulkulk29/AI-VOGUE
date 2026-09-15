import fetch from 'node-fetch';

const testChat = async () => {
    try {
        console.log('Testing chat endpoint...');
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'test',
                message: 'Hello, recommend me a moisturizer'
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ FAILED:', response.status);
            console.error('Body:', text);
        } else {
            const data = await response.json();
            console.log('✅ SUCCESS!');
            console.log('Advice:', data.advice);
            console.log('Products found:', data.products?.length || 0);
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
};

testChat();
