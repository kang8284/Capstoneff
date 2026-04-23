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
    <div>
      <h1>체형 데이터 입력</h1>

      <input
        type="text"
        placeholder="키 (cm)"
        value={height}
        onChange={(e) => handleNumberInput(e.target.value, setHeight)}
      />
      <br />

      <input
        type="text"
        placeholder="몸무게 (kg)"
        value={weight}
        onChange={(e) => handleNumberInput(e.target.value, setWeight)}
      />
      <br />

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <br />

      <h3>성별 선택</h3>
      <select
        value={gender}
        onChange={(e) => {
          setGender(e.target.value);
          setStyle('');
        }}
      >
        <option value="">선택</option>
        <option value="남자">남자</option>
        <option value="여자">여자</option>
      </select>

      <br />

      {gender && (
        <>
          <h3>스타일 선택</h3>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">선택</option>
            {styleOptions[gender].map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </>
      )}

      <br /><br />

      <button onClick={handleSubmit}>결과 보기</button>
    </div>
  );
}

export default InputPage;