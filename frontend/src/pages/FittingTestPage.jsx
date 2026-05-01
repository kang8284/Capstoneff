import { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
  { key: 'top',       label: '상의',    viton: true  },
  { key: 'bottom',    label: '하의',    viton: true  },
  { key: 'outer',     label: '아우터',  viton: true  },
  { key: 'accessory', label: '악세서리', viton: false },
  { key: 'shoes',     label: '신발',    viton: false },
  { key: 'other',     label: '기타',    viton: false },
];

const PHASE_LABELS = ['파일 선택', '업로드 중', '피팅 처리 중', '완료'];

/* ── 스타일 상수 ── */
const S = {
  card: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 10,
    padding: '14px 16px',
  },
  fileBtn: {
    display: 'inline-block',
    padding: '7px 14px',
    background: '#2a2a2a',
    color: '#ccc',
    border: '1px solid #444',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    userSelect: 'none',
  },
};

function StepBar({ phase }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {PHASE_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              margin: '0 auto',
              background: i < phase ? '#4caf50' : i === phase ? '#2196f3' : '#2a2a2a',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: 15,
              boxShadow: i === phase ? '0 0 0 4px rgba(33,150,243,0.25)' : 'none',
              transition: 'all 0.3s',
            }}>
              {i < phase ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: 12, marginTop: 6,
              color: i < phase ? '#4caf50' : i === phase ? '#2196f3' : '#555',
              fontWeight: i === phase ? 'bold' : 'normal',
            }}>
              {label}
            </div>
          </div>
          {i < PHASE_LABELS.length - 1 && (
            <div style={{
              height: 2, width: 24, flexShrink: 0,
              background: i < phase ? '#4caf50' : '#2a2a2a',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === 'done')       return <span>✅</span>;
  if (status === 'processing') return <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>;
  return <span style={{ color: '#444' }}>⬜</span>;
}

export default function FittingTestPage() {
  const [person, setPerson]   = useState(null);   // { file, preview }
  const [clothes, setClothes] = useState({});     // { key: { file, preview } }
  const [phase, setPhase]     = useState(0);      // 0~3
  const [jobData, setJobData] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const disabled = phase > 0 && phase < 3;

  const handlePerson = (e) => {
    const file = e.target.files[0];
    if (file) setPerson({ file, preview: URL.createObjectURL(file) });
  };

  const handleCloth = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setClothes(prev => ({ ...prev, [key]: { file, preview: URL.createObjectURL(file) } }));
  };

  const removeCloth = (key) => {
    setClothes(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const startFitting = async () => {
    if (!person)                          { alert('인물 사진을 선택해주세요'); return; }
    if (Object.keys(clothes).length === 0) { alert('의류를 최소 1개 선택해주세요'); return; }

    setPhase(1);
    setJobData(null);

    const formData = new FormData();
    formData.append('person', person.file);
    Object.entries(clothes).forEach(([key, val]) => formData.append(key, val.file));

    try {
      const res  = await fetch('http://localhost:3000/api/fitting', { method: 'POST', body: formData });
      const body = await res.json();
      if (body.error) throw new Error(body.error);

      setPhase(2);

      pollRef.current = setInterval(async () => {
        const pr   = await fetch(`http://localhost:3000/api/fitting/${body.jobId}`);
        const data = await pr.json();
        setJobData(data);
        if (data.status === 'done' || data.status === 'failed') {
          clearInterval(pollRef.current);
          setPhase(3);
        }
      }, 2000);

    } catch (err) {
      alert('오류: ' + err.message);
      setPhase(0);
    }
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setPerson(null); setClothes({}); setPhase(0); setJobData(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 28 }}>가상 피팅 테스트</h1>

      <StepBar phase={phase} />

      {/* ── 입력 영역 ── */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 28 }}>

        {/* 인물 사진 */}
        <div style={{ ...S.card, flex: '0 0 200px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>인물 사진</h3>
          <label style={S.fileBtn}>
            사진 선택
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={handlePerson} disabled={disabled} />
          </label>
          {person
            ? <img src={person.preview} alt="인물"
                style={{ display: 'block', width: '100%', marginTop: 12, borderRadius: 8, border: '2px solid #4caf50' }} />
            : <div style={{ width: '100%', height: 160, marginTop: 12, background: '#111', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 }}>
                미리보기
              </div>
          }
        </div>

        {/* 의류 목록 */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>의류 선택</h3>
          {CATEGORIES.map(({ key, label, viton }) => (
            <div key={key} style={{
              ...S.card,
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 8,
              borderColor: clothes[key] ? '#4caf50' : '#333',
            }}>
              <span style={{ width: 52, fontSize: 14, flexShrink: 0 }}>{label}</span>

              {!viton && (
                <span style={{ fontSize: 10, color: '#666', background: '#222',
                  padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>참고용</span>
              )}

              <label style={{ ...S.fileBtn, flexShrink: 0 }}>
                선택
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => handleCloth(key, e)} disabled={disabled} />
              </label>

              {clothes[key] ? (
                <>
                  <img src={clothes[key].preview} alt={label}
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                  <button onClick={() => removeCloth(key)} disabled={disabled}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 20, padding: 0 }}>
                    ✕
                  </button>
                </>
              ) : (
                <span style={{ fontSize: 12, color: '#444' }}>선택 안 됨</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 버튼 ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={startFitting} disabled={disabled}
          style={{ padding: '12px 36px', fontSize: 16, background: disabled ? '#333' : '#2196f3',
            color: 'white', border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          피팅 시작
        </button>
        {phase === 3 && (
          <button onClick={reset}
            style={{ padding: '12px 24px', fontSize: 16, background: '#444',
              color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            다시 시작
          </button>
        )}
      </div>

      {/* ── 진행 현황 + 결과 ── */}
      {jobData && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ marginBottom: 16 }}>피팅 현황</h2>

          {/* 현재 단계 메시지 */}
          {jobData.status === 'processing' && (
            <p style={{ color: '#2196f3', marginBottom: 16 }}>
              ⏳ {jobData.currentStep}
            </p>
          )}

          {/* 단계별 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {jobData.steps?.map((s) => (
              <div key={s.key} style={{
                ...S.card,
                display: 'flex', alignItems: 'center', gap: 14,
                borderColor: s.status === 'done' ? '#4caf50' : s.status === 'processing' ? '#2196f3' : '#333',
                background: s.status === 'done' ? '#111e11' : s.status === 'processing' ? '#101824' : '#1a1a1a',
                transition: 'all 0.3s',
              }}>
                <StatusIcon status={s.status} />
                <span style={{ fontWeight: 500 }}>{s.label}</span>
                {!s.viton && <span style={{ fontSize: 11, color: '#666' }}>피팅 미지원 — 업로드만</span>}
                {s.mock && s.status === 'done' && (
                  <span style={{ fontSize: 11, color: '#f59e0b' }}>mock (REPLICATE_API_TOKEN 없음)</span>
                )}
                {s.status === 'done' && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4caf50' }}>완료</span>}
                {s.status === 'processing' && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#2196f3' }}>처리 중...</span>}
                {s.status === 'pending' && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#444' }}>대기 중</span>}
              </div>
            ))}
          </div>

          {/* 최종 피팅 결과 이미지 */}
          {jobData.status === 'done' && jobData.resultUrl && (
            <div>
              <h2 style={{ marginBottom: 12 }}>피팅 결과</h2>
              {jobData.mock && (
                <div style={{ padding: '10px 14px', background: '#2a1f00', border: '1px solid #f59e0b',
                  borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#f59e0b' }}>
                  ⚠️ REPLICATE_API_TOKEN이 설정되지 않아 실제 피팅이 실행되지 않았습니다.
                  <br />backend/.env에 <code>REPLICATE_API_TOKEN=r8_...</code> 를 추가하면 실제 피팅이 동작합니다.
                </div>
              )}
              <img src={jobData.resultUrl} alt="피팅 결과"
                style={{ maxWidth: '100%', maxHeight: 600, objectFit: 'contain',
                  borderRadius: 10, border: '2px solid #4caf50', display: 'block' }} />

              {/* 참고용 아이템 (악세서리/신발/기타) */}
              {jobData.steps?.some(s => !s.viton && s.resultUrl) && (
                <div style={{ marginTop: 28 }}>
                  <h3 style={{ marginBottom: 12 }}>참고용 아이템</h3>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {jobData.steps.filter(s => !s.viton && s.resultUrl).map(s => (
                      <div key={s.key} style={{ textAlign: 'center' }}>
                        <img src={s.resultUrl} alt={s.label}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8,
                            border: '1px solid #444', display: 'block', marginBottom: 6 }} />
                        <span style={{ fontSize: 12, color: '#888' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {jobData.status === 'failed' && (
            <div style={{ padding: '12px 16px', background: '#1e0a0a',
              border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444' }}>
              ❌ 피팅 실패: {jobData.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
