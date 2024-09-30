import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import { usePopUp } from '../contexts/PopUpContext';
import { ethers } from 'ethers';
import { generateProof } from './MerkleInclusion';
import mogAscii from '../assets/mog-ascii.txt';
import sprotoAscii from '../assets/sproto-ascii.txt';
import miladyAscii from '../assets/milady-ascii.txt';
import hposAscii from '../assets/hpos-ascii.txt';
import aeonAscii from '../assets/aeon-ascii.txt';
import spxAscii from '../assets/spx-ascii.txt';
import roseCultAscii from '../assets/rosecult.txt';
import { FaEthereum, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

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
  color: ${props => props.dimmed ? 'rgba(0, 255, 0, 0.5)' : '#00ff00'};
  font-size: 15px;
  text-align: center;
  margin: 0;
  width: 100%;
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
  padding-right: 5px;
  
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
  transition: opacity 0.3s ease;
  ${props => props.isBold && css`
    font-weight: bold;
    color: #00ffee;
  `}

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 600px) {
    font-size: 1.5px;
    line-height: 1.5px;
  }
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
  position: relative;
`;

const ProjectName = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #00ff00;
  padding: 5px 10px;
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const AsciiArtContainer = styled.div`
  &:hover ${ProjectName} {
    opacity: 1;
  }
`;

const HelpIcon = styled(FaInfoCircle)`
  margin-left: 5px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const HelpTooltip = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: #00ff00;
  padding: 15px;
  border-radius: 15px;
  font-size: 12px;
  max-width: 90vw;
  width: 380px;
  z-index: 1001;
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  opacity: ${props => props.visible ? 1 : 0};
  transition: visibility 0.2s, opacity 0.2s;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  line-height: 1.4;
  border: 1px solid rgba(0, 255, 0, 0.3);
`;

const DashboardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 13px;
  color: #00ff00;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateY(${props => props.isVisible ? 0 : '10px'});
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  transition-delay: ${props => props.delay}s;

  @media (max-width: 600px) {
    font-size: 11px;
  }
`;

const DashboardLabel = styled.span`
  opacity: 0.7;
`;

const DashboardValue = styled.span`
  font-weight: normal;
  display: flex;
  align-items: center;
  position: relative;
`;

const FullScreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const RoseCultAscii = styled.pre`
  color: #ff0000;
  white-space: pre;
  text-align: center;
  font-size: ${props => Math.max(window.innerWidth / 200, 2)}px;
  line-height: ${props => Math.max(window.innerWidth / 200, 2)}px;

  // @media (max-width: 600px) {
    // font-size: ${props => Math.max(window.innerWidth / 300, 1.5)}px;
    // line-height: ${props => Math.max(window.innerWidth / 300, 1.5)}px;
  // }
`;

