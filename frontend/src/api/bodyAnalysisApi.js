import { requestJson } from './client';

export function analyzeBody({ imageFile, height, weight, gender }) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('height', height);
    formData.append('weight', weight);
    formData.append('gender', gender);

    return requestJson('/api/body-analysis', {
        method: 'POST',
        body: formData,
    });
}
