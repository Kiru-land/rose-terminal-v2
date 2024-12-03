import React, { useState, useCallback, useEffect, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context.js';
import { usePopUp } from '../contexts/PopUpContext.js';
import bs58 from 'bs58'; // Import bs58 library

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PressContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: ${props => props.isMobile ? '20px 20px 40px' : '30px 20px 60px'};
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  width: ${props => props.isMobile ? '300px' : '600px'};
  max-width: 100vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ComponentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: auto;
  padding-bottom: ${props => props.isMobile ? '20px' : '30px'};
  margin-top: 0;
  width: ${props => props.isMobile ? '80%' : '70%'};
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.8; }
`;

const float = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(15px, -15px); }
  50% { transform: translate(-10px, 10px); }
  75% { transform: translate(-15px, -10px); }
`;

const rippleEffect = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const rippleWave = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
    box-shadow: 0 0 30px rgba(0, 255, 0, 0.8),
                inset 0 0 30px rgba(0, 255, 0, 0.8);
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
    box-shadow: 0 0 60px rgba(0, 255, 0, 0.3),
                inset 0 0 60px rgba(0, 255, 0, 0.3);
  }
`;

const ButtonWrapper = styled.div`
  position: relative;
  width: ${props => {
    if (props.isMobile) return '220px';
    return 'min(280px, 45vw)';
  }};
  height: ${props => {
    if (props.isMobile) return '220px';
    return 'min(280px, 45vw)';
  }};
`;

const OuterGlow = styled.div`
  position: absolute;
  top: -10%;
  left: -10%;
  right: -10%;
  bottom: -10%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 0, 0.3),
    rgba(0, 255, 0, 0.6),
    rgba(0, 255, 0, 0.3),
    transparent
  );
  pointer-events: none;
  z-index: -1;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.8;
  transition: opacity 0.3s ease;
  animation: 
    ${pulse} 3s ease-in-out infinite,
    ${float} 8s ease-in-out infinite;

  @media (hover: hover) {
    ${ButtonWrapper}:hover & {
      opacity: 0.95;
    }
  }

  ${ButtonWrapper}:active & {
    opacity: 1;
  }
`;

const SoundWave = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => {
    if (props.isMobile) return '220px';
    return 'min(280px, 45vw)';
  }};
  height: ${props => {
    if (props.isMobile) return '220px';
    return 'min(280px, 45vw)';
  }};
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 255, 0, 0.2) 0%,
    transparent 70%
  );
  animation: ${rippleWave} 1s ease-out forwards;
  pointer-events: none;
  filter: blur(8px);
`;

const RoundButton = styled.button`
  width: ${props => {
    if (props.isMobile) return '220px';
    return 'min(280px, 45vw)';
  }};
  height: ${props => {
    if (props.isMobile) return '220px';
    return 'min(280px, 45vw)';
  }};
  border-radius: 50%;
  background: linear-gradient(145deg, #000000, #111111);
  border: none;
  color: #00ff00;
  font-size: ${props => {
    if (props.isMobile) return '28px';
    return 'min(32px, 5vw)';
  }};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  box-shadow: 
    20px 20px 60px #000000,
    -20px -20px 60px #111111,
    inset 0 0 70px rgba(0, 255, 0, 0.2),
    inset 0 0 40px rgba(0, 255, 0, 0.1);
  text-transform: lowercase;
  letter-spacing: 1px;
  font-weight: 600;
  text-shadow: 
    0 0 10px rgba(0, 255, 0, 0.6),
    0 0 20px rgba(0, 255, 0, 0.4),
    0 0 30px rgba(0, 255, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: black;
    z-index: -1;
    filter: blur(15px);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 255, 0, 0.2) 0%, transparent 70%);
    opacity: 0;
  }

  &:active::after {
    opacity: 1;
  }

  &:not(:active)::after {
    animation: ${rippleEffect} 0.6s ease-out;
  }

  @media (hover: hover) {
    &:hover {
      transform: scale(1.05);
      box-shadow: 
        20px 20px 60px #000000,
        -20px -20px 60px #111111,
        inset 0 0 70px rgba(0, 255, 0, 0.3),
        inset 0 0 40px rgba(0, 255, 0, 0.2),
        0 0 40px rgba(0, 255, 0, 0.6);
      color: #00ff00;
      text-shadow: 
        0 0 15px rgba(0, 255, 0, 0.8),
        0 0 25px rgba(0, 255, 0, 0.6),
        0 0 35px rgba(0, 255, 0, 0.4);
    }
  }

  &:active {
    transform: scale(0.98);
    background: linear-gradient(145deg, #111111, #000000);
    box-shadow: 
      inset 0 0 120px rgba(0, 255, 0, 0.5),
      inset 0 0 80px rgba(0, 255, 0, 0.4),
      inset 0 0 40px rgba(0, 255, 0, 0.3);
    transition: all 0.05s ease;
    color: #00ff00;
    text-shadow: 
      0 0 20px rgba(0, 255, 0, 1),
      0 0 30px rgba(0, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 0, 0.6);

    &::before {
      opacity: 0.7;
    }

    &::after {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(0, 255, 0, 0.2),
        rgba(0, 255, 0, 0.4),
        rgba(0, 255, 0, 0.2),
        transparent
      );
    }
  }

  @media (hover: none) {
    &:active {
      transform: scale(0.98);
      background: linear-gradient(145deg, #111111, #000000);
      box-shadow: 
        inset 0 0 120px rgba(0, 255, 0, 0.5),
        inset 0 0 80px rgba(0, 255, 0, 0.4),
        inset 0 0 40px rgba(0, 255, 0, 0.3);
      transition: all 0.05s ease;
      color: #00ff00;
      text-shadow: 
        0 0 20px rgba(0, 255, 0, 1),
        0 0 30px rgba(0, 255, 0, 0.8),
        0 0 40px rgba(0, 255, 0, 0.6);

      &::before {
        opacity: 0.7;
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(0, 255, 0, 0.2),
          rgba(0, 255, 0, 0.4),
          rgba(0, 255, 0, 0.2),
          transparent
        );
      }
    }
  }
`;

