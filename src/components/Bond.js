import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context.js';
import { usePopUp } from '../contexts/PopUpContext.js';
import { FaEthereum } from 'react-icons/fa6';
import { ethers } from 'ethers';
import { debounce } from 'lodash';
import kirusayok from '../assets/kirusayok.mp3';
import kirusayahah from '../assets/kirusayahah.mp3';

// Add all styled components from Trade.js
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const TradeContainer = styled.div`
  position: absolute;
  top: 55%;
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
  overflow-y: auto;

  @media (max-width: 600px) {
    width: 90vw;
    padding: 20px;
  }
`;

const TradeRow = styled.div`
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
  font-size: 16px;
  outline: none;
  text-align: left;
  font-family: inherit;
  maxLength={8}
  padding-right: 40px;

  &::placeholder {
    font-size: 15px;
    color: rgba(0, 255, 0, 0.5);
  }
`;

const QuoteText = styled.p`
  color: ${props => props.isLoading ? 'rgba(0, 255, 0, 0.5)' : '#00ff00'};
  font-size: ${props => props.isLoading ? '15px' : '16px'};
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

const SliderContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  max-height: ${props => props.isVisible ? '50px' : '0'};
  transition: max-height 0.3s ease-out;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: #00ff00;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #00ff00;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #00ff00;
    cursor: pointer;
  }
`;

const SliderLabel = styled.span`
  color: #00ff00;
  margin-left: 10px;
  min-width: 60px;
  font-weight: 500;
  font-size: 13px;
`;

const SliderTitle = styled.span`
  color: ${props => props.isOpen ? 'rgba(0, 255, 0, 0.5)' : 'grey'};
  font-size: 0.7em;
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  align-items: center;
  
  &:hover {
    color: ${props => props.isOpen ? 'rgba(0, 255, 0, 0.8)' : 'lightgrey'};
  }
`;

const ArrowIcon = styled.span`
  margin-left: 5px;
  display: inline-block;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(-90deg)' : 'rotate(90deg)'};
`;

const BonusText = styled.div`
  color: rgba(0, 255, 0, 0.6);
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
`;

const MaxOutText = styled.div`
  color: #ff4444;  // Red color for warning
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
`;

