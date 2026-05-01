import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function InputPage() {
  const navigate = useNavigate();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState(null);
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');

  const handleNumberInput = (value, setter) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value)) setter(value);
  };

  const styleOptions = {
    남자: ['캐주얼', '스트릿', '포멀'],
    여자: ['캐주얼', '스트릿', '러블리', '포멀']
  };

  const handleSubmit = async () => {
    if (!height || !weight || !image || !gender || !style) {
      alert('모든 값을 입력해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('height', height);
    formData.append('weight', weight);
    formData.append('gender', gender);
    formData.append('style', style);
    formData.append('image', image);

    try {
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      navigate('/result', {
        state: data.data
      });

    } catch (err) {
      console.error(err);
      alert('서버 오류');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-100 px-4 sm:px-6 py-6 sm:py-10">

      {/* ✅ ResultPage랑 동일 */}
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 제목 */}
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
          체형 정보 입력
        </h1>

        {/* 🔥 2열 구조 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ===== 기본 정보 ===== */}
          <div className="bg-white/80 backdrop-blur p-5 sm:p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-sm font-semibold text-blue-500 mb-4">
              기본 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">키 (cm)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => handleNumberInput(e.target.value, setHeight)}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">몸무게 (kg)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => handleNumberInput(e.target.value, setWeight)}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ===== 이미지 ===== */}
          <div className="bg-white/80 backdrop-blur p-5 sm:p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-sm font-semibold text-purple-500 mb-4">
              사진 업로드
            </h2>

            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg text-purple-400 mb-3">
                이미지 미리보기
              </div>
            )}

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

        </div>

        {/* ===== 스타일 ===== */}
        <div className="bg-white/80 backdrop-blur p-5 sm:p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-sm font-semibold text-indigo-500 mb-4">
            스타일 선택
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setStyle('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="">성별 선택</option>
              <option value="남자">남자</option>
              <option value="여자">여자</option>
            </select>

            {gender && (
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="">스타일 선택</option>
                {styleOptions[gender].map((s, i) => (
                  <option key={i}>{s}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl font-semibold text-white 
                     bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
                     hover:shadow-xl active:scale-95 transition"
        >
          결과 보기
        </button>

      </div>
    </div>
  );
}

export default InputPage;