import React, { useState, useEffect } from 'react';
import { useExternalScript } from '../hooks/useExternalScript';
import Mouse from '../components/Mouse';
import { QuizListener } from '../utils/ItemApiListener';
import '../style/App.css';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

const Assess = () => {
  const [itemAPI, setItemAPI] = useState(null);

  useEffect(() => {
    if (!itemAPI) {
      const callLearnosityAPI = async () => {
        const response = await fetch('/quiz-loader');
        const body = await response.json();
        if (response.status !== 200) {
          throw new Error(body.message);
        }
        setItemAPI(JSON.stringify(body));
      };

      callLearnosityAPI().catch(console.error);
    }
  }, [itemAPI]);

  const authenticated = itemAPI ? JSON.parse(itemAPI) : null;


  const learnosityScript = '//items.learnosity.com/?v2023.3.LTS';
  const status = useExternalScript(learnosityScript);


  return (
    <>
      <div>
        <Header />
        {status ? (
          <QuizListener authenticated={authenticated} />
        ) : (
          'loading'
        )}
        <Mouse />
        <Footer />
      </div>
    </>
  );
};

export default Assess;