const StatsSection = styled.div`
  display: flex;
  gap: ${props => props.isMobile ? '8px' : '15px'};
  padding: ${props => props.isMobile ? '8px' : '5px'};
  background-color: rgba(0, 255, 0, 0.05);
  border-radius: 15px;
  margin-top: ${props => props.isMobile ? '8px' : '5px'};
  width: ${props => props.isMobile ? '100%' : '120%'};
  
  @media (max-width: 600px) {
    flex-direction: row;
    gap: 8px;
  }
`;

const StatCard = styled.div`
  flex: 1;
  padding: ${props => props.isMobile ? '6px' : '8px'};
  text-align: center;
  transition: all 0.3s ease;
  min-height: ${props => props.isMobile ? 'auto' : '50px'};

  @media (max-width: 600px) {
    padding: 6px;
  }

  &:hover {
    background-color: rgba(0, 255, 0, 0.1);
    border-radius: 10px;
  }
`;

const StatLabel = styled.div`
  color: #00ff00;
  font-size: ${props => props.isMobile ? '10px' : '14px'};
  margin-bottom: ${props => props.isMobile ? '2px' : '6px'};
  opacity: 0.8;

  @media (max-width: 600px) {
    font-size: 10px;
    margin-bottom: 2px;
  }
`;

const StatValue = styled.div`
  color: #00ff00;
  font-size: ${props => props.isMobile ? '12px' : '16px'};
  font-weight: bold;
  
  @media (max-width: 600px) {
    font-size: 12px;
    word-break: break-all;
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  margin-top: ${props => props.isMobile ? '20px' : '30px'};
`;

const Slider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #00ff00;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #00ff00;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  &:hover {
    opacity: 1;
  }
`;

const SliderValue = styled.div`
  color: rgba(0, 255, 0, 0.7);
  font-size: ${props => props.isMobile ? '18px' : '20px'};
  margin-top: 15px;
  text-align: center;
`;

const TimeValue = styled.div`
  color: rgba(0, 255, 0, 0.7);
  font-size: ${props => props.isMobile ? '18px' : '20px'};
  margin-top: 15px;
  text-align: center;
`;

const CopyButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 20px;
  padding: 0;
  background-color: transparent;
  color: #00ff00;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: ${props => (props.isMobile ? '9px' : '11px')};
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: #00cc00;
  }
`;