const Bond = ({ animateLogo, setAsyncOutput }) => {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [baseQuote, setBaseQuote] = useState(null);
  const [maxKiru, setMaxKiru] = useState(null);
  const { showPopUp } = usePopUp();
  const { signer, kiru, bond, balance: nativeBalance } = useWeb3();
  const [slippage, setSlippage] = useState(1);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const executeAudioRef = useRef(new Audio(kirusayok));
  const successAudioRef = useRef(new Audio(kirusayahah));
  const [panelWidth, setPanelWidth] = useState(350);

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
    const fetchMaxKiru = async () => {
      if (!signer || !kiru || !bond) return;

      try {
        const kiruContract = new ethers.Contract(
          kiru,
          ['function balanceOf(address) view returns (uint256)'],
          signer
        );

        const balance = await kiruContract.balanceOf(bond);
        setMaxKiru(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error fetching max KIRU:', error);
      }
    };

    fetchMaxKiru();
  }, [signer, kiru, bond]);

  const getQuote = useCallback(async (inputAmount) => {
    if (!signer || !kiru || !inputAmount) return null;

    try {
      const kiruContract = new ethers.Contract(
        kiru,
        ['function quoteDeposit(uint256 amount) view returns (uint256)'],
        signer
      );

      const amountInWei = ethers.parseEther(inputAmount);
      const quoteAmount = await kiruContract.quoteDeposit(amountInWei);
      const baseQuoteValue = parseFloat(ethers.formatEther(quoteAmount));
      
      setBaseQuote(baseQuoteValue);
      
      return baseQuoteValue.toString();
    } catch (error) {
      console.error('Error getting quote:', error);
      return null;
    }
  }, [signer, kiru]);

  const debouncedGetQuote = useCallback(
    debounce(async (inputAmount) => {
      if (inputAmount) {
        setIsQuoteLoading(true);
        const newQuote = await getQuote(inputAmount);
        setQuote(newQuote);
        setIsQuoteLoading(false);
      } else {
        setQuote(null);
      }
    }, 500),
    [getQuote]
  );

  const handleAmountChange = (e) => {
    const newAmount = e.target.value.slice(0, 8);
    setAmount(newAmount);
    setIsQuoteLoading(true);
    debouncedGetQuote(newAmount);
  };

  const handleSlippageChange = (e) => {
    const value = parseFloat(e.target.value);
    setSlippage(Math.round(value * 10) / 10);
  };

  const toggleSliderVisibility = () => {
    setIsSliderVisible(!isSliderVisible);
  };

  const handleExecute = async () => {
    if (!signer) {
      showPopUp('Please connect your wallet first.');
      return;
    }

    executeAudioRef.current.play().catch(error => console.error("Execute audio playback failed:", error));

    const amountInWei = ethers.parseEther(amount);
    const roundedAmount = Math.round(parseFloat(amount) * 1e6) / 1e6;

    if (roundedAmount < 0.000001) {
      showPopUp(<>Amount too small. <br /> Minimum amount: 0.000001.</>);
      return;
    }

    animateLogo(async () => {
      const nativeBalanceInWei = ethers.parseEther(nativeBalance);
      if (amountInWei > nativeBalanceInWei) {
        showPopUp(<>Insufficient ETH balance. <br /> Current balance: {parseFloat(ethers.formatEther(nativeBalanceInWei)).toFixed(6)}<FaEthereum /></>);
        return;
      }

      try {
        setAsyncOutput(<>Processing bond of {amount}<FaEthereum /> ...</>);

        const bondContract = new ethers.Contract(
          bond,
          ['function bond(uint256,uint256,uint256) payable'],
          signer
        );

        // Calculate minimum output with slippage
        const minQuote = parseFloat(quote) * (100 - slippage) / 100;
        let minQuoteInWei;
        if (minQuote < 1e-18) {
          minQuoteInWei = 1n;
        } else {
          minQuoteInWei = ethers.parseEther(minQuote.toFixed(18));
        }

        const tx = await bondContract.bond(
          minQuoteInWei, // outMin
          0n,           // amount0Min
          0n,           // amount1Min
          { value: amountInWei }
        );

        showPopUp('Transaction sent. Waiting for confirmation...');

        await tx.wait();

        successAudioRef.current.play().catch(error => console.error("Success audio playback failed:", error));

        setAsyncOutput(<>Bonded {quote}👼🏻. You successfully bonded with Kiru 💚</>);
        showPopUp(<>Successfully bonded {amount}<FaEthereum /> for {quote}👼🏻</>);
      } catch (error) {
        console.error('Error during bond:', error);
        let errorMessage = "An error occurred during the transaction.";
        
        if (error.reason) {
          errorMessage = error.reason;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        if (errorMessage.toLowerCase().includes('rejected')) {
          errorMessage = "User rejected the request";
        }
        
        showPopUp(errorMessage);
        setAsyncOutput('Error occurred during bond. Please try again.');
      }
    });
  };

  return (
    <TradeContainer width={panelWidth}>
      <TradeRow>
        <IconButton>
          <FaEthereum />
        </IconButton>
        <Panel>
          <InputWrapper>
            <Input 
              type="text" 
              value={amount} 
              onChange={handleAmountChange}
              placeholder="Enter ETH amount"
            />
          </InputWrapper>
        </Panel>
      </TradeRow>
      <TradeRow>
        <IconButton>
          👼🏻
        </IconButton>
        <Panel>
          <QuoteText isLoading={!quote && amount !== ''}>
            {amount 
              ? (quote 
                  ? parseFloat(quote).toFixed(10) 
                  : 'loading quote...') 
              : ''}
          </QuoteText>
        </Panel>
      </TradeRow>
      <SliderContainer>
        <SliderTitle onClick={toggleSliderVisibility} isOpen={isSliderVisible}>
          Slippage
          <ArrowIcon isOpen={isSliderVisible}>
            &#10095;
          </ArrowIcon>
        </SliderTitle>
        <SliderRow isVisible={isSliderVisible}>
          <Slider
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={slippage}
            onChange={handleSlippageChange}
          />
          <SliderLabel>{slippage.toFixed(1)}%</SliderLabel>
        </SliderRow>
      </SliderContainer>
      
      {amount && (
        <>
          <BonusText>
            + {baseQuote ? (baseQuote * 0.2).toFixed(10) : '...'} 👼🏻
          </BonusText>
          {maxKiru && baseQuote && (baseQuote * 1.2 > parseFloat(maxKiru)) && (
            <MaxOutText>
              max kiru out: {parseFloat(maxKiru).toFixed(10)}
            </MaxOutText>
          )}
        </>
      )}

      <ExecuteButton 
        onClick={handleExecute} 
        disabled={!amount || (maxKiru && baseQuote && baseQuote * 1.2 > parseFloat(maxKiru))}
      >
        Bond
      </ExecuteButton>
    </TradeContainer>
  );
};

export default Bond;
