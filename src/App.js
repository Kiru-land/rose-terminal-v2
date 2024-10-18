import React, { useState, useEffect } from 'react';
import Terminal from './components/Terminal.js';
import GlobalStyles from './styles/GlobalStyles.js';
import { Web3Provider } from './contexts/Web3Context.js';
import { PopUpProvider } from './contexts/PopUpContext.js';
import GlitterCursor from './components/GlitterCursor.js';
import MobileStyles from './styles/MobileStyles.js';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <Web3Provider>
      <PopUpProvider>
        <GlobalStyles />
        {isMobile && <MobileStyles />}
        <Terminal isMobile={isMobile} />
        {!isMobile && <GlitterCursor />}
      </PopUpProvider>
    </Web3Provider>
  );
}

export default App;
