// backend/services/recommendationService.js

const mock = require('./mockRecommendation');
const real = require('./realRecommendation');

// 🔥 .env로 관리 추천
const USE_MOCK = process.env.USE_MOCK === 'true';

const service = USE_MOCK ? mock : real;

module.exports = service;