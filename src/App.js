import React, { useState, useEffect } from 'react';
import Terminal from './components/Terminal';
import GlobalStyles from './styles/GlobalStyles';
import { Web3Provider } from './contexts/Web3Context';
import { PopUpProvider } from './contexts/PopUpContext';
import GlitterCursor from './components/GlitterCursor';
import MobileStyles from './styles/MobileStyles';

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
