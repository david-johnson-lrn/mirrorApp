import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const BrowseItems = () => {
  const { state } = useLocation();
  const ref = useRef(null);
  const [open, setOpen] = useState(true);

  const cleanupLearnosity = () => {
    const elements = ref.current.querySelectorAll(`[id^='author']`);
    elements.forEach((element) => {
      element.parentNode.removeChild(element);
    });
  };

  const loadLearnosity = async () => {
    try {
      let payload = {
        ...state,
        domain: window.location.hostname,
      }
      const response = await fetch(
        `/author-loader`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

      const html = await response.json();
      const { current } = ref;

      cleanupLearnosity(); // Clean up existing Learnosity elements

      for (let index = 0; index < html.length; index++) {
        const documentFragment = document
          .createRange()
          .createContextualFragment(html[index]);
        current.appendChild(documentFragment);
      }

      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadLearnosity(); // Load Learnosity content

    return cleanupLearnosity; // Clean up on unmount
  }, [state]);

  return (
    <React.Fragment>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper elevation={2} square={false} ref={ref}></Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default BrowseItems;
