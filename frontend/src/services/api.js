const BASE_URL = '/api';

export async function analyzeTransaction(transaction) {
    try {
        const response = await fetch(`${BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn('Backend unavailable, using mock response:', error.message);
        return null;
    }
}

export async function getStats() {
    try {
        const response = await fetch(`${BASE_URL}/stats`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn('Stats endpoint unavailable:', error.message);
        return null;
    }
}

export async function getHealth() {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        return { status: 'offline' };
    }
}
