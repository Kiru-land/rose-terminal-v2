import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import { usePopUp } from '../contexts/PopUpContext';
import { FaEthereum } from 'react-icons/fa6';
import { ethers } from 'ethers';
import { debounce } from 'lodash';

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

const MaxButton = styled.button`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 4px;
  color: rgba(0, 255, 0, 0.5);
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: lowercase;

  &:hover {
    background: rgba(0, 255, 0, 0.2);
    color: rgba(0, 255, 0, 0.8);
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

const PriceImpactText = styled.div`
  color: ${props => props.impact > 5 ? '#ff4136' : 'rgba(0, 255, 0, 0.6)'};
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
`;

const Trade = ({ animateLogo, setAsyncOutput }) => {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [isEthOnTop, setIsEthOnTop] = useState(true);
  const { showPopUp } = usePopUp();
  const { signer, rose, balance: nativeBalance, roseBalance, reserve0, reserve1 } = useWeb3();
  const [slippage, setSlippage] = useState(3);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [panelWidth, setPanelWidth] = useState(350);
  const [priceImpact, setPriceImpact] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

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

  const getQuote = useCallback(async (inputAmount) => {
    if (!signer || !rose || !inputAmount) return null;

    try {
      const roseContract = new ethers.Contract(
        rose,
        [
          'function quoteDeposit(uint256 amount) view returns (uint256)',
          'function quoteWithdraw(uint256 amount) view returns (uint256)'
        ],
        signer
      );

      const amountInWei = ethers.parseEther(inputAmount);
      let quoteAmount;

      if (isEthOnTop) {
        quoteAmount = await roseContract.quoteDeposit(amountInWei);
      } else {
        quoteAmount = await roseContract.quoteWithdraw(amountInWei);
      }

      return ethers.formatEther(quoteAmount);
    } catch (error) {
      console.error('Error getting quote:', error);
      return null;
    }
  }, [signer, rose, isEthOnTop]);

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
    setPriceImpact(null);
    setIsQuoteLoading(true);
    debouncedGetQuote(newAmount);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleExecute();
    }
  };

  useEffect(() => {
    const calculatePriceImpact = () => {
      if (amount && quote && reserve0 && reserve1 && !isQuoteLoading) {
        const spotQuote = isEthOnTop
          ? (parseFloat(reserve1) / parseFloat(reserve0)) * parseFloat(amount)
          : (parseFloat(reserve0) / parseFloat(reserve1)) * parseFloat(amount);
        const actualQuote = parseFloat(quote);
        let impact;
        if (isEthOnTop) {
          impact = ((spotQuote / actualQuote) - 1) * 100;
        } else {
          impact = -(((actualQuote / spotQuote) - 1) * 100) - 1;
        }
        if (isNaN(impact)) {
          setPriceImpact(null);
        } else {
          setPriceImpact(impact);
        }
      } else {
        setPriceImpact(null);
      }
    };

    calculatePriceImpact();
  }, [amount, quote, reserve0, reserve1, isEthOnTop, isQuoteLoading]);

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

    const amountInWei = ethers.parseEther(amount);
    const roundedAmount = Math.round(parseFloat(amount) * 1e6) / 1e6;

    if (roundedAmount < 0.000001) {
      showPopUp(<>Amount too small. <br /> Minimum amount: 0.000001.</>);
      return;
    }

    animateLogo(async () => {
      if (isEthOnTop) {
        ////////////////////////////////////////////////////////////////////
        ///////////////////////////  Deposit  //////////////////////////////
        ////////////////////////////////////////////////////////////////////
        const nativeBalanceInWei = ethers.parseEther(nativeBalance);
        if (amountInWei > nativeBalanceInWei) {
          showPopUp(<>Insufficient ETH balance. <br /> Current balance: {parseFloat(ethers.formatEther(nativeBalanceInWei)).toFixed(6)}<FaEthereum /></>);
          return;
        }

        try {
          setAsyncOutput(<>Processing deposit of {amount}<FaEthereum /> ...</>);

          const roseContract = new ethers.Contract(
            rose,
            ['function deposit(uint256) payable'],
            signer
          );

          // Update: Handle very small values
          const minQuote = parseFloat(quote) * (100 - slippage) / 100;
          let minQuoteInWei;
          if (minQuote < 1e-18) {
            minQuoteInWei = 1n; // Set to 1 wei if the value is too small
          } else {
            minQuoteInWei = ethers.parseEther(minQuote.toFixed(18));
          }
          
          const tx = await roseContract.deposit(minQuoteInWei, {
            value: amountInWei
          });

          showPopUp('Transaction sent. Waiting for confirmation...');

          await tx.wait();

          setAsyncOutput(<>Received {quote}🌹</>);
          showPopUp(<>Successfully deposited {amount}<FaEthereum /> for {quote}🌹</>);
        } catch (error) {
          console.error('Error during deposit:', error);
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
          setAsyncOutput('Error occurred during deposit. Please try again.');
        }
      } else {
        ////////////////////////////////////////////////////////////////////
        ///////////////////////////  Withdraw  /////////////////////////////
        ////////////////////////////////////////////////////////////////////
        if (amountInWei > ethers.parseEther(roseBalance)) {
          showPopUp(<>Insufficient ROSE balance. <br /> Current balance: {parseFloat(roseBalance).toFixed(6)}🌹</>);
          return;
        }

        const numericReserve1 = parseFloat(reserve1);
        if (parseFloat(amount) > (numericReserve1 / 20)) {
          showPopUp(`Amount too large, can only sell up to 5% of the pool at a time. Max sell: ${(numericReserve1/20).toFixed(6)}🌹`);
          return;
        }

        try {
          setAsyncOutput(<>Processing withdrawal of {amount}🌹 ...</>);

          const roseContract = new ethers.Contract(
            rose,
            ['function withdraw(uint256,uint256)'],
            signer
          );

          // Update: Handle very small values
          const minQuote = parseFloat(quote) * (100 - slippage) / 100;
          let minQuoteInWei;
          if (minQuote < 1e-18) {
            minQuoteInWei = 1n; // Set to 1 wei if the value is too small
          } else {
            minQuoteInWei = ethers.parseEther(minQuote.toFixed(18));
          }
          
          const tx = await roseContract.withdraw(amountInWei, minQuoteInWei);

          showPopUp('Transaction sent. Waiting for confirmation...');

          await tx.wait();

          setAsyncOutput(<>Received {parseFloat(quote).toFixed(6)}<FaEthereum /></>);
          showPopUp(<>Successfully withdrawn {amount}🌹 for {parseFloat(quote).toFixed(6)}<FaEthereum /></>);
        } catch (error) {
          console.error('Error during withdrawal:', error);
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
          setAsyncOutput('Error occurred during withdrawal. Please try again.');
        }
      }
    });
  };

  const handleIconClick = () => {
    setIsEthOnTop(!isEthOnTop);
  };

  const handleMaxClick = () => {
    if (isEthOnTop) {
      const maxEth = parseFloat(nativeBalance) - 0.01;
      setAmount(maxEth > 0 ? maxEth.toFixed(6) : '0');
    } else {
      setAmount(roseBalance);
    }
  };

  return (
    <TradeContainer width={panelWidth}>
      <TradeRow>
        <IconButton onClick={handleIconClick}>
          {isEthOnTop ? <FaEthereum /> : '🌹'}
        </IconButton>
        <Panel>
          <InputWrapper>
            <Input 
              type="text" 
              value={amount} 
              onChange={handleAmountChange} 
              onKeyPress={handleKeyPress} 
              placeholder="Enter amount"
            />
            <MaxButton onClick={handleMaxClick}>max</MaxButton>
          </InputWrapper>
        </Panel>
      </TradeRow>
      <TradeRow>
        <IconButton onClick={handleIconClick}>
          {isEthOnTop ? '🌹' : <FaEthereum />}
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
            max="25"
            step="0.1"
            value={slippage}
            onChange={handleSlippageChange}
          />
          <SliderLabel>{slippage.toFixed(1)}%</SliderLabel>
        </SliderRow>
      </SliderContainer>
      {amount && (
        <PriceImpactText impact={priceImpact || 0}>
          Price Impact: {
            isQuoteLoading || priceImpact === null 
              ? '...' 
              : priceImpact.toFixed(2) + '%'
          }
        </PriceImpactText>
      )}
      <ExecuteButton 
        onClick={handleExecute} 
        disabled={!amount}
      >
        Execute
      </ExecuteButton>
    </TradeContainer>
  );
};

export default Trade;
