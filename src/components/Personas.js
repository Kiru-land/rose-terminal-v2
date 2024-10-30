import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Import all angel GIFs
import angel0 from '../assets/angel0.GIF';
import angel1 from '../assets/angel1.GIF';
import angel2 from '../assets/angel2.GIF';
import angel3 from '../assets/angel3.GIF';
import angel4 from '../assets/angel4.GIF';
import angel5 from '../assets/angel5.GIF';
import angel6 from '../assets/angel6.GIF';
import angel7 from '../assets/angel7.GIF';

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
`;

const Personas = ({ isVisible }) => {
  const [currentPersona, setCurrentPersona] = useState(null);
  const [currentText, setCurrentText] = useState('');

  const personas = [angel0, angel1, angel2, angel3, angel4, angel5, angel6, angel7];
  const texts = [
    "Welcome to Kiru's realm!",
    "Ready to create something wonderful? Just click on create!",
    "Got a question? Come ask on Telegram!",
    "Did you know Kiru puts magic inside this coin?",
    "Kiru is watching all of us",
    "Time to create something amazing",
    "Oh, you're part of an amazing community? Check if you are eligible for the Clawback!",
    "You're in for an incredible adventure!",
    "You look so cool ahahaha. Come with us!",
    "Kiru casts spells left and right! Someone has to stop him!"
  ];

  const selectRandomPersonaAndText = () => {
    // Ensure we don't get the same persona and text combination
    let newPersona, newText;
    do {
      newPersona = personas[Math.floor(Math.random() * personas.length)];
      newText = texts[Math.floor(Math.random() * texts.length)];
    } while (newPersona === currentPersona && newText === currentText);
    
    setCurrentPersona(newPersona);
    setCurrentText(newText);
  };

  useEffect(() => {
    if (isVisible) {
      selectRandomPersonaAndText();
    }
  }, [isVisible]);

  const handleClick = () => {
    selectRandomPersonaAndText();
  };

  if (!isVisible || !currentPersona) return null;

  return (
    <PersonaContainer onClick={handleClick}>
      <PersonaImage src={currentPersona} alt="Kiru Persona" />
      <PersonaText>{currentText}</PersonaText>
    </PersonaContainer>
  );
};

export default Personas;
