import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaDownload, FaInfoCircle } from 'react-icons/fa';
import Draggable from 'react-draggable';
import kiru from '../assets/kiru.JPG';
import kirubluescreen from '../assets/kirubluescreen.JPG';
import kirublur from '../assets/kirublur.PNG';
import kirublur3 from '../assets/kirublur3.jpeg';
import kirublur5 from '../assets/kirublur5.jpeg';
import kirububble from '../assets/kirububble.PNG';
import kirububble2 from '../assets/kirububble2.JPG';
import kirububble3 from '../assets/kirububble3.jpeg';
import kirubullet from '../assets/kirubullet.jpeg';
import kirubutterfly from '../assets/kirubutterfly.JPG';
import kirucamescope from '../assets/kirucamescope.JPG';
import kirucamescope2 from '../assets/kirucamescope2.PNG';
import kiruchinese from '../assets/kiruchinese.JPG';
import kiruclear from '../assets/kiruclear.jpeg';
import kirudemon from '../assets/kirudemon.JPG';
import kirudemon2 from '../assets/kirudemon2.JPG';
import kirudemon3 from '../assets/kirudemon3.JPG';
import kirudiddy from '../assets/kirudiddy.jpeg';
import kiruduplicate from '../assets/kiruduplicate.JPG';
import kirufade from '../assets/kirufade.jpeg';
import kirufight from '../assets/kirufight.JPG';
import kirufisheye from '../assets/kirufisheye.JPG';
import kiruglass from '../assets/kiruglass.JPG';
import kiruglitch from '../assets/kiruglitch.jpeg';
import kiruglitters from '../assets/kiruglitters.jpeg';
import kiruhighlight from '../assets/kiruhighlight.JPG';
import kirulight from '../assets/kirulight.JPG';
import kirulight3 from '../assets/kirulight3.jpeg';
import kirulove from '../assets/kirulove.JPG';
import kirumodernart from '../assets/kirumodernart.jpeg';
import kirunightvision from '../assets/kirunightvision.jpeg';
import kiruold from '../assets/kiruold.JPG';
import kiruold2 from '../assets/kiruold2.JPG';
import kirutarget from '../assets/kirutarget.JPG';
import kirutv from '../assets/kirutv.jpeg';
import kirutv2 from '../assets/kirutv2.jpeg';
import kirutv3 from '../assets/kirutv3.jpeg';
import kirutv4 from '../assets/kirutv4.jpeg';
import kiruvhd from '../assets/kiruvhd.jpeg';
import kiruwhite from '../assets/kiruwhite.JPG';
import kiruwhite2 from '../assets/kiruwhite2.JPG';
import kiruwhite3 from '../assets/kiruwhite3.JPG';
import { HexColorPicker } from 'react-colorful';
import kirusaythankyou from '../assets/kirusaythankyou.mp3';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const CreateContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  width: ${props => props.width}px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    width: 90vw;
    padding: 20px;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 20px 0;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 10px;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #00ff00;
  font-size: 2em;
  cursor: pointer;
  z-index: 2;
  transition: color 0.3s ease;
  ${props => props.left ? 'left: 10px;' : 'right: 10px;'}

  &:hover {
    color: #ffffff;
  }
`;

const TextInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  background-color: rgba(0, 255, 0, 0.1);
  border-radius: 15px;
  color: #00ff00;
  font-size: 16px;
  outline: none;
  text-align: left;
  font-family: inherit;
  height: 60px;

  &::placeholder {
    font-size: 15px;
    color: rgba(0, 255, 0, 0.5);
  }
`;

const DownloadButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #000000;
  color: ${props => props.disabled ? '#333333' : '#00ff00'};
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: capitalize;
  letter-spacing: 0px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  margin-top: 20px;
  font-family: inherit;

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

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  margin: 20px 0;
`;

const ImageText = styled.div`
  position: absolute;
  color: ${props => props.color || 'white'};
  font-size: ${props => props.fontSize || 24}px;
  font-family: ${props => props.fontFamily || 'Arial'};
  font-weight: bold;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  cursor: move;
  z-index: 2;
  width: auto;
  max-width: 90%;
  word-wrap: break-word;
  user-select: none;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  touch-action: manipulation;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
`;

const StyledSelect = styled.select`
  background-color: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
  text-align: center;
  text-align-last: center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:hover {
    background-color: rgba(0, 255, 0, 0.2);
  }

  option {
    background-color: black;
    color: #00ff00;
    text-align: center;
  }
`;

const InputContainer = styled.div`
  position: relative;
  margin-top: 40px;
