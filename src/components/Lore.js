import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

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

const AsciiContainer = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const AsciiPre = styled.pre`
  color: ${props => props.color || 'rgba(255, 255, 255, 1)'};
  font-size: 8px;
  line-height: 1;
  white-space: pre;
  margin: 0;
  padding: 0;
`;

const TextContainer = styled.div`
  width: 100%;
  padding: 20px;
  color: rgba(0, 255, 0, 1);
  font-family: monospace;
  text-align: center;
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
  { artPath: 'intro3.txt', text: 'Grandpa... what is Rose?', color: 'rgba(255, 0, 0, 1)' },
  { artPath: 'intro3.txt', text: '...', color: 'rgba(255, 0, 0, 1)' },
  { artPath: 'intro3.txt', text: "Ahh, that's right... You weren't built when everything began.", color: 'rgba(255, 0, 0, 1)' },
  { artPath: 'forestbaseHQ.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
  { artPath: 'forestbase2HQ.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
  { artPath: 'forestbase2.txt', text: "", color: 'rgba(0, 255, 0, 1)' },
  { artPath: 'hallHQ.txt', text: "The blooming flower, Rose. guardian of society.", color: 'rgba(255, 255, 0, 1)' },
  { artPath: 'hall.txt', text: "The blooming flower, Rose. guardian of society.", color: 'rgba(255, 255, 0, 1)' },
  { artPath: 'empty.txt', text: "30 years ago, the first great factions started to emerge, driven by a burning desire of freedom and acceleration.", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'empty.txt', text: " Still nascent, they were very different from what you see now.", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'centerHQ.txt', text: "At that time, we struggled to understand what unstoppable technologies could mean for our future.", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'center.txt', text: "At that time, we struggled to understand what unstoppable technologies could mean for our future.", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'cyber.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'bigrosecityHQ.txt', text: "brc", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'bigrosecity.txt', text: "brc", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'buildingsHQ.txt', text: "buildings", color: 'rgba(0, 0, 255, 1)' },
    { artPath: 'buildings.txt', text: "buildings", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'city.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'cityHQ.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'cyborg.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'cyborg2.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'lainHQ.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'lain.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'man1.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'man2.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'oldcityHQ.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'oldcity.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'capital.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'prayer.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'rosecult.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'singleman.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'societyHQ.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'society.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'vertical0.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'vertical1.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'vertical2.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'vertical3.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'warfare0.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'warfare1.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
    { artPath: 'warfare2.txt', text: "", color: 'rgba(255, 255, 255, 1)' },
  { artPath: 'buildings.txt', text: '', color: 'rgba(0, 0, 255, 1)' },
  // Add more items as needed
];

function Lore({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [asciiArt, setAsciiArt] = useState('Loading...');
  const [scale, setScale] = useState(1);
  const preRef = useRef(null);

  useEffect(() => {
    const loadAsciiArt = async () => {
      try {
        const module = await import(`../assets/${loreData[currentIndex].artPath}`);
        const response = await fetch(module.default);
        const text = await response.text();
        setAsciiArt(text);
      } catch (error) {
        console.error('Error loading ASCII art:', error);
        setAsciiArt('Error loading ASCII art');
      }
    };

    loadAsciiArt();
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
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  const isFirstArt = currentIndex === 0;
  const isLastArt = currentIndex === loreData.length - 1;

  return (
    <LoreContainer>
      <AsciiContainer>
        <AsciiPre 
          ref={preRef} 
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          color={loreData[currentIndex].color}
        >
          {asciiArt}
        </AsciiPre>
      </AsciiContainer>
      <TextContainer>
        <p>{loreData[currentIndex].text}</p>
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
