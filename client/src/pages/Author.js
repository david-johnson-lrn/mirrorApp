import { useState, useEffect } from 'react';
import { useExternalScript } from '../hooks/useExternalScript';
import { AuthorWithScriptLoaded } from '../components/AuthorWithScriptLoaded';
import '../style/App.css';

const Author = () => {

  const [authorAPI, setauthorAPI] = useState(null);

  useEffect(() => {

    if (!authorAPI) {

      const callLearnosityAPI = async () => {
        const response = await fetch('/author-loader');
        const body = await response.json();

        if (response.status !== 200) {
          throw Error(body.message)
        }
        setauthorAPI(JSON.stringify(body));
      }

      callLearnosityAPI()
        .catch(console.error);
    }

  }, [authorAPI]);

  let authenticated = '';

  if (authorAPI) {
    //This is the signed JSON from the backend

    authenticated = JSON.parse(authorAPI);

  }

  const learnosityScript = '//authorapi.learnosity.com/?v2023.2.LTS';
  const status = useExternalScript(learnosityScript, authenticated.request);

  return (
    <>
      <div>
        {status === 'loading' && <p> loading... </p>}

        {status === 'ready' && <AuthorWithScriptLoaded />}
      </div>
    </>
  )
}

export default Author;