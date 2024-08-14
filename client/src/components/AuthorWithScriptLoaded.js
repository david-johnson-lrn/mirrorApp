import React from 'react';

export const AuthorWithScriptLoaded = () => {

    const authorStyles = {
        display: "flex",
        justifyContent: "end",
        margin: "1rem"
    }

    return (
        <div>
            <div style={authorStyles}>

                <a href="/"><button style={{ fontSize: 'large' }}>Home</button></a>
            </div>
            <div id="author_container">
                <div id='learnosity-author'></div>

            </div>
        </div>
    );
};