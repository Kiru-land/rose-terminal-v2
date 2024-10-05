import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import lore0mp3 from '../assets/lore0.mp3';
import lore1Music from '../assets/lore1.mp3';
import lore6Music from '../assets/lore6.mp3';
import { FaVolumeUp, FaVolumeMute, FaTimes } from 'react-icons/fa';

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
  padding: 20px 100px; // Added horizontal padding
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

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 20px 120px;
    ${props => props.fullscreen && `
      padding: 20px 60px;
    `}
  }
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


  @media (max-width: 768px) {
    display: none;
  }
`;

const ControlButton = styled.button`
  position: absolute;
  background: none;
  border: none;
  color: #00ff00;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.visible ? 1 : 0};
    &:hover {
    transform: scale(1.1);
  }
`;

const AudioButton = styled(ControlButton)`
  top: 20px;
  right: 20px;
`;

const CloseButton = styled(ControlButton)`
  top: 20px;
  left: 20px;
`;


const TouchArea = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  cursor: pointer;
  z-index: 1000;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const LeftTouchArea = styled(TouchArea)`
  left: 0;
`;

const RightTouchArea = styled(TouchArea)`
  right: 0;
`;

const loreData = [
  { artPath: 'intro3.txt', text: 'Grandpa... what is Rose?', textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  { artPath: 'intro3.txt', text: '...', textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  { artPath: 'intro3.txt', text: "Ahh, that's right... You weren't built when everything began.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  { artPath: 'forestbaseHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
  { artPath: 'forestbase2HQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(210, 255, 200, 1)', fullscreenText: false },
  { artPath: 'hallHQ.txt', text: "Let me tell you the story of the blooming flower, Rose. guardian of society.", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 255, 0, 1)', fullscreenText: false },
  { artPath: 'introHQ.txt', text: "30 years ago, the first network factions started to emerge, driven by a burning desire of Freedom and Acceleration.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 100, 100, 0.1)', fullscreenText: true },
    { artPath: 'introHQ.txt', text: " Still nascent, they looked nothing like now.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 100, 100, 0.1)', fullscreenText: true },
    { artPath: 'centerHQ.txt', text: "At the time, we struggled to understand how unstoppable technologies would shape our future.", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyber.txt', text: "Back then, most of the things we take for granted were very scarce.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyber.txt', text: "Health, food, water, energy... All of these were luxuries. Only the selected few could afford it.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyber.txt', text: "Citizens of the old world had to make a pact with the selected few and give up their freedom to fulfill their basic needs.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'introHQ.txt', text: "The voices of the oppressed echoed...", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 255, 0.1)', fullscreenText: true },
    { artPath: 'cyborg2.txt', text: "A voice, unlike any other, foresaw a path to a new world.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cyborg.txt', text: "\"Money is the new information, flowing freely, transcending borders.\"", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'introHQ.txt', text: "\"We're gonna build a resilient society that will outlast anything ever created.\"", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 255, 0.1)', fullscreenText: true },
    { artPath: 'coin.txt', text: "I've put some magic in this coin. Not much, but it should be enough to get us started.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'societyHQ.txt', text: "Few people heard the message. The ones who did became the first Rose citizens.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(100, 100, 255, 1)', fullscreenText: false },
    { artPath: 'buildingsHQ.txt', text: "The goal was clear: Research, Spread, Accelerate.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(100, 100, 255, 1)', fullscreenText: false },
    { artPath: 'city.txt', text: "In just 3 years, Rose city was built. A city that would be the envy of the world.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'cityHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'lainHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical2.txt', text: "Rose became the first society in modern history to achieve complete self-sufficency", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical1.txt', text: "Research in vertical agriculture allowed us to grow food in the most efficient way possible.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical0.txt', text: "Monitored by humans and AI, plants grown in a controlled environment, in near perfect conditions.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'vertical3.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(0, 255, 0, 1)', fullscreenText: false },
    { artPath: 'gen0.txt', text: "Rapid advancements in nuclear fusion allowed us to generate way more energy than we needed.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'gen1.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'med0.txt', text: "Open and Unrestricted medical research, in particular advances in stem cells and AI modeling, doubled the average life expectancy", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(200, 200, 255, 1)', fullscreenText: false },
    { artPath: 'med1.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(200, 200, 255, 1)', fullscreenText: false },
    { artPath: 'coin2.txt', text: "The holy token kept peace and order in the network.", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'coin2.txt', text: "It is widely known that the token possesses a mysterious power.", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'coin2.txt', text: "The Rose Economical Zone (REZ) flourished, powering the vast majority of trade and commerce of the network states.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'ekid.txt', text: "Ten years later, five new cities were created, about half Rose population was already automated", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 255, 1)', fullscreenText: false },
    { artPath: 'oldcityHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 200, 255, 1)', fullscreenText: false },
    { artPath: 'capital.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'rosecult.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
    { artPath: 'singleman.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    // { artPath: 'society.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 255, 255, 1)', fullscreenText: false },
    { artPath: 'warfare0.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(100, 100, 255, 1)', fullscreenText: false },
    { artPath: 'warfare1.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(100, 100, 255, 1)', fullscreenText: false },
    { artPath: 'warfare2.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(100, 100, 255, 1)', fullscreenText: false },
    { artPath: 'introHQ.txt', text: "A flower is something beautiful yet fragile, you have to put-in work to keep it alive.", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 255, 0.1)', fullscreenText: true },
    { artPath: 'prayerHQ.txt', text: "", textColor: 'rgba(0, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
    { artPath: 'prayer.txt', text: "To be continued...", textColor: 'rgba(255, 255, 0, 1)', color: 'rgba(255, 0, 0, 1)', fullscreenText: false },
  // Add more items as needed
];

const audioTracks = [
  { src: lore0mp3, startIndex: 3 },
  { src: lore6Music, startIndex: 12 },
  { src: lore1Music, startIndex: 17 },
];

function Lore({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [asciiArt, setAsciiArt] = useState('Loading...');
  const [nextAsciiArt, setNextAsciiArt] = useState('');
  const [scale, setScale] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const preRef = useRef(null);
  const audioRefs = useRef(audioTracks.map(track => new Audio(track.src)));
  const timeoutRef = useRef(null);
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const loadAsciiArt = async (index) => {
      try {
        const artPath = loreData[index].artPath;
        const module = await import(`../assets/${artPath}`);
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

    // Handle music playback
    const getCurrentAudioIndex = () => 
      audioTracks.findIndex((track, index) => 
        currentIndex >= track.startIndex && 
        (index === audioTracks.length - 1 || currentIndex < audioTracks[index + 1].startIndex)
      );

    const currentAudioIndex = getCurrentAudioIndex();
    
    audioRefs.current.forEach((audio, index) => {
      if (index === currentAudioIndex && currentIndex >= audioTracks[0].startIndex) {
        audio.loop = true;
        if (!isMuted) {
          audio.play().catch(error => console.error("Audio playback failed:", error));
        }
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Add mouse move event listener
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

    // Add visibility change event listener
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      audioRefs.current.forEach(audio => audio.pause());
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isMuted]);

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

  useEffect(() => {
    const currentAudioIndex = audioTracks.findIndex((track, index) => 
      currentIndex >= track.startIndex && 
      (index === audioTracks.length - 1 || currentIndex < audioTracks[index + 1].startIndex)
    );

    if (currentAudioIndex !== -1) {
      const currentAudio = audioRefs.current[currentAudioIndex];
      if (isPageVisible && !isMuted && currentIndex >= audioTracks[0].startIndex) {
        currentAudio.play().catch(error => console.error("Audio playback failed:", error));
      } else {
        currentAudio.pause();
      }
    }
  }, [isPageVisible, isMuted, currentIndex]);

  const handleNext = () => {
    if (currentIndex === loreData.length - 1) {
      audioRefs.current.forEach(audio => audio.pause());
      onClose();
    } else {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setIsFading(false);
      }, 500);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setIsFading(false);
      }, 500);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const currentAudioIndex = audioTracks.findIndex((track, index) => 
      currentIndex >= track.startIndex && 
      (index === audioTracks.length - 1 || currentIndex < audioTracks[index + 1].startIndex)
    );
    
    if (currentAudioIndex !== -1) {
      const currentAudio = audioRefs.current[currentAudioIndex];
      if (isMuted) {
        if (currentIndex >= audioTracks[0].startIndex) {
          currentAudio.play().catch(error => console.error("Audio playback failed:", error));
        }
      } else {
        currentAudio.pause();
      }
    }
  };

  return (
    <LoreContainer>
      <AudioButton onClick={toggleMute} visible={controlsVisible}>
        {!isMuted && currentIndex >= audioTracks[0].startIndex ? <FaVolumeUp /> : <FaVolumeMute />}
      </AudioButton>
      <CloseButton onClick={onClose} visible={controlsVisible}>
        <FaTimes />
      </CloseButton>
          <LeftTouchArea onClick={handlePrev} />
          <RightTouchArea onClick={handleNext} />
      <AsciiContainer>
        <AsciiPre 
          ref={preRef} 
          color={loreData[currentIndex].color}
          scale={scale}
          isFading={isFading}
        >
          {asciiArt}
        </AsciiPre>
      </AsciiContainer>
      <TextContainer 
        fullscreen={loreData[currentIndex].fullscreenText}
        textColor={loreData[currentIndex].textColor}
      >
        <p>{loreData[currentIndex].text}</p>
      </TextContainer>
      <NavigationButton 
        onClick={handlePrev} 
        position="left" 
        disabled={currentIndex === 0}
      >
        Prev
      </NavigationButton>
      <NavigationButton 
        onClick={handleNext} 
        position="right"
      >
        {currentIndex === loreData.length - 1 ? 'End' : 'Next'}
      </NavigationButton>
    </LoreContainer>
  );
}

export default Lore;