const WelcomeMessage = styled.div`
  color: #00ff00;
  font-size: 24px;
  margin-top: 20px;
  text-align: center;
  font-family: 'fira code';
  text-shadow: 0 0 10px #00ff00;

  @media (max-width: 600px) {
    font-size: 20px;
  }
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [showRoseCult, setShowRoseCult] = useState(false);
  const [roseCultArt, setRoseCultArt] = useState('');

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

  useEffect(() => {
    const fetchRoseCultArt = async () => {
      try {
        const response = await fetch(roseCultAscii);
        const text = await response.text();
        setRoseCultArt(text);
      } catch (error) {
        console.error('Error loading Rose Cult ASCII art:', error);
      }
    };

    fetchRoseCultArt();
  }, []);

  const handleAddressChange = async (e) => {
    setAllocation(null);
    const newAddress = e.target.value;
    setAddress(newAddress);
    if (ethers.isAddress(newAddress)) {
      try {
        const response = await axios.get('/api/eligible/get-address-communities', {
          params: { address: newAddress }
        });
        
        const active = response.data.communities.map(p => p.toLowerCase());
        setActiveProjects(active);
        setAllocation(active.length > 0);
      } catch (error) {
        console.error('Error fetching active communities:', error);
        setActiveProjects([]);
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
      setAsyncOutput(<>Processing clawback registration for {address?.substring(0, 6)}...{address?.substring(address.length - 4)} ...</>);
      
      try {
        const response = await axios.post('/api/set-clawback-registration', {
          params: { 
            address: address,
          }
        });
        
        if (response.data) {
          setAsyncOutput(<>Clawback registration successful for {address?.substring(0, 6)}...{address?.substring(address.length - 4)} </>);
          showPopUp(<>Successfully registered {address?.substring(0, 6)}...{address?.substring(address.length - 4)} </>);
          setShowRoseCult(true);
        } else {
          setAsyncOutput(<>address {address.substring(0, 6)}...{address.substring(address.length - 4)} already registered</>);
          showPopUp(<>address {address.substring(0, 6)}...{address.substring(address.length - 4)} already registered (°.°)</>);
        }
      } catch (error) {
        console.error('Error during clawback registration:', error);
        showPopUp('An error occurred during clawback registration :( Please try again.');
        setAsyncOutput('Error occurred during clawback registration. Please try again.');
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

  const handleArrowClick = () => {
    if (signer) {
      signer.getAddress().then(signerAddress => {
        setAddress(signerAddress);
        handleAddressChange({ target: { value: signerAddress } });
      }).catch(error => {
        console.error('Error getting signer address:', error);
        showPopUp('Error fetching connected wallet address. Please try again.');
      });
    } else {
      showPopUp('Please connect your wallet first.');
    }
  };

  const handleHelpIconClick = (event) => {
    event.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  const handleTooltipClick = () => {
    setShowTooltip(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <>
      <ClawbackContainer width={panelWidth} isDashboardVisible={isDashboardVisible}>
        <ContentWrapper>
          <ClawbackRow>
            <IconButton onClick={handleArrowClick}>⟼</IconButton>
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
              <QuoteText
                dimmed={allocation === null}
              >
                {allocation !== null
                  ? allocation
                    ? `🌹 Eligible 🌹 (.°v°.)`
                    : 'Sorry, not eligible ^.^'
                  : '↑↑↑ Check eligibility ↑↑↑'}
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
                  {[
                    { name: 'Mog', art: mogAsciiArt },
                    { name: 'Sproto', art: sprotoAsciiArt },
                    { name: 'Milady', art: miladyAsciiArt },
                    { name: 'HPOS', art: hposAsciiArt },
                    { name: 'Aeon', art: aeonAsciiArt },
                    { name: 'SPX', art: spxAsciiArt }
                  ].map(project => (
                    <AsciiWrapper key={project.name.toLowerCase()}>
                      <AsciiArtContainer>
                        <AsciiArt
                          isBold={activeProjects.includes(project.name.toLowerCase())}
                        >
                          {project.art}
                        </AsciiArt>
                        <ProjectName>{project.name}</ProjectName>
                      </AsciiArtContainer>
                    </AsciiWrapper>
                  ))}
                </AsciiContainer>
                <DashboardRow isVisible={isContentVisible} delay={0.1}>
                  <DashboardLabel>Method:</DashboardLabel>
                  <DashboardValue>
                    Single eligibility Clawback
                    <HelpIcon onClick={handleHelpIconClick} />
                  </DashboardValue>
                </DashboardRow>
                <DashboardRow isVisible={isContentVisible} delay={0.2}>
                  <DashboardLabel>Eligible ERC-721:</DashboardLabel>
                  <DashboardValue>Milady, Sproto, Aeon</DashboardValue>
                </DashboardRow>
                <DashboardRow isVisible={isContentVisible} delay={0.3}>
                  <DashboardLabel>Eligible ERC-20:</DashboardLabel>
                  <DashboardValue>MOG, HPOS10I, SPX6900</DashboardValue>
                </DashboardRow>
              </Dashboard>
            </DashboardContent>
          </DashboardContainer>
        </ContentWrapper>
        <ExecuteButton
          onClick={handleExecute}
          disabled={!ethers.isAddress(address) || !allocation}
        >
          Register
        </ExecuteButton>
        <HelpTooltip 
          visible={showTooltip} 
          onClick={handleTooltipClick}
        >
          <strong>Single Eligibility Clawback</strong><br /><br />
          The Clawback mechanism allows selected <em>high-status technocratic post-scarcity cult adepts</em> to get an entry into the <em>Rose economical zone</em> (🌹), and embark on the journey to hyperfinancialization.<br /><br />
          Eligibility is granted based on appartenance to the following digital religions:<br /><br />
          - Milady Maker<br />
          - Sprotos Gremlins<br />
          - Project AEON<br />
          - Mog<br />
          - HPOS10I<br />
          - SPX6900<br /><br />
          <em>Note: Snapshot taken on september 27th. For ERC20s, an address needs at least 0.2<FaEthereum /> worth of holdings to be eligible. The claimable amount is fixed for all eligible addresses and does not increase with the number of communities the claimee is apart of. A 5% supply allocation is reserved for the Clawback mechanism.</em>
        </HelpTooltip>
      </ClawbackContainer>
      {showRoseCult && (
        <FullScreenOverlay onClick={() => setShowRoseCult(false)}>
          <RoseCultAscii>{roseCultArt}</RoseCultAscii>
          <WelcomeMessage>Welcome to Rose Community</WelcomeMessage>
        </FullScreenOverlay>
      )}
    </>
  );
};

export default Clawback;
