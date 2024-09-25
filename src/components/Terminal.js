import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import Prompt from './Prompt';
import BottomBar from './BottomBar';
import asciiArt from '../assets/ascii-art.txt';
import Chart from './Chart';
import { FaEthereum, FaGithub } from 'react-icons/fa6';
import Intro from './Intro';
import SnakeGame from './SnakeGame';
import { usePopUp } from '../contexts/PopUpContext';
import Trade from './Trade';
import Transfer from './Transfer';
import Sale from './Sale';

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
  max-height: 40%;
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

const GitHubLink = styled.a`
  position: absolute;
  top: 20px;
  left: 20px;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  text-decoration: none;
  z-index: 10;  // Add this to ensure the link is above other elements
  
  &:hover {
    color: #fff;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;  // Add some space between the menu and BottomBar
`;

const MenuItem = styled.button`
  background-color: transparent;
  color: #f0f0f0;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
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
`;

const Terminal = () => {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([1, 0.8, 1.5, 1.9, 1.8, 2.5, 1.1, 1.5, 1.7, 2.2, 3.3, 3.5, 4.5, 4.8, 4.2, 5.3, 4.1, 4.7, 5.8, 6.3, 6.1, 4.2, 5.1, 6.1, 6.7, 7.8, 8.7, 10, 20, 15, 25, 30, 22, 18, 32, 45, 41, 50, 56, 62, 48, 45, 51, 43, 41, 38, 50, 48,47, 53, 56, 57, 75, 86, 95, 70, 56, 76]);
  const [asyncOutput, setAsyncOutput] = useState(null);
  const [asciiLogo, setAsciiLogo] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const terminalContentRef = useRef(null);

  const { isConnected, signer, provider, balance: nativeBalance, roseBalance, rose, reserve0, reserve1, alpha } = useWeb3();
  const { showPopUp } = usePopUp();

  useEffect(() => {
    fetch(asciiArt)
      .then(response => response.text())
      .then(text => setAsciiLogo(text));
  }, []);

  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [history]);

  const animateLogo = async (callback) => {
    setIsAnimating(true);
    try {
      await callback();
    } finally {
      setIsAnimating(false);
    }
  };

  const handleMenuClick = (command) => {
    if (!isConnected && command !== 'snake') {
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

    let output = '';
    switch (command) {
      case 'launch':
        setShowSale(true);
        output = 'Opening launch interface...';
        break;
      case 'trade':
        setShowTrade(true);
        output = 'Opening trade interface...';
        break;
      case 'transfer':
        setShowTransfer(true);
        output = 'Opening transfer interface...';
        break;
      case 'snake':
        setShowSnakeGame(true);
        output = 'Starting Snake game...';
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
    if (rose) {
      navigator.clipboard.writeText(rose).then(
        () => {
          showPopUp('Rose address copied to clipboard!');
        },
        (err) => {
          console.error('Failed to copy Rose address: ', err);
          showPopUp('Failed to copy Rose address');
        }
      );
    } else {
      showPopUp('Rose address not available');
    }
  };

  return (
    <>
      <GlobalStyle />
      <TerminalContainer onClick={handleContainerClick}>
        <GitHubLink 
          href="https://github.com/RedRoseMoney/Rose" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <FaGithub />
        </GitHubLink>
        {showIntro && (
          <Intro asciiLogo={asciiLogo} onIntroComplete={handleIntroComplete} />
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
        <OutputDiv>
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
        </OutputDiv>
        <TerminalContent ref={terminalContentRef}>
          {/* Remove the history mapping from here */}
        </TerminalContent>
        <Chart data={chartData} />
        <MenuContainer>
          {['launch', 'trade', 'transfer', 'snake'].map(command => (
            <MenuItem key={command} onClick={() => handleMenuClick(command)}>
              {command}
            </MenuItem>
          ))}
        </MenuContainer>
        <BottomBar />
        {showTrade && (
          <Trade 
            onClose={() => setShowTrade(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {showTransfer && (
          <Transfer 
            onClose={() => setShowTransfer(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {showSale && (
          <Sale 
            onClose={() => setShowSale(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {showSnakeGame && <SnakeGame onClose={() => setShowSnakeGame(false)} />}
      </TerminalContainer>
    </>
  );
};

export default Terminal;
