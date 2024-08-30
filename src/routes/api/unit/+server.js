import { json } from '@sveltejs/kit';
import { SULU_API_KEY } from '$env/static/private';

export async function GET({ url }) {
    const category = url.searchParams.get('category');

    if (!category) {
        return json({ error: 'Category is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://unit-conversions.p.sulu.sh/v1/unit-conversions/${category}/units`, {
            headers: {
                Accept: 'application/json, text/plain',
                Authorization: `Bearer ${SULU_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return json(data);
    } catch (err) {
        console.error('Error fetching units:', err);
        return json({ error: 'Error fetching units' }, { status: 500 });
    }
}