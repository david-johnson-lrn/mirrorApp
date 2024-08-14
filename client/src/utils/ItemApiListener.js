/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';

export const QuizListener = (authentication) => {
    const ws = useRef(null);

    const [currentItem, setCurrentItem] = useState('');
    const [currentResponse, setCurrentResponse] = useState('');
    const [lrnObj, setObj] = useState('');

    function sendMessage(message) {

        ws.current.send(JSON.stringify(message));
    }


    let learnosityObj = "";

    useEffect(() => {


        if (authentication) {
            if (typeof LearnosityItems !== 'undefined') {
                // Initialize LearnosityItems
                learnosityObj = LearnosityItems.init(authentication.authenticated.request, {
                    readyListener() {
                        console.log('👍🏼 <<< Learnosity Assess API is ready >>> 🧘🏼');

                        let studentItem = {

                        }


                        const questionsApp = learnosityObj.questions();

                        Object.values(questionsApp).forEach((question) => {
                            question.on('changed', function () {
                                studentItem.item = learnosityObj.getCurrentItem().reference
                                studentItem.response = question.getResponse().value
                                learnosityObj.save()

                                learnosityObj.on('test:save:success', function () {
                                    console.log('This code executes when saving the assessment is successful.');
                                    setCurrentResponse(question.getResponse().value)

                                    sendMessage(studentItem)

                                });
                            });
                        });

                        learnosityObj.on("item:load", function () {

                            learnosityObj.save()
                            studentItem.item = learnosityObj.getCurrentItem().reference

                            sendMessage(studentItem)

                        })


                    },
                    errorListener(err) {
                        console.log('error', err);
                    },
                });

                setObj(learnosityObj)
            }

            if (typeof LearnosityReports !== 'undefined') {
                LearnosityReports.init(authentication, {
                    readyListener() {
                        console.log('👍🏼 <<< Learnosity Reports API is ready >>> 🧘🏼');
                    },
                    errorListener(err) {
                        console.log('error', err);
                    },
                });
            }

            if (typeof LearnosityAuthor !== 'undefined') {
                LearnosityAuthor.init(authentication, {
                    readyListener() {
                        console.log('👍🏼 <<< Learnosity Author API is ready >>> 🧘🏼');
                    },
                    errorListener(err) {
                        console.log('error', err);
                    },
                });
            }
        }

    }, [authentication, currentResponse]);

    //useEffect WebSocket
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

                let jsonResult = JSON.parse(result)

                setCurrentItem(jsonResult["item"])

                setCurrentResponse(jsonResult["response"])
                console.log('Message received:', result);

                // Handle the received message as needed
            } catch (error) {
                // console.error('Error parsing message:', error);
            }
        };

    }, [])

    //useEffect for checking changes to currentItem state
    useEffect(() => {
        if (currentItem) {


            console.log('Current item has been updated:', currentItem); // Log currentItem when it changes


            if (lrnObj != "") {

                lrnObj.items().goto(currentItem)
                console.log(currentResponse)
            }

        }
    }, [currentItem]);

    //useEffect for checking changes to currentItem state
    useEffect(() => {
        if (currentResponse) {

            if (lrnObj != "") {

                console.log(currentResponse)
            }

        }
    }, [currentResponse]);

    // console.log(currentItem)

    return (
        < div id='quiz-container' >
            {/* This tells Learnosity where to inject the API */}
            < div id='learnosity_assess' ></div >
        </div >
    );
};