`;

const DraggableContainer = styled.div`
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ColorButton = styled.button`
  position: absolute;
  width: 32px;
  height: 32px;
  border: 1px solid #00ff00;
  border-radius: 5px;
  background-color: ${props => props.color};
  cursor: pointer;
  padding: 0;
  z-index: 9999;
  &:focus {
    outline: none;
  }
`;

const ColorPickerContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 32px;
  height: 32px;
`;

const PopoverPicker = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: black;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  padding: 10px;
  .react-colorful {
    width: 200px !important;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 255, 0, 0.2);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00ff00;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    background: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00ff00;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  &::-moz-range-thumb:hover {
    transform: scale(1.2);
    background: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }
`;

const SizeLabel = styled.span`
  color: #00ff00;
  font-size: 12px;
  min-width: 30px;
`;

const HelpButton = styled.button`
  background: none;
  border: none;
  color: #00ff00;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 15px;
  
  &:hover {
    color: #ffffff;
  }
`;

const HelpMenu = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: #00ff00;
  padding: 15px;
  border-radius: 15px;
  font-size: 12px;
  width: 300px;
  max-width: calc(100% - 40px);
  z-index: 1001;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  line-height: 1.4;
  border: 1px solid rgba(0, 255, 0, 0.3);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const Create = ({ onClose, animateLogo, setAsyncOutput }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [text, setText] = useState('');
  const [textElements, setTextElements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isNewText, setIsNewText] = useState(true);
  const [panelWidth, setPanelWidth] = useState(350);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const imageWrapperRef = useRef(null);
  const downloadAudioRef = useRef(new Audio(kirusaythankyou));
  const imageRef = useRef(null);
  const textRefs = useRef([]);

  const images = useMemo(() => {
    const ordered_images = [kiru, kirubluescreen, kirublur, kirublur3, kirublur5, kirububble, kirububble2, kirububble3, kirubullet, kirubutterfly, kirucamescope, kirucamescope2, kiruchinese, kiruclear, kirudemon, kirudemon2, kirudemon3, kirudiddy, kiruduplicate, kirufade, kirufight, kirufisheye, kiruglass, kiruglitch, kiruglitters, kiruhighlight, kirulight, kirulight3, kirulove, kirumodernart, kirunightvision, kiruold, kiruold2, kirutarget, kiruwhite, kiruwhite2, kiruwhite3, kirutv, kirutv2, kirutv3, kirutv4, kiruvhd];
    return ordered_images.sort(() => Math.random() - 0.5);
  }, []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setTextElements([]); // Clear text elements
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTextElements([]); // Clear text elements
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (isNewText) {
      // Add new text element at the center
      setTextElements(prev => [...prev, {
        text: e.target.value,
        position: { 
          x: 0,  // Center position
          y: 0   // Center position
        }
      }]);
      setIsNewText(false);
    } else {
      // Update the last text element
      setTextElements(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], text: e.target.value }
      ]);
    }
  };

  const handleDrag = (index, data) => {
    if (!isDragging) {
      setIsDragging(true);
    }
    setTextElements(prev => prev.map((el, i) => 
      i === index ? { ...el, position: { x: data.x, y: data.y } } : el
    ));
  };

  const handleDragStop = () => {
    if (isDragging) {
      setText(''); // Clear input after dragging
      setIsDragging(false);
      setIsNewText(true); // Ready for new text
    }
  };

  const handleDownload = () => {
    const imageSrc = images[currentImageIndex];
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageRect = imageWrapperRef.current.getBoundingClientRect();
      const scaleX = canvas.width / imageRect.width;
      const scaleY = canvas.height / imageRect.height;

      textElements.forEach((element, index) => {
        const textElement = textRefs.current[index];
        if (!textElement) return;

        const textRect = textElement.getBoundingClientRect();
        const imageRect = imageWrapperRef.current.getBoundingClientRect();

        // Calculate center position relative to the image
        const relativeX = (textRect.left + textRect.width / 2) - imageRect.left;
        const relativeY = (textRect.top + textRect.height / 2) - imageRect.top;

        // Convert to canvas coordinates
        const canvasX = relativeX * scaleX;
        const canvasY = relativeY * scaleY;

        const scaledFontSize = Math.round(fontSize * scaleX);
        ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowOffsetX = 2 * scaleX;
        ctx.shadowOffsetY = 2 * scaleY;
        ctx.shadowBlur = 4 * scaleX;

        // Draw text without wrapping
        ctx.fillText(element.text, canvasX, canvasY);
      });

      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (downloadAudioRef.current) {
        downloadAudioRef.current.play();
      }
    };

    img.onerror = (err) => {
      console.error('Image loading failed', err);
    };
  };

  const handleDelete = (indexToDelete) => {
    setTextElements(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const updatePanelWidth = useCallback(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      setPanelWidth(screenWidth * 0.9);
    } else {
      setPanelWidth(350);
    }
  }, []);

  useEffect(() => {
    updatePanelWidth();
    window.addEventListener('resize', updatePanelWidth);
    return () => window.removeEventListener('resize', updatePanelWidth);
  }, [updatePanelWidth]);

  useEffect(() => {
    const updateImageSize = () => {
      if (imageWrapperRef.current) {
        setImageSize({
          width: imageWrapperRef.current.offsetWidth,
          height: imageWrapperRef.current.offsetHeight
        });
      }
    };

    updateImageSize();
    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, []);

  const handleColorButtonClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setShowColorPicker(!showColorPicker);
  };

  useEffect(() => {
    const closeColorPicker = (e) => {
      if (!e.target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
    };
    
    if (showColorPicker) { // Only add listener when picker is shown
      document.addEventListener('click', closeColorPicker);
      return () => document.removeEventListener('click', closeColorPicker);
    }
  }, [showColorPicker]); // Add showColorPicker to dependency array

  const [lastTap, setLastTap] = useState(0);
  const DOUBLE_TAP_DELAY = 300; // milliseconds

  const handleTap = (index, event) => {
    event.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
      handleDelete(index);
    }
    setLastTap(currentTime);
  };

  return (
    <CreateContainer width={panelWidth}>
      <ControlsContainer>
        <SliderContainer>
          <SizeLabel>{fontSize}px</SizeLabel>
          <StyledSlider
            type="range"
            min="8"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </SliderContainer>
        <StyledSelect 
          value={fontFamily} 
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Impact">Impact</option>
          <option value="Times New Roman">Times New Roman</option>
        </StyledSelect>
        <ColorPickerContainer className="color-picker-container">
          <ColorButton
            color={textColor}
            onClick={handleColorButtonClick}
          />
          {showColorPicker && (
            <PopoverPicker onClick={e => e.stopPropagation()}>
              <HexColorPicker color={textColor} onChange={setTextColor} />
            </PopoverPicker>
          )}
        </ColorPickerContainer>
      </ControlsContainer>
      <ImageContainer>
        <ArrowButton left onClick={handlePrevImage}>&lt;</ArrowButton>
        <ImageWrapper ref={imageWrapperRef}>
          <Image ref={imageRef} src={images[currentImageIndex]} alt="Meme" />
          {textElements.map((element, index) => (
            <Draggable
              key={index}
              bounds="parent"
              position={element.position}
              onDrag={(e, data) => handleDrag(index, data)}
              onStop={handleDragStop}
            >
              <ImageText 
                ref={el => textRefs.current[index] = el}
                fontSize={fontSize}
                color={textColor}
                fontFamily={fontFamily}
                onDoubleClick={() => handleDelete(index)}
                onTouchStart={(e) => handleTap(index, e)}
              >
                {element.text}
              </ImageText>
            </Draggable>
          ))}
        </ImageWrapper>
        <ArrowButton onClick={handleNextImage}>&gt;</ArrowButton>
      </ImageContainer>
      <InputContainer>
        <DraggableContainer>
          {text && !isDragging && !textElements.find(el => el.text === text) && (
            <Draggable
              bounds="parent"
              onDrag={(e, data) => handleDrag(textElements.length - 1, data)}
              onStop={handleDragStop}
            >
              <ImageText 
                fontSize={fontSize}
                color={textColor}
                fontFamily={fontFamily}
              >
                {text}
              </ImageText>
            </Draggable>
          )}
        </DraggableContainer>
        <InputWrapper>
          <TextInput 
            type="text" 
            value={text} 
            onChange={handleTextChange}
            placeholder="Kiru says:" 
          />
          <HelpButton onClick={() => setShowHelp(!showHelp)}>
            <FaInfoCircle size={20} />
          </HelpButton>
        </InputWrapper>
      </InputContainer>
      <DownloadButton onClick={handleDownload}> <FaDownload /> </DownloadButton>
      {showHelp && (
        <HelpMenu onClick={() => setShowHelp(false)}>
          <ul>
            <li>🖊️ write what's on your mind</li>
            <li>✊ grab the text to move it around</li>
            <li>👇 double-tap to delete text</li>
          </ul>
        </HelpMenu>
      )}
    </CreateContainer>
  );
};

export default Create;
