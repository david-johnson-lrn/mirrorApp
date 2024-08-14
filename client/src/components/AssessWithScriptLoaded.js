import React from 'react';

export const AssessWithScriptLoaded = (props) => {

    return (
        <div id='quiz-container'>
            {/* This tells Learnosity where to inject the API */}
            <div id='learnosity_assess'></div>
        </div>
    );
};