import { json } from '@sveltejs/kit';
import { SULU_API_KEY } from '$env/static/private';

export async function POST({ request }) {
    const { category, fromUnit, toUnit, fromValue } = await request.json();

    const url = `https://unit-conversions.p.sulu.sh/v1/unit-conversions/${category}/${fromUnit}/to/${toUnit}`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain',
            Authorization: `Bearer ${SULU_API_KEY}`
        },
        body: JSON.stringify({ from_value: fromValue })
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return json(data);
    } catch (error) {
        console.error('Conversion error:', error);
        return json({ error: 'Error during conversion' }, { status: 500 });
    }
}