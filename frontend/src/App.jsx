import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setMessage(data.message);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>React 정상 작동</h1>
      <h2>백엔드 응답:</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;