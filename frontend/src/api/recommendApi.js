import { requestJson } from './client';

export function getRecommendation({ gender, style, bodyType }) {
    return requestJson('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, style, bodyType }),
    });
}
