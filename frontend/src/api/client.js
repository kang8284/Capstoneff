export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function requestJson(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(data?.message || data?.error || 'API 요청 실패');
    }

    return data;
}