const Press = ({ isMobile }) => {
  const [amount, setAmount] = useState(0.01);
  const [highScore, setHighScore] = useState(0);
  const [bucketValue, setBucketValue] = useState('0');
  const [waves, setWaves] = useState([]);
  const { signer, pressButton, ethPrice, referralCode, getReferralLink } = useWeb3();
  const { showPopUp } = usePopUp();
  const [balance, setBalance] = useState('0');
  const [pressTime, setPressTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [referralParam, setReferralParam] = useState('');

  useEffect(() => {
    // Extract referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralParam(ref);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!pressButton || !signer) return;

      try {
        const contract = new ethers.Contract(
          pressButton,
          [
            'function totalClicks() view returns (uint256)',
            'function bucket() view returns (uint256)',
            'function pressTime() view returns (uint256)',
            'function speed() view returns (uint256)'
          ],
          signer
        );

        const [clicks, bucket, currentPressTime, currentSpeed] = await Promise.all([
          contract.totalClicks(),
          contract.bucket(),
          contract.pressTime(),
          contract.speed()
        ]);

        setHighScore(clicks.toString());
        const bucketInEth = parseFloat(ethers.formatEther(bucket));
        const bucketInUsd = bucketInEth * ethPrice;
        setBucketValue(bucketInUsd.toString());
        setPressTime(Number(currentPressTime));
        setSpeed(Number(currentSpeed));
      } catch (error) {
        console.error('Error fetching button data:', error);
      }
    };

    fetchData();
    const dataInterval = setInterval(fetchData, 5000);

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - pressTime;
      const remaining = speed - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(countdownInterval);
    };
  }, [signer, pressButton, pressTime, speed, ethPrice]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!signer) return;
      try {
        const address = await signer.getAddress();
        const balance = await signer.provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [signer]);

  const addWave = () => {
    const id = Date.now();
    setWaves(prev => [...prev, id]);
    setTimeout(() => {
      setWaves(prev => prev.filter(waveId => waveId !== id));
    }, 1000);
  };

  const handlePress = (e) => {
    e.preventDefault();
    handleConfirm();
  };

  const handleRelease = (e) => {
    e.preventDefault();
    addWave();
  };

  const handleSliderChange = (e) => {
    setAmount(parseFloat(e.target.value));
  };

  const getTimeForAmount = (amount) => {
    const maxTime = 3600;
    const minTime = 60;
    const maxAmount = 1;
    const minAmount = 0.01;
    
    const logMin = Math.log(minAmount);
    const logMax = Math.log(maxAmount);
    const scale = (Math.log(amount) - logMin) / (logMax - logMin);
    const time = maxTime - (maxTime - minTime) * scale;
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!signer || !pressButton) return;

    if (parseFloat(amount) > parseFloat(balance)) {
      showPopUp(`Insufficient balance. You have ${parseFloat(balance).toFixed(4)} ETH`);
      console.error('Insufficient balance:', amount, 'ETH needed,', balance, 'ETH available');
      return;
    }

    try {
      const contract = new ethers.Contract(
        pressButton,
        [
          'function press(string referralCode) payable',
          'function totalClicks() view returns (uint256)',
          'function bucket() view returns (uint256)',
          'function pressooor() view returns (address)',
          'function speed() view returns (uint256)',
          'function getStats(address) view returns (uint256)',
          'function timeSinceLastClick() view returns (uint256)'
        ],
        signer
      );

      // Decode the referral code back to address
      let decodedReferral = '';
      if (referralParam) {
        try {
          const bytes = bs58.decode(referralParam);
          decodedReferral = ethers.getAddress(ethers.hexlify(bytes));
        } catch (error) {
          console.error('Invalid referral code:', error);
        }
      }

      const tx = await contract.press(decodedReferral, {
        value: ethers.parseEther(amount.toString())
      });

      await tx.wait();
    } catch (error) {
      console.error('Error pressing button:', error);
      showPopUp('Error pressing button: ' + (error.reason || error.message || 'Unknown error'));
    }
  };

  const formatDollarValue = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(2)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(2)}K`;
    }
    return `$${numValue.toFixed(2)}`;
  };

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to copy the referral link
  const copyReferralLink = () => {
    const referralLink = getReferralLink();
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        showPopUp('Referral link copied!');
      })
      .catch((error) => {
        console.error('Failed to copy referral link:', error);
        showPopUp('Failed to copy referral link.');
      });
  };

  return (
    <PressContainer isMobile={isMobile}>
      <ComponentsWrapper isMobile={isMobile}>
        <StatsSection isMobile={isMobile}>
          <StatCard isMobile={isMobile}>
            <StatLabel isMobile={isMobile}>Total Clicks</StatLabel>
            <StatValue isMobile={isMobile}>{highScore}</StatValue>
          </StatCard>
          <StatCard isMobile={isMobile}>
            <StatLabel isMobile={isMobile}>Bucket</StatLabel>
            <StatValue isMobile={isMobile}>{formatDollarValue(bucketValue)}</StatValue>
          </StatCard>
          <StatCard isMobile={isMobile}>
            <StatLabel isMobile={isMobile}>Time Left</StatLabel>
            <StatValue isMobile={isMobile}>{formatTimeLeft(timeLeft)}</StatValue>
          </StatCard>
        </StatsSection>
        <SliderContainer isMobile={isMobile}>
          <Slider 
            type="range"
            min={0.01}
            max={1}
            step={0.01}
            value={amount}
            onChange={handleSliderChange}
          />
        </SliderContainer>
        <StatsSection isMobile={isMobile}>
          <StatCard isMobile={isMobile}>
            <StatLabel isMobile={isMobile}>Amount</StatLabel>
            <StatValue isMobile={isMobile}>{amount.toFixed(2)} ETH</StatValue>
          </StatCard>
          <StatCard isMobile={isMobile}>
            <StatLabel isMobile={isMobile}>Duration</StatLabel>
            <StatValue isMobile={isMobile}>{getTimeForAmount(amount)}</StatValue>
          </StatCard>
        </StatsSection>
      </ComponentsWrapper>
      <ButtonWrapper isMobile={isMobile}>
        <OuterGlow />
        {waves.map(id => (
          <SoundWave key={id} isMobile={isMobile} />
        ))}
        <RoundButton 
          onClick={handlePress}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
          onMouseUp={handleRelease}
          onTouchMove={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          isMobile={isMobile}
        />
      </ButtonWrapper>
      <CopyButton onClick={copyReferralLink} isMobile={isMobile}>
        referral
      </CopyButton>
    </PressContainer>
  );
};

export default Press;
