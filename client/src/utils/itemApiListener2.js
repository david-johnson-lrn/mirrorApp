/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';

export const QuizListener = ({ authenticated }) => {
    const ws = useRef(null);
    const [currentItem, setCurrentItem] = useState('');



    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3002');
        ws.current.onopen = () => {
            console.log('WebSocket connection established in Items API');
        };

        ws.current.onmessage = async (event) => {
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
                const jsonResult = JSON.parse(result);
                setCurrentItem(jsonResult["item"]);
                console.log('jsonResult["item"]:', jsonResult["item"]);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (currentItem) {
            console.log('Current item has been updated:', currentItem);
            if (typeof LearnosityItems !== 'undefined') {
                const learnosityObj = LearnosityItems.init(authenticated.request, {});
                learnosityObj.items().goto(currentItem);
            }
        }
    }, [currentItem, authenticated]);

    useEffect(() => {
        if (authenticated && typeof LearnosityItems !== 'undefined') {
            const learnosityObj = LearnosityItems.init(authenticated.request, {
                readyListener() {
                    console.log('👍🏼 <<< Learnosity Assess API is ready >>> 🧘🏼');
                    const questionsApp = learnosityObj.questions();
                    Object.values(questionsApp).forEach((question) => {
                        question.on('changed', function () {
                            const item = {
                                item: learnosityObj.getCurrentItem().reference,
                            };
                            ws.current.send(JSON.stringify(item));
                            console.log('Sending item:', item);
                        });
                    });
                },
                errorListener(err) {
                    console.log('error', err);
                },
            });
        }
    }, [authenticated]);

    return (
        <div id='quiz-container'>
            {/* This tells Learnosity where to inject the API */}
            <div id='learnosity_assess'></div>
        </div>
    );
};
