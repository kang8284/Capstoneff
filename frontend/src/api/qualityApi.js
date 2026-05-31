import { requestJson } from './client';

export function checkQuality({ imageFile, height, weight, gender }) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('height', height);
    formData.append('weight', weight);
    formData.append('gender', gender);

    return requestJson('/api/check-quality', {
        method: 'POST',
        body: formData,
    });
}
