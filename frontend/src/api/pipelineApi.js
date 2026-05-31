import { analyzeBody } from './bodyAnalysisApi';
import { getRecommendation } from './recommendApi';
import { startFittingByUrl, waitFittingResult } from './fittingApi';

export async function runResultPipeline({ userData, imageFile, onFittingUpdate }) {
    const bodyAnalysis = await analyzeBody({
        imageFile,
        height: userData.height,
        weight: userData.weight,
        gender: userData.gender,
    });

    const recommendation = await getRecommendation({
        gender: userData.gender,
        style: userData.style,
        bodyType: bodyAnalysis.bodyType,
    });

    const fittingStart = await startFittingByUrl({
        personFile: imageFile,
        topUrl: recommendation.best?.top?.imageUrl,
        bottomUrl: recommendation.best?.bottom?.imageUrl,
        jacketUrl: recommendation.best?.jacket?.imageUrl,
    });

    const fitting = await waitFittingResult(fittingStart.jobId, onFittingUpdate);

    return {
        bodyAnalysis,
        recommendation,
        fittingImage: fitting.resultUrl,
        fitting,
    };
}
