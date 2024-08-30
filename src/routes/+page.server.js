import { error } from '@sveltejs/kit';
import { SULU_API_KEY } from '$env/static/private';

export async function load({ fetch }) {
    try {
        const categoriesResponse = await fetch('https://unit-conversions.p.sulu.sh/v1/unit-conversions/categories', {
            headers: {
                Accept: 'application/json, text/plain',
                Authorization: `Bearer ${SULU_API_KEY}`
            }
        });

        if (!categoriesResponse.ok) {
            throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
        }

        const categoriesData = await categoriesResponse.json();
        return { categories: categoriesData.categories };
    } catch (err) {
        console.error('Error fetching categories:', err);
        throw error(500, 'Error fetching categories');
    }
}
