import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';

const Mouse = () => {
    const [controlEnabled, setControlEnabled] = useState(false);
    const [remoteCursorPosition, setRemoteCursorPosition] = useState({ x: 0, y: 0 });
    const [zIndexValue, setZindexValue] = useState(1);
    const [pointEvent, setPointEvent] = useState("auto")
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
                //console.log('Message received:', result);
                const data = JSON.parse(result);
                if (data.type === 'move') {
                    setRemoteCursorPosition({ x: data.x, y: data.y });
                    setZindexValue(1000)
                    setPointEvent("none")
                } else if (data.type === 'click') {

                    dispatchClickEvent(data.x, data.y);
                }


            } catch (error) {
                // console.error('Error parsing message:', error);
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

            document.getElementById('mouseCanvas').style.zIndex = "1000";
            document.getElementById('mouseCanvas').style.pointerEvents = "auto";

            document.getElementById('mousePointer').style.backgroundColor = "white";


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

    const dispatchClickEvent = (x, y) => {
        const target = document.elementFromPoint(x, y);
        if (target) {
            const mouseEvent = new MouseEvent('click', {
                clientX: x,
                clientY: y,
                bubbles: true,
                cancelable: true,
                view: window,
            });
            target.dispatchEvent(mouseEvent);
            console.log(`Click event dispatched to ${target.tagName} at (${x}, ${y})`);
        }
    };

    return (
        <div
            id={"mouseCanvas"}
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{
                width: '100vw',
                height: '70vh',
                border: '1px solid black',
                position: 'fixed',
                top: "1px",
                zIndex: zIndexValue,
                pointerEvents: pointEvent

            }}
        >
            <button onClick={handleMouseControl} style={{
                position: "fixed",
                top: "3vh",
                left: "50vw",
                padding: "1em"
            }} >Take Control</button>

            <div

                id={"mousePointer"}
                style={{
                    position: 'absolute',
                    left: remoteCursorPosition.x,
                    top: remoteCursorPosition.y,
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: "none"

                }}
            />
        </div>
    );
};

export default Mouse;
