import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import { usePopUp } from '../contexts/PopUpContext';
import { ethers } from 'ethers';
import { generateProof, verifyProof } from './MerkleInclusion';
import mogAscii from '../assets/mog-ascii.txt';
import sprotoAscii from '../assets/sproto-ascii.txt';
import miladyAscii from '../assets/milady-ascii.txt';
import hposAscii from '../assets/hpos-ascii.txt';
import aeonAscii from '../assets/aeon-ascii.txt';
import spxAscii from '../assets/spx-ascii.txt';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ClawbackContainer = styled.div`
  position: absolute;
  top: ${props => props.isDashboardVisible ? '50%' : '55%'};
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: 20px;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  width: ${props => props.width}px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: top 0.3s ease-out;

  @media (max-width: 600px) {
    width: 90vw;
    padding: 20px;
  }
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const ClawbackRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #00ff00;
  font-size: 24px;
  cursor: pointer;
  margin-right: 10px;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const Panel = styled.div`
  background-color: rgba(0, 255, 0, 0.1);
  border-radius: 15px;
  padding: 15px;
  height: 60px;
  display: flex;
  align-items: center;
  flex-grow: 1;
`;

const InputWrapper = styled.div`
  flex-grow: 1;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: none;
  background-color: transparent;
  color: #00ff00;
  font-size: 15px;
  outline: none;
  text-align: left;
  font-family: inherit;

  &::placeholder {
    font-size: 15px;
    color: rgba(0, 255, 0, 0.5);
  }
`;

const QuoteText = styled.p`
  color: #00ff00;
  font-size: 15px;
  text-align: left;
  margin: 0;
`;

const ExecuteButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #000000;
  color: ${props => props.disabled ? '#333333' : '#00ff00'};
  border: none;
  border-radius: 10px;
  font-size: 16px;
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

const DashboardContainer = styled.div`
  margin-top: 20px;
`;

const DashboardTitle = styled.div`
  color: ${props => props.isOpen ? 'rgba(0, 255, 0, 0.8)' : 'grey'};
  font-size: 0.9em;
  margin-bottom: 4px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    color: ${props => props.isOpen ? 'rgba(0, 255, 0, 1)' : 'lightgrey'};
  }
`;

const ArrowIcon = styled.span`
  display: inline-block;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(-90deg)' : 'rotate(90deg)'};
`;

const DashboardContent = styled.div`
  max-height: ${props => props.isVisible ? '1000px' : '0'};
  opacity: ${props => props.isVisible ? 1 : 0};
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
`;

const Dashboard = styled.div`
  background-color: rgba(0, 255, 0, 0.1);
  border-radius: 15px;
  padding: 15px;
  margin-top: 15px;
  color: #00ff00;
  font-size: 14px;
`;

const AsciiArt = styled.pre`
  color: #00ff00;
  font-size: 2px;
  line-height: 2px;
  margin-bottom: 10px;
  white-space: pre;
  overflow: hidden;
  ${props => props.isBold && css`
    font-weight: bold;
    color: #00ff99;
  `}
`;

const AsciiContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const AsciiWrapper = styled.div`
  flex: 0 0 30%;
  margin-bottom: 10px;
