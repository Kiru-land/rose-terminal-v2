import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context.js';
import Prompt from './Prompt.js';
import BottomBar from './BottomBar.js';
import asciiArt from '../assets/ascii-art.txt';
import kiruascii from '../assets/kiruascii.txt';
import { FaEthereum, FaGithub, FaTwitter, FaBook, FaBars, FaTelegram, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Intro from './Intro.js';
import { usePopUp } from '../contexts/PopUpContext.js';
import Trade from './Trade.js';
import Clawback from './Clawback.js';
import ChartModal from './ChartModal.js';
import Create from './Create.js';
import lore1Music from '../assets/lore1.mp3';
import kirusaysmoney from '../assets/kirusaymoney.mp3';
import kirusayho from '../assets/kirusayho.mp3';
import kirusayfriend from '../assets/kirusayfriend.mp3';
import Personas from './Personas.js';

// Add this global style component
const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
`;

const TerminalContainer = styled.div`
  background-color: #000000;
  color: #e0e0e0;
  // font-family: 'Helvetica Neue';
  font-family: 'Fira Code', monospace;
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  ${props => props.isMobile && `
    width: 100%;
    height: 100vh;
    border-radius: 0;
  `}
`;

const beeMotion = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(0.5px, 0.5px) rotate(0.5deg); }
  50% { transform: translate(0, 1px) rotate(0deg); }
  75% { transform: translate(-0.5px, 0.5px) rotate(-0.5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const AsciiArtContainer = styled.pre`
  font-size: 0.3em;
  line-height: 1;
  color: #00ff00;
  text-align: center;
  margin-bottom: 20px;
  animation: ${props => props.isAnimating ? beeMotion : 'none'} 0.5s infinite;
`;

const ClickableAsciiArtContainer = styled(AsciiArtContainer)`
  transition: opacity 0.3s ease;
  width: 20vw;
  margin: auto;

  &:hover {
    opacity: 0.8;
  }
`;

const TerminalContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 5px;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  scrollbar-width: none;  /* Firefox */
  
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;  /* Chrome, Safari, and Opera */
  }

  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
`;

const OutputDiv = styled.div`
  position: absolute;
  top: 60px;  // Adjust this value to position below the GitHub icon
  left: 20px;
  max-width: 80%;
  max-height: 20%;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.8em;
  color: #00ff00;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  z-index: 5;  // Ensure it's above other elements

  &::-webkit-scrollbar {
    display: none;  // Hide scrollbar for WebKit browsers
  }
  scrollbar-width: none;  // Hide scrollbar for Firefox
`;

const CommandSpan = styled.span`
  color: skyblue;
`;

const glitterAnimation = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

const GlitterContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Glitter = styled.div`
  position: absolute;
  width: 5px;
  height: 5px;
  background-color: #fff;
  border-radius: 50%;
  opacity: 0;
  animation: ${glitterAnimation} 0.5s infinite;
  animation-delay: ${props => props.delay}s;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
`;

const AsciiArtWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const EthIcon = styled(FaEthereum)`
  vertical-align: middle;
  margin-right: 2px;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;

  &:hover {
    color: #fff;
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: -8px;
  background-color: black;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin-top: 4px;
  min-width: 40px;
`;

const DropdownItem = styled.a`
  color: #00ff00;
  padding: 8px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  border-radius: 4px;
  margin: 2px 0;
  width: 100%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 20px;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;  // Add some space between the menu and BottomBar
  ${props => props.isMobile && `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 10px;
  `}
`;

const rippleEffect = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const MenuItem = styled.button`
  background-color: transparent;
  color: #f0f0f0;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  // font-family: 'Helvetica Neue';
  font-family: 'Fira Code', monospace;
  font-size: 1em;
  transition: all 0.3s ease;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background-color: #00ff00;
    transition: all 0.3s ease;
  }

  &:hover {
    color: #00ff00;
    &:after {
      width: 100%;
      left: 0;
    }
  }

  ${props => props.isSelected && `
    color: #00ff00;
    &:after {
      width: 100%;
      left: 0;
    }
  `}

  ${props => props.isMobile && `
    padding: 15px;
    font-size: 18px;
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  `}
`;

const RippleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Ripple = styled.span`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  animation: ${rippleEffect} 1s;
`;

const RippleButton = ({ children, onClick, isMobile, isSelected }) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const addRipple = (event) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ripple = { x, y, key: Date.now() };
    setRipples((prevRipples) => [...prevRipples, ripple]);
  };

  const handleClick = (event) => {
    if (isMobile) {
      addRipple(event);
    }
    onClick(event);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setRipples([]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <MenuItem 
      ref={buttonRef} 
      onClick={handleClick} 
      isMobile={isMobile}
      isSelected={isSelected}
      role="menuitem"
    >
      {children}
      {isMobile && (
        <RippleContainer>
          {ripples.map((ripple) => (
            <Ripple
              key={ripple.key}
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
            />
          ))}
        </RippleContainer>
      )}
    </MenuItem>
  );
};

