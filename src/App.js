import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTime, setSelectedTime] = useState(60); // 기본값 60초
  const [auctionData, setAuctionData] = useState([]);

  useEffect(() => {
    let intervalId;
    
    if (isRunning && time > 0) {
      intervalId = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auction-data');
        const data = await response.json();
        console.log('Received data:', data); // 디버깅을 위한 로그
        setAuctionData(data);
      } catch (error) {
        console.error('Error fetching auction data:', error);
      }
    };

    fetchAuctionData();
  }, []);

  const startTimer = () => {
    setTime(selectedTime);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(selectedTime);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <h1>타이머</h1>
      
      <div className="timer-controls">
        <select 
          value={selectedTime} 
          onChange={(e) => setSelectedTime(Number(e.target.value))}
          disabled={isRunning}
        >
          <option value={30}>30초</option>
          <option value={60}>1분</option>
          <option value={180}>3분</option>
          <option value={300}>5분</option>
          <option value={600}>10분</option>
        </select>

        <div className="timer-display">
          <h2>{formatTime(time)}</h2>
        </div>

        <div className="timer-buttons">
          {!isRunning ? (
            <button onClick={startTimer}>시작</button>
          ) : (
            <button className="stop-button" onClick={stopTimer}>정지</button>
          )}
          <button className="reset-button" onClick={resetTimer}>리셋</button>
        </div>
      </div>

      <div className="auction-data">
        <h2>경매 물건 정보</h2>
        <table>
          <thead>
            <tr>
              <th>용도/사건번호</th>
              <th>소재지</th>
              <th>감정가/최저가</th>
            </tr>
          </thead>
          <tbody>
            {auctionData.map((item, index) => (
              <tr key={index}>
                <td>{item.caseNumber}</td>
                <td>{item.location}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