`;

const Clawback = ({ animateLogo, setAsyncOutput }) => {
  const [address, setAddress] = useState('');
  const [allocation, setAllocation] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const { showPopUp } = usePopUp();
  const { signer, rose } = useWeb3();
  const [panelWidth, setPanelWidth] = useState(450);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [mogAsciiArt, setMogAsciiArt] = useState('');
  const [sprotoAsciiArt, setSprotoAsciiArt] = useState('');
  const [miladyAsciiArt, setMiladyAsciiArt] = useState('');
  const [hposAsciiArt, setHposAsciiArt] = useState('');
  const [aeonAsciiArt, setAeonAsciiArt] = useState('');
  const [spxAsciiArt, setSpxAsciiArt] = useState('');

  const projectAddresses = {
      mog: ['', '0xdBD4D75960ae8A08b53E0B4f679c4Af487256B31'],
    sproto: ['0x023DbE08bEC000dDc4b743aC0d5cc65b1C4A086D', ''],
    milady: ['', '0xdBD4D75960ae8A08b53E0B4f679c4Af487256B31'],
    hpos: ['', '0xdBD4D75960ae8A08b53E0B4f679c4Af487256B31'],
    aeon: ['0x023DbE08bEC000dDc4b743aC0d5cc65b1C4A086D', ''],
    spx: ['0x023DbE08bEC000dDc4b743aC0d5cc65b1C4A086D', '']
  };

  const updatePanelWidth = useCallback(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      setPanelWidth(screenWidth * 0.9);
    } else {
      setPanelWidth(450);
    }
  }, []);

  useEffect(() => {
    updatePanelWidth();
    window.addEventListener('resize', updatePanelWidth);
    return () => window.removeEventListener('resize', updatePanelWidth);
  }, [updatePanelWidth]);

  useEffect(() => {
    const fetchAsciiArt = async (file, setter) => {
      try {
        const response = await fetch(file);
        const text = await response.text();
        setter(text);
      } catch (error) {
        console.error(`Error loading ASCII art for ${file}:`, error);
      }
    };

    fetchAsciiArt(mogAscii, setMogAsciiArt);
    fetchAsciiArt(sprotoAscii, setSprotoAsciiArt);
    fetchAsciiArt(miladyAscii, setMiladyAsciiArt);
    fetchAsciiArt(hposAscii, setHposAsciiArt);
    fetchAsciiArt(aeonAscii, setAeonAsciiArt);
    fetchAsciiArt(spxAscii, setSpxAsciiArt);
  }, []);

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    if (ethers.isAddress(newAddress)) {
      // Check which projects the address belongs to
      const active = Object.entries(projectAddresses).reduce((acc, [project, addresses]) => {
        if (addresses.some(addr => addr.toLowerCase() === newAddress.toLowerCase())) {
          acc.push(project);
        }
        return acc;
      }, []);
      setActiveProjects(active);
      if (active.length > 0) {
        setAllocation(true);
      } else {
        setAllocation(false);
      }
    } else {
      setActiveProjects([]);
      setAllocation(null);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleExecute();
    }
  };

  const handleExecute = async () => {
    if (!signer) {
      showPopUp('Please connect your wallet first.');
      return;
    }

    if (!ethers.isAddress(address)) {
      showPopUp('Invalid Ethereum address.');
      return;
    }

    animateLogo(async () => {
      try {
        setAsyncOutput(<>Processing clawback for {address} ...</>);

        // Generate and verify Merkle proof
        const proof = await generateProof(address);
        const isValid = await verifyProof(proof, address, allocation);

        if (!isValid) {
          throw new Error('Invalid Merkle proof');
        }

        // Here you would typically call the clawback function on the contract
        // For now, we'll just simulate a transaction
        await new Promise(resolve => setTimeout(resolve, 2000));

        setAsyncOutput(<>Clawback successful for {address}</>);
        showPopUp(<>Successfully claimed {allocation}🌹 for {address}</>);
      } catch (error) {
        console.error('Error during clawback:', error);
        showPopUp('An error occurred during the clawback. Please try again.');
        setAsyncOutput('Error occurred during clawback. Please try again.');
      }
    });
  };

  const toggleDashboard = () => {
    setIsDashboardVisible(!isDashboardVisible);
    if (!isDashboardVisible) {
      // Set a small delay before showing content to allow for the expand animation
      setTimeout(() => setIsContentVisible(true), 50);
    } else {
      setIsContentVisible(false);
    }
  };

  return (
    <ClawbackContainer width={panelWidth} isDashboardVisible={isDashboardVisible}>
      <ContentWrapper>
        <ClawbackRow>
                  <IconButton>⟼</IconButton>
          <Panel>
            <InputWrapper>
              <Input 
                type="text" 
                value={address} 
                onChange={handleAddressChange} 
                onKeyPress={handleKeyPress} 
                placeholder="Enter Ethereum address"
              />
            </InputWrapper>
          </Panel>
        </ClawbackRow>
        <ClawbackRow>
          <Panel>
            <QuoteText>
              {allocation !== null ? allocation ? `🌹Eligible (.°v°.)🌹` : 'Sorry, not eligible ^°.°^' : ''}
            </QuoteText>
          </Panel>
        </ClawbackRow>
        <DashboardContainer>
          <DashboardTitle onClick={toggleDashboard} isOpen={isDashboardVisible}>
            Details
            <ArrowIcon isOpen={isDashboardVisible}>
              &#10095;
            </ArrowIcon>
          </DashboardTitle>
          <DashboardContent isVisible={isDashboardVisible}>
            <Dashboard>
              <AsciiContainer>
                <AsciiWrapper>
                  <AsciiArt isBold={activeProjects.includes('mog')}>{mogAsciiArt}</AsciiArt>
                </AsciiWrapper>
                <AsciiWrapper>
                  <AsciiArt isBold={activeProjects.includes('sproto')}>{sprotoAsciiArt}</AsciiArt>
                </AsciiWrapper>
                <AsciiWrapper>
                  <AsciiArt isBold={activeProjects.includes('milady')}>{miladyAsciiArt}</AsciiArt>
                </AsciiWrapper>
                <AsciiWrapper>
                  <AsciiArt isBold={activeProjects.includes('hpos')}>{hposAsciiArt}</AsciiArt>
                </AsciiWrapper>
                <AsciiWrapper>
                  <AsciiArt isBold={activeProjects.includes('aeon')}>{aeonAsciiArt}</AsciiArt>
                </AsciiWrapper>
                <AsciiWrapper>
                  <AsciiArt isBold={activeProjects.includes('spx')}>{spxAsciiArt}</AsciiArt>
                </AsciiWrapper>
              </AsciiContainer>
              <p>Clawback available for:</p>
              <p>Miladies, Sprotos, Aeons,</p>
              <p>Mog, HPOS, and SPX6900 holders</p>
            </Dashboard>
          </DashboardContent>
        </DashboardContainer>
      </ContentWrapper>
      <ExecuteButton 
        onClick={handleExecute} 
    disabled={!ethers.isAddress(address) || !allocation}
      >
        Clawback
      </ExecuteButton>
    </ClawbackContainer>
  );
};

export default Clawback;