const KiruUsdButton = styled.button`
  font-family: 'Fira Code', monospace;
  background: none;
  border: none;
  color: #00FF00;
  font-size: 16px;
  padding: 8px;
  cursor: pointer;
  position: absolute;
  bottom: 60px;
  left: 30px;
  z-index: 1000;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  ${props => props.isMobile && `
    font-size: 18px;  // Larger text for mobile
  `}
`;

const ControlButton = styled.button`
  position: fixed;
  background: none;
  border: none;
  color: #00ff00;
  font-size: 24px;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.visible ? 1 : 0};
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
  }
`;

const AudioButton = styled(ControlButton)`
  top: 20px;
  right: 20px;
  z-index: 1002;  // Ensure it's above other elements
`;

const Terminal = ({ isMobile }) => {
  const [history, setHistory] = useState([]);
  const [asyncOutput, setAsyncOutput] = useState(null);
  const [asciiLogo, setAsciiLogo] = useState('');
  const [kiruAscii, setKiruAscii] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showTrade, setShowTrade] = useState(false);
  const [showClawback, setShowClawback] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const terminalContentRef = useRef(null);
  const outputRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const audioRef = useRef(new Audio(lore1Music));
  const timeoutRef = useRef(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const tradeAudioRef = useRef(new Audio(kirusaysmoney));
  const createAudioRef = useRef(new Audio(kirusayho));
  const clawbackAudioRef = useRef(new Audio(kirusayfriend));
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isAnyComponentOpen, setIsAnyComponentOpen] = useState(false);

  const { isConnected, signer, provider, balance: nativeBalance, kiruBalance, chainId, kiru, reserve0, reserve1, alpha } = useWeb3();
  const { showPopUp } = usePopUp();

  // Add ref for components container
  const componentsRef = useRef(null);

  useEffect(() => {
    fetch(asciiArt)
      .then(response => response.text())
      .then(text => setAsciiLogo(text));
    
    fetch(kiruascii)
      .then(response => response.text())
      .then(text => setKiruAscii(text));
  }, []);

  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (asyncOutput) {
      setHistory(prev => [...prev, { type: 'output', content: asyncOutput }]);
      setAsyncOutput(null);
    }
  }, [asyncOutput]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.8;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      if (!document.hidden && !isMuted) {
        audio.play().catch(error => console.error("Audio playback failed:", error));
      } else {
        audio.pause();
      }
    };

    // Initial play when component mounts
    if (!isMuted && !audioInitialized) {
      audio.play()
        .then(() => setAudioInitialized(true))
        .catch(error => {
          console.error("Audio playback failed:", error);
          const handleFirstInteraction = () => {
            audio.play()
              .then(() => {
                setAudioInitialized(true);
                document.removeEventListener('click', handleFirstInteraction);
              })
              .catch(error => console.error("Audio playback failed:", error));
          };
          document.addEventListener('click', handleFirstInteraction);
        });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMuted]); // Keep original dependency

  useEffect(() => {
    const audio = audioRef.current;
    if (isPageVisible && !isMuted) {
      setTimeout(() => {
        audio.volume = 0.2; // Make sure to set the same lower volume here
        audio.play().catch(error => console.error("Visibility audio playback failed:", error));
      }, 100);
    } else {
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.1) {
          audio.volume -= 0.1;
        } else {
          audio.pause();
          audio.volume = 0.2; // Update reset volume here too
          clearInterval(fadeOut);
        }
      }, 50);
    }
  }, [isPageVisible, isMuted]);

  useEffect(() => {
    const handleMouseMove = () => {
      setControlsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('button[role="menuitem"]') || event.target.closest('button[data-audio-control]')) {
        return;
      }
      
      if (componentsRef.current && !componentsRef.current.contains(event.target)) {
        if (showTrade) {
          setShowTrade(false);
          setSelectedCommand(null);
        }
        if (showClawback) {
          setShowClawback(false);
          setSelectedCommand(null);
        }
        if (showCreate) {
          setShowCreate(false);
          setSelectedCommand(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTrade, showClawback, showCreate]);

  useEffect(() => {
    setIsAnyComponentOpen(
      showTrade || 
      showClawback || 
      showCreate || 
      isChartModalOpen
    );
  }, [showTrade, showClawback, showCreate, isChartModalOpen]);

  const animateLogo = async (callback) => {
    setIsAnimating(true);
    try {
      await callback();
    } finally {
      setIsAnimating(false);
    }
  };

  const handleMenuClick = (command) => {
    if (!isConnected && command !== 'clawback' && command !== 'create') {
      setHistory(prev => [...prev, { type: 'output', content: 'Please connect your wallet.' }]);
      return;
    }

    if (provider && provider.network) {
      const chainId = provider.network.chainId;
      if (chainId !== 1n && chainId !== 17000n) {
        setHistory(prev => [...prev, { type: 'output', content: "Change network to the Holesky Testnet or Ethereum Mainnet" }]);
        return;
      }
    }

    setHistory(prev => [...prev, { type: 'command', content: command }]);

    const isCurrentlyOpen = (
      (command === 'trade' && showTrade) ||
      (command === 'clawback' && showClawback) ||
      (command === 'create' && showCreate)
    );

    if (isCurrentlyOpen) {
      // If it's already open, just close it
      setShowTrade(false);
      setShowClawback(false);
      setShowCreate(false);
      setSelectedCommand(null);
      setHistory(prev => [...prev, { type: 'output', content: `Closing ${command} interface...` }]);
      return;
    }

    // Close all command interfaces
    setShowTrade(false);
    setShowClawback(false);
    setShowCreate(false);

    let output = '';
    switch (command) {
      case 'trade':
        if (showTrade) {
          setShowTrade(false);
          setSelectedCommand(null);
          output = 'Closing trade interface...';
        } else {
          setShowTrade(true);
          setShowClawback(false);
          setShowCreate(false);
          setSelectedCommand('trade');
          output = 'Opening trade interface...';
          tradeAudioRef.current.play().catch(error => console.error("Trade audio playback failed:", error));
        }
        break;
      case 'clawback':
        if (showClawback) {
          setShowClawback(false);
          setSelectedCommand(null);
          output = 'Closing clawback interface...';
        } else {
          setShowClawback(true);
          setShowTrade(false);
          setShowCreate(false);
          setSelectedCommand('clawback');
          output = 'Opening clawback interface...';
          clawbackAudioRef.current.play().catch(error => console.error("Clawback audio playback failed:", error));
        }
        break;
      case 'create':
        if (showCreate) {
          setShowCreate(false);
          setSelectedCommand(null);
          output = 'Closing create interface...';
        } else {
          setShowCreate(true);
          setShowTrade(false);
          setShowClawback(false);
          setSelectedCommand('create');
          output = 'Opening create interface...';
          createAudioRef.current.play().catch(error => console.error("Create audio playback failed:", error));
        }
        break;
      default:
        output = `Command not found: ${command}`;
    }

    setHistory(prev => [...prev, { type: 'output', content: output }]);
  };

  const renderGlitters = () => {
    const glitters = [];
    for (let i = 0; i < 20; i++) {
      glitters.push(
        <Glitter
          key={i}
          delay={Math.random()}
          top={Math.random() * 100}
          left={Math.random() * 100}
        />
      );
    }
    return glitters;
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleContainerClick = (e) => {
    // Only focus the input if the click wasn't on the GitHub link
    if (!e.target.closest('a')) {
      // Remove this line as we no longer have an input field
      // inputRef.current.focus();
    }
  };

  const handleLogoClick = () => {
    if (kiru) {
      navigator.clipboard.writeText(kiru).then(
        () => {
          showPopUp('Kiru address copied to clipboard!');
        },
        (err) => {
          console.error('Failed to copy Kiru address: ', err);
          showPopUp('Failed to copy Kiru address');
        }
      );
    } else {
      showPopUp('Kiru address not available. Connect your wallet.');
    }
  };

  const handleOpenChartModal = () => {
    setIsChartModalOpen(true);
  };

  const handleCloseChartModal = () => {
    setIsChartModalOpen(false);
  };

  const renderMenuItems = () => {
    if (chainId === 17000n) {
      // Holesky Testnet options
      return ['trade', 'clawback', 'create'].map(command => (
        <RippleButton
          key={command}
          onClick={() => handleMenuClick(command)}
          isMobile={isMobile}
          isSelected={selectedCommand === command}
        >
          {command}
        </RippleButton>
      ));
    } else {
      // Mainnet options
      return ['clawback', 'create'].map(command => (
        <RippleButton
          key={command}
          onClick={() => handleMenuClick(command)}
          isMobile={isMobile}
          isSelected={selectedCommand === command}
        >
          {command}
        </RippleButton>
      ));
    }
  }

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <>
      <GlobalStyle />
      <TerminalContainer onClick={handleContainerClick} isMobile={isMobile}>
        <AudioButton 
          onClick={toggleMute} 
          visible={controlsVisible}
          data-audio-control
        >
          {!isMuted ? <FaVolumeUp /> : <FaVolumeMute />}
        </AudioButton>
        <DropdownContainer>
          <DropdownButton onClick={toggleDropdown}>
            <FaBars />
          </DropdownButton>
          <DropdownContent isOpen={isDropdownOpen}>
            <DropdownItem 
              href="https://github.com/Kiru-land/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="GitHub"
            >
              <FaGithub />
            </DropdownItem>
            <DropdownItem 
              href="https://twitter.com/kirutheangel" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="Twitter"
            >
              <FaTwitter />
            </DropdownItem>
            <DropdownItem
              href="https://t.me/KiruLand"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="Telegram"
            >
              <FaTelegram />
            </DropdownItem>
            <DropdownItem 
              href="https://kiru.gitbook.io/kiru/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="Docs"
            >
              <FaBook />
            </DropdownItem>
          </DropdownContent>
        </DropdownContainer>
        {showIntro && (
          <Intro asciiLogo={kiruAscii} onIntroComplete={handleIntroComplete} />
        )}
        <AsciiArtWrapper>
          <ClickableAsciiArtContainer 
            isAnimating={isAnimating}
            onClick={handleLogoClick}
          >
            {asciiLogo}
          </ClickableAsciiArtContainer>
          {isAnimating && (
            <GlitterContainer>
              {renderGlitters()}
            </GlitterContainer>
          )}
        </AsciiArtWrapper>
        <OutputDiv ref={outputRef}>
          {history.map((item, index) => (
            <div key={index}>
              {item.type === 'command' ? (
                <>
                  <Prompt />
                  <CommandSpan>{item.content}</CommandSpan>
                </>
              ) : (
                <div>
                  {typeof item.content === 'string' 
                    ? item.content.replace(/ETH/g, '<EthIcon />')
                    : item.content}
                </div>
              )}
            </div>
          ))}
          {asyncOutput && (
            <div>{asyncOutput}</div>
          )}
        </OutputDiv>
        <TerminalContent ref={terminalContentRef}>
          {/* Remove the history mapping from here */}
        </TerminalContent>
        <MenuContainer isMobile={isMobile}>
          {renderMenuItems()}
        </MenuContainer>
        <KiruUsdButton onClick={handleOpenChartModal} isMobile={isMobile}>
          💹
        </KiruUsdButton>
        <BottomBar />
        <Personas isVisible={!isAnyComponentOpen} />
        {/* Wrap all component renders in a div with the ref */}
        <div ref={componentsRef}>
          {showTrade && (
            <Trade 
              onClose={() => setShowTrade(false)} 
              animateLogo={animateLogo} 
              setAsyncOutput={setAsyncOutput}
            />
          )}
          {showClawback && (
            <Clawback 
              onClose={() => setShowClawback(false)} 
              animateLogo={animateLogo} 
              setAsyncOutput={setAsyncOutput}
            />
          )}
          {showCreate && (
            <Create 
              onClose={() => setShowCreate(false)} 
              animateLogo={animateLogo} 
              setAsyncOutput={setAsyncOutput}
            />
          )}
          {isChartModalOpen && <ChartModal onClose={handleCloseChartModal} />}
        </div>
      </TerminalContainer>
    </>
  );
};

export default Terminal;
