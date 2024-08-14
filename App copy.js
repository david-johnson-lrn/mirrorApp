import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const [controlEnabled, setControlEnabled] = useState(false);
  const [remoteCursorPosition, setRemoteCursorPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  let ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3002');

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = async (event) => {
      // console.log('Event received:', event);

      const readBlobAsText = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(blob);
        });
      };

      try {
        const result = await readBlobAsText(event.data);
        console.log('Message received:', result);
        const data = JSON.parse(result);
        if (data.type === 'move') {
          setRemoteCursorPosition({ x: data.x, y: data.y });
        } else if (data.type === 'click') {
          const mouseEvent = new MouseEvent('click', {
            clientX: data.x,
            clientY: data.y,
            bubbles: true,
            cancelable: true,
            view: window,
          });
          const target = document.elementFromPoint(data.x, data.y);
          if (target) {
            target.dispatchEvent(mouseEvent);
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleMouseControl = () => {
    if (window.confirm('Do you allow the app to control your mouse?')) {
      setControlEnabled(true);
    }
  };

  const handleMouseMove = (event) => {
    if (controlEnabled) {
      const { clientX: x, clientY: y } = event;
      const message = JSON.stringify({ type: 'move', x, y });
      console.log('Message sent:', message);
      ws.current.send(message);
    }
  };

  const handleClick = (event) => {
    if (controlEnabled) {
      const { clientX: x, clientY: y } = event;
      const message = JSON.stringify({ type: 'click', x, y });
      console.log('Click message sent:', message);
      ws.current.send(message);
    }
  };

  return (
    <div
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ width: '100vw', height: '50vh', border: '1px solid black', position: 'relative' }}
    >
      <button onClick={handleMouseControl}>Take Control</button>
      <div
        style={{
          position: 'absolute',
          left: remoteCursorPosition.x,
          top: remoteCursorPosition.y,
          width: '10px',
          height: '10px',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};

export default App;
