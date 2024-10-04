import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const LoreContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const AsciiContainer = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const AsciiPre = styled.pre`
  color: ${props => props.color || 'rgba(255, 255, 255, 1)'};
  font-size: 8px;
  line-height: 1;
  white-space: pre;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.scale});
  animation: ${props => props.isFading ? fadeOut : fadeIn} 0.5s ease-in-out;
`;

const TextContainer = styled.div`
  width: 100%;
  padding: 20px;
  color: ${props => props.textColor || 'rgba(0, 255, 0, 1)'};
  font-family: monospace;
  text-align: center;
  ${props => props.fullscreen && `
    position: absolute;
    padding: 50px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    text-shadow: 0 0 10px ${props => props.textColor || 'rgba(0, 255, 0, 0.7)'};
  `}
`;

const NavigationButton = styled.button`
  position: absolute;
  bottom: 20px;
  ${props => props.position}: 20px;
  background-color: #000000;
  color: ${props => props.disabled ? '#333333' : '#00ff00'};
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'null'};
  transition: all 0.3s ease;
  text-transform: capitalize;
  letter-spacing: 0px;
  font-weight: 500;
  overflow: hidden;
  padding: 14px 20px;
  font-family: inherit;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: #00ff00;
    z-index: -1;
    filter: blur(10px);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: ${props => props.disabled ? 0 : 0.7};
  }

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 0 20px rgba(0, 255, 0, 0.5)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
  }
`;

const loreData = [
  { artPath: 'intro3.txt', text: 'Grandpa... what is Rose?', textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  { artPath: 'intro3.txt', text: '...', textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  { artPath: 'intro3.txt', text: "Ahh, that's right... You weren't built when everything began.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  { artPath: 'forestbaseHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
  { artPath: 'forestbase2HQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(210, 255, 200, 1)', fullscreenText: false },
//   { artPath: 'forestbase2.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(0, 255, 0, 1)', fullscreenText: false },
  { artPath: 'hallHQ.txt', text: "Let me tell you the story of the blooming flower, Rose. guardian of society.", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 255, 0, 1)', fullscreenText: false },
//   { artPath: 'hall.txt', text: "The blooming flower, Rose. guardian of society.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 0, 1)', fullscreenText: false },
  { artPath: 'introHQ.txt', text: "It all started 30 years ago, when the first great factions started to emerge, driven by a burning desire of Freedom and Acceleration.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 100, 100, 0.1)', fullscreenText: true },
    { artPath: 'introHQ.txt', text: " Still nascent, they were very different from what they are now.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 100, 100, 0.1)', fullscreenText: true },
    { artPath: 'centerHQ.txt', text: "At that time, we struggled to understand what unstoppable technologies could mean for our future.", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    // { artPath: 'center.txt', text: "At that time, we struggled to understand what unstoppable technologies could mean for our future.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyber.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'bigrosecityHQ.txt', text: "brc", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'bigrosecity.txt', text: "brc", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'buildingsHQ.txt', text: "buildings", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(0, 0, 255, 1)', fullscreenText: false },
    { artPath: 'buildings.txt', text: "buildings", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'city.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cityHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyborg.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyborg2.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'lainHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'lain.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'man1.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'man2.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'oldcityHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'oldcity.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'capital.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'prayer.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'rosecult.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'singleman.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'societyHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'society.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical0.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical1.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical2.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical3.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'warfare0.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'warfare1.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'warfare2.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
  { artPath: 'buildings.txt', text: '', textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(0, 0, 255, 1)', fullscreenText: false },
  // Add more items as needed
];

function Lore({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [asciiArt, setAsciiArt] = useState('Loading...');
  const [nextAsciiArt, setNextAsciiArt] = useState('');
  const [scale, setScale] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const preRef = useRef(null);

  useEffect(() => {
    const loadAsciiArt = async (index) => {
      try {
        const module = await import(`../assets/${loreData[index].artPath}`);
        const response = await fetch(module.default);
        const text = await response.text();
        return text;
      } catch (error) {
        console.error('Error loading ASCII art:', error);
        return 'Error loading ASCII art';
      }
    };

    loadAsciiArt(currentIndex).then(setAsciiArt);
    if (currentIndex < loreData.length - 1) {
      loadAsciiArt(currentIndex + 1).then(setNextAsciiArt);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (preRef.current) {
        const containerWidth = window.innerWidth;
        const contentWidth = preRef.current.offsetWidth;
        const newScale = containerWidth / contentWidth;
        setScale(newScale * 0.98); // Slightly reduce scale to ensure no overflow
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial scale

    return () => window.removeEventListener('resize', handleResize);
  }, [asciiArt]);

  const handleNext = () => {
    if (currentIndex === loreData.length - 1) {
      onClose();
    } else {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setIsFading(false);
      }, 500); // This should match the animation duration
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setIsFading(false);
      }, 500); // This should match the animation duration
    }
  };

  const isFirstArt = currentIndex === 0;
  const isLastArt = currentIndex === loreData.length - 1;
  const currentLore = loreData[currentIndex];

  return (
    <LoreContainer>
      <AsciiContainer>
        <AsciiPre 
          ref={preRef} 
          color={currentLore.color}
          scale={scale}
          isFading={isFading}
        >
          {asciiArt}
        </AsciiPre>
        {!isLastArt && (
          <AsciiPre 
            color={loreData[currentIndex + 1].color}
            scale={scale}
            style={{ opacity: 0 }}
          >
            {nextAsciiArt}
          </AsciiPre>
        )}
      </AsciiContainer>
      <TextContainer 
        fullscreen={currentLore.fullscreenText}
        textColor={currentLore.textColor}
      >
        <p>{currentLore.text}</p>
      </TextContainer>
      <NavigationButton 
        onClick={handlePrev} 
        position="left" 
        disabled={isFirstArt}
      >
        Prev
      </NavigationButton>
      <NavigationButton 
        onClick={handleNext} 
        position="right"
      >
        {isLastArt ? 'End' : 'Next'}
      </NavigationButton>
    </LoreContainer>
  );
}

export default Lore;
