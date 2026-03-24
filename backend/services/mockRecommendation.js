// backend/services/mockRecommendation.js

async function getRecommendation(sessionId) {
  console.log('🧪 MOCK 추천 사용');

  return {
    style_type: '캐주얼',
    description: '편안하고 자연스러운 스타일입니다.',
    outfits: [
      {
        name: '화이트 셔츠',
        image_url: 'shirt.jpg',
        category: '상의'
      },
      {
        name: '청바지',
        image_url: 'jeans.jpg',
        category: '하의'
      }
    ]
  };
}

module.exports = {
  getRecommendation
};