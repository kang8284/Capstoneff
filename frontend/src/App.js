import React, { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchItems = () => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        console.log('fetchItems 결과:', data);
        setItems(data);
      })
      .catch(err => console.error('Fetch error:', err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    console.log('Add 버튼 클릭됨');
    console.log('현재 입력값:', { title, description });

    if (!title) return alert("Title 입력 필요");

    try {
      console.log('fetch 요청 시작:', { title, description });
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });

      const data = await response.json();
      console.log('fetch 응답 데이터:', data);

      if (response.ok) {
        alert('✅ 등록 성공: ' + data.message);
        setTitle('');
        setDescription('');
        fetchItems();
      } else {
        alert('❌ 등록 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Add error:', error);
      alert('❌ 서버 오류 발생');
    }
  };

  const handleDelete = async (id) => {
    console.log('Delete 버튼 클릭됨, id:', id);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log('삭제 fetch 응답:', data);

      if (response.ok) {
        alert('✅ 삭제 성공: ' + data.message);
        fetchItems();
      } else {
        alert('❌ 삭제 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ 서버 오류 발생');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Item List</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>

      <ul>
  {Array.isArray(items) ? (
    items.map(item => (
      <li key={item.id}>
        <b>{item.title}</b>: {item.description} 
        <button onClick={() => handleDelete(item.id)} style={{ marginLeft: 10 }}>Delete</button>
      </li>
    ))
  ) : (
    <li>데이터가 없습니다.</li>
  )}
</ul>
      
    </div>
  );
}

export default App;