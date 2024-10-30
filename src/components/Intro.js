import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const IntroContainer = styled.div`
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
  cursor: pointer;
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
  color: rgba(255, 255, 255, 1);
  font-size: 8px;
  line-height: 1;
  white-space: pre;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.scale});
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const TextContainer = styled.div`
  width: 100%;
  padding: 20px 100px;
  color: rgba(0, 255, 0, 1);
  font-family: monospace;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-in-out;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 20px 40px;
  }

  @media (max-width: 600px) {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    padding: 10px;
    font-size: 12px;
  }
`;

const glitterAnimation = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

const GlitterContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1001;
`;

const Glitter = styled.div`
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: #ffffff;
  border-radius: 50%;
  opacity: 0;
  animation: ${glitterAnimation} ${props => props.duration}s infinite;
  animation-delay: ${props => props.delay}s;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  box-shadow: 0 0 3px #ffffff;
`;

const Intro = ({ asciiLogo, onIntroComplete }) => {
  const [scale, setScale] = useState(1);
  const preRef = useRef(null);
  const [glitterCount, setGlitterCount] = useState(50);
  const maxGlitters = 50;

  const glitters = useMemo(() => {
    return Array.from({ length: maxGlitters }, (_, i) => ({
      key: i,
      delay: Math.random() * 1,
      duration: 0.3 + Math.random() * 1,
      top: 20 + Math.random() * 60,
      left: 20 + Math.random() * 60,
    }));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (preRef.current) {
        const containerWidth = window.innerWidth;
        const contentWidth = preRef.current.offsetWidth;
        const newScale = containerWidth / contentWidth;
        setScale(newScale * 0.98);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [asciiLogo]);

  return (
    <IntroContainer onClick={onIntroComplete}>
      <AsciiContainer>
        <AsciiPre ref={preRef} scale={scale}>
          {asciiLogo}
        </AsciiPre>
      </AsciiContainer>
      <GlitterContainer>
        {glitters.slice(0, glitterCount).map(glitter => (
          <Glitter
            key={glitter.key}
            delay={glitter.delay}
            duration={glitter.duration}
            top={glitter.top}
            left={glitter.left}
          />
        ))}
      </GlitterContainer>
      <TextContainer>
        <p>I've put a little bit of magic into this coin.</p>
      </TextContainer>
    </IntroContainer>
  );
};

export default Intro;
