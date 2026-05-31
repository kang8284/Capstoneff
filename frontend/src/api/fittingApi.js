import { requestJson } from './client';

export function startFittingByUrl({ personFile, topUrl, bottomUrl, jacketUrl }) {
    const formData = new FormData();
    formData.append('person', personFile);
    if (topUrl) formData.append('topUrl', topUrl);
    if (bottomUrl) formData.append('bottomUrl', bottomUrl);
    if (jacketUrl) formData.append('jacketUrl', jacketUrl);

    return requestJson('/api/fitting/by-url', {
        method: 'POST',
        body: formData,
    });
}

export function getFittingJob(jobId) {
    return requestJson(`/api/fitting/${jobId}`);
}

export async function waitFittingResult(jobId, onUpdate) {
    while (true) {
        const job = await getFittingJob(jobId);
        onUpdate?.(job);

        if (job.status === 'done') return job;
        if (job.status === 'failed') throw new Error(job.error || '가상피팅 실패');

        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
}
