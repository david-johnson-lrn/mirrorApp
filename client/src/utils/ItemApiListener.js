/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';

export const QuizListener = (authentication) => {
    const ws = useRef(null);

    const [currentItem, setCurrentItem] = useState('');
    const [currentResponse, setCurrentResponse] = useState('');
    const [lrnObj, setObj] = useState('');
    const [clicked, setClicked] = useState(false)


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
                        setObj(learnosityObj)


                        let studentItem = {

                        }

                        const questionsApp = learnosityObj.questions();

                        Object.values(questionsApp).forEach((question) => {
                            question.on('changed', function () {
                                console.log(clicked)
                                studentItem.item = learnosityObj.getCurrentItem().reference
                                studentItem.response = question.getResponse().value
                                console.log("clicked ininitial")


                                learnosityObj.save()

                                learnosityObj.on('test:save:success', function () {
                                    console.log('This code executes when saving the assessment is successful.');


                                    sendMessage(studentItem)

                                });
                            });
                        });



                        learnosityObj.on("item:load", function () {
                            //setClicked(false)

                            learnosityObj.save()
                            studentItem.item = learnosityObj.getCurrentItem().reference


                            learnosityObj.on('test:save:success', function () {

                                sendMessage(studentItem)
                            })

                        })

                        learnosityObj.on("item:unload", function () {
                            console.log("unloaded")
                            // setClicked(false)


                        })

                    },
                    errorListener(err) {
                        console.log('error', err);
                    },
                });


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

    }, [authentication]);

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
                console.log(result)
                let jsonResult = JSON.parse(result)

                setCurrentItem(jsonResult["item"])

                if (currentResponse != jsonResult["response"]) {
                    setCurrentResponse(jsonResult["response"])

                }

                // Handle the received message as needed
            } catch (error) {
                // console.error('Error parsing message:', error);
            }
        };
        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

    }, [])

    //useEffect for checking changes to currentItem state
    useEffect(() => {
        if (currentItem) {


            console.log('Current item has been updated:', currentItem); // Log currentItem when it changes


            if (lrnObj != "") {

                lrnObj.items().goto(currentItem)
                // console.log(currentResponse)
            }

        }
    }, [currentItem]);

    // useEffect for checking changes to currentItem state
    useEffect(() => {
        if (currentResponse) {

            console.log(clicked)


            if (!clicked && currentResponse) {

                let isSafe = lrnObj.safeToUnload();
                console.log(isSafe)
                console.log(lrnObj)
                if (isSafe) {
                    lrnObj.reset()

                    let newLrnObj = LearnosityItems.init(authentication.authenticated.request, {
                        readyListener() {
                            console.log('<<< Reconnecting Learnosity Assess API >>>');

                            setObj(newLrnObj)


                            let newStudentItem = {

                            }


                            // var validationOptions = {
                            //     showCorrectAnswers: true
                            // };

                            // newLrnObj.validateQuestions(validationOptions)
                            let newQestionsApp = newLrnObj.questions();
                            console.log(newLrnObj.questions())


                            Object.values(newQestionsApp).forEach((question) => {
                                question.on('changed', function () {

                                    setClicked(false)
                                    newStudentItem.item = newLrnObj.getCurrentItem().reference
                                    newStudentItem.response = question.getResponse().value

                                    newLrnObj.save()

                                    newLrnObj.on('test:save:success', function () {
                                        console.log('This code executes when saving the assessment is successful.');

                                        sendMessage(newStudentItem)

                                    });
                                });
                            });



                            newLrnObj.on("item:load", function () {
                                setClicked(false)

                                newLrnObj.save()
                                newStudentItem.item = newLrnObj.getCurrentItem().reference


                                newLrnObj.on('test:save:success', function () {
                                    sendMessage(newStudentItem)
                                })
                            })

                        },
                        errorListener(err) {
                            console.log('error', err);
                        },
                    })
                }

            }

        }
    }, [currentResponse]);


    // document.body.addEventListener("click", handleClick)

    function handleClick(event) {
        console.log(event.target)
        setClicked(true)
        // if (clicked === false) {
        //     setClicked(true)
        // }

    }



    return (
        < div id='quiz-container' onClick={handleClick}>
            {/* This tells Learnosity where to inject the API */}
            < div id='learnosity_assess' ></div >
        </div >
    );
};
