import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEthereum, FaInfoCircle } from 'react-icons/fa';

// Import all angel GIFs
import angel0 from '../assets/angel0.GIF';
import angel1 from '../assets/angel1.GIF';
import angel2 from '../assets/angel2.GIF';
import angel3 from '../assets/angel3.GIF';
import angel4 from '../assets/angel4.GIF';
import angel5 from '../assets/angel5.GIF';
import angel6 from '../assets/angel6.GIF';
import angel7 from '../assets/angel7.GIF';
import angel8 from '../assets/angel8.GIF';
import angel9 from '../assets/angel9.GIF';
import angel10 from '../assets/angel10.GIF';

const PersonaContainer = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 100;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const PersonaImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
`;

const PersonaText = styled.div`
  color: #00ff00;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  text-align: center;
  max-width: 200px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  user-select: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
`;

const Personas = ({ isVisible }) => {
  const [currentPersona, setCurrentPersona] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [touchStarted, setTouchStarted] = useState(false);

  const personas = [angel0, angel1, angel2, angel3, angel4, angel5, angel6, angel7, angel8, angel9, angel10];
  const texts = [
    "Welcome to Kiru's realm!",
    "Ready to create something wonderful? Just click on create!",
    "Connect your wallet. Right here at the bottom!",
    "Got a question? Come ask on Telegram!",
    "Did you know Kiru sprinkled little magics on this coin?",
    "Kiru is watching over all of us",
    "Kiru said the coin is going to the moon. What did he do again?",
    "Time to create something amazing",
    "Kiru is silly but he's adorable",
    <>Most symbols are clickable! You can tap on tickers <FaEthereum /> and help symbols <FaInfoCircle />!</>,
    "Exchange your silly tokens for another silly token! Click on Trade!",
    "So, you're part of an amazing community? Check if you are eligible to the Clawback!",
    "You're in for an incredible adventure!",
    "You look so cool ahahaha. Come play with us!",
    "Kiru casts spells left and right! Someone has to stop him!"
  ];

  const selectRandomPersonaAndText = () => {
    // Get random index excluding current persona
    const currentPersonaIndex = personas.indexOf(currentPersona);
    let newPersonaIndex;
    do {
      newPersonaIndex = Math.floor(Math.random() * personas.length);
    } while (newPersonaIndex === currentPersonaIndex);

    // Get random index excluding current text
    const currentTextIndex = texts.indexOf(currentText);
    let newTextIndex;
    do {
      newTextIndex = Math.floor(Math.random() * texts.length);
    } while (newTextIndex === currentTextIndex);
    
    setCurrentPersona(personas[newPersonaIndex]);
    setCurrentText(texts[newTextIndex]);
  };

  useEffect(() => {
    if (isVisible) {
      selectRandomPersonaAndText();
    }
  }, [isVisible]);

  const handleClick = (e) => {
    // Only handle click if it wasn't initiated by a touch
    if (!touchStarted) {
      selectRandomPersonaAndText();
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouchStarted(true);
    selectRandomPersonaAndText();
  };

  const handleTouchEnd = () => {
    // Reset touch state after a short delay
    setTimeout(() => {
      setTouchStarted(false);
    }, 100);
  };

  if (!isVisible || !currentPersona) return null;

  return (
    <PersonaContainer 
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
    >
      <PersonaImage src={currentPersona} alt="Kiru Persona" />
      <PersonaText>{currentText}</PersonaText>
    </PersonaContainer>
  );
};

export default Personas;
