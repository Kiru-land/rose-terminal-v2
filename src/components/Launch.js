import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import { usePopUp } from '../contexts/PopUpContext';
import { FaEthereum, FaInfoCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ethers } from 'ethers';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const LaunchContainer = styled.div`
  position: fixed;
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
  max-width: 90vw;
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

const SaleRow = styled.div`
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
  padding: 12px;
  height: 50px;
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
  padding: 8px;
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

const ParticipateButton = styled.button`
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
  margin-top: 30px;
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
  padding: 10px;
  margin-top: 15px;
`;

const DashboardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
  color: #00ff00;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateY(${props => props.isVisible ? 0 : '10px'});
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  transition-delay: ${props => props.delay}s;
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

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
  transform: scale(${props => props.isVisible ? '1' : '0.8'});
  opacity: ${props => props.isVisible ? '1' : '0'};
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  transition-delay: 0.2s;
`;

const CustomTooltip = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
`;

const TooltipLabel = styled.p`
  color: rgba(0, 255, 0, 0.8);
  font-size: 12px;
  margin: 0;
`;

const TooltipExplanation = styled.p`
  color: rgba(0, 255, 0, 0.8);
  font-size: 12px;
  margin: 5px 0 0;
`;

const ChartTooltip = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.9);
  color: #00ff00;
  padding: 15px;
  border-radius: 15px;
  font-size: 12px;
  max-width: 300px;
  width: 300px;
  z-index: 1000;
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  opacity: ${props => props.visible ? 1 : 0};
  transition: visibility 0.2s, opacity 0.2s;
  right: -320px;
  top: 0;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  line-height: 1.4;
  border: 1px solid rgba(0, 255, 0, 0.3);
`;

const Launch = ({ animateLogo, setAsyncOutput }) => {
  const [panelWidth, setPanelWidth] = useState(380);
  const [amount, setAmount] = useState('');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [totalRaised, setTotalRaised] = useState('0');
  const [expectedMarketCap, setExpectedMarketCap] = useState('0');
  const [activeTooltip, setActiveTooltip] = useState(null);

  const { showPopUp } = usePopUp();
  const { signer, balance: nativeBalance, sale: saleAddress, provider } = useWeb3();

  const updatePanelWidth = useCallback(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      setPanelWidth(screenWidth * 0.9);
    } else {
      setPanelWidth(380);
    }
  }, []);

  useEffect(() => {
    updatePanelWidth();
    window.addEventListener('resize', updatePanelWidth);
    return () => window.removeEventListener('resize', updatePanelWidth);
  }, [updatePanelWidth]);

  const fetchSaleData = async () => {
    if (provider && saleAddress) {
      const saleContract = new ethers.Contract(
        saleAddress,
        ['function totalRaised() view returns (uint256)'],
        provider
      );

      try {
        const raised = await saleContract.totalRaised();
        const raisedEth = ethers.formatEther(raised);
        setTotalRaised(raisedEth);
        setExpectedMarketCap((parseFloat(raisedEth) * 4).toFixed(6));
      } catch (error) {
        console.error('Error fetching sale data:', error);
      }
    }
  };

  useEffect(() => {
    fetchSaleData();
    const interval = setInterval(fetchSaleData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [provider, saleAddress]);

  const softCap = "200";
  const hardCap = "500";

  const data = [
    { name: 'Fair Launch', value: 62 },
    { name: 'Liquidity', value: 20 },
    { name: 'Clawback', value: 10 },
    { name: 'Treasury', value: 8 },
  ];

  const COLORS = ['rgba(0, 255, 0, 0.4)', 'rgba(0, 204, 255, 0.4)', 'rgba(255, 0, 255, 0.4)', 'rgba(255, 165, 0, 0.4)'];
  const HOVER_COLORS = ['rgba(0, 255, 0, 0.8)', 'rgba(0, 204, 255, 0.8)', 'rgba(255, 0, 255, 0.8)', 'rgba(255, 165, 0, 0.8)'];

  const handlePieEnter = (_, index) => {
    setActiveTooltip(data[index].name);
  };

  const handlePieLeave = () => {
    setActiveTooltip(null);
  };

  const getTooltipContent = (name) => {
    switch (name) {
      case 'Fair Launch':
        return 'Percentage of the ROSE total supply to be sold into the Fair Launch';
      case 'Liquidity':
        return 'Percentage of ROSE going into the custom aAMM liquidity pool';
      case 'Treasury':
        return 'Funds reserved for future incentivisation, buybacks, strategic investing and development funding';
      case 'Clawback':
        return 'Allocation for cool Ethereum communities';
      default:
        return '';
    }
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value.slice(0, 8);
    setAmount(newAmount);
  };

  const handleMaxClick = () => {
    const maxEth = parseFloat(nativeBalance) - 0.01;
    setAmount(maxEth > 0 ? maxEth.toFixed(6) : '0');
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
      const nativeBalanceInWei = ethers.parseEther(nativeBalance);
      if (amountInWei > nativeBalanceInWei) {
        showPopUp(<>Insufficient ETH balance. <br /> Current balance: {parseFloat(ethers.formatEther(nativeBalanceInWei)).toFixed(6)}<FaEthereum /></>);
        return;
      }

      try {
        setAsyncOutput(<>Processing participation of {amount}<FaEthereum /> ...</>);

        if (amountInWei > nativeBalanceInWei) {
          showPopUp(<>Insufficient ETH balance. <br /> Current balance: {parseFloat(ethers.formatEther(nativeBalanceInWei)).toFixed(6)}<FaEthereum /></>);
          return;
        }

        const saleContract = new ethers.Contract(
          saleAddress,
          ['function participate() payable'],
          signer
        );

        const tx = await saleContract.participate({
          value: amountInWei
        });

        showPopUp('Transaction sent. Waiting for confirmation...');

        await tx.wait();

        setAsyncOutput(<>Successfully participated for {amount}<FaEthereum /></>);
        showPopUp(<>Successfully participated in the sale for {amount}<FaEthereum /></>);
      } catch (error) {
        console.error('Error during sale participation:', error);
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
        setAsyncOutput('Error occurred during sale participation. Please try again.');
      }
    });
  };

  const CustomTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <CustomTooltip>
          <TooltipLabel>{`${data.name}: ${data.value}%`}</TooltipLabel>
          <TooltipExplanation>{getTooltipContent(data.name)}</TooltipExplanation>
        </CustomTooltip>
      );
    }
    return null;
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
    <LaunchContainer width={panelWidth} isDashboardVisible={isDashboardVisible}>
      <ContentWrapper>
        <SaleRow>
          <IconButton>
            <FaEthereum />
          </IconButton>
          <Panel>
            <InputWrapper>
              <Input 
                type="text" 
                value={amount} 
                onChange={handleAmountChange} 
                placeholder="Enter amount"
              />
              <MaxButton onClick={handleMaxClick}>max</MaxButton>
            </InputWrapper>
          </Panel>
        </SaleRow>
        <DashboardContainer>
          <DashboardTitle onClick={toggleDashboard} isOpen={isDashboardVisible}>
            Details
            <ArrowIcon isOpen={isDashboardVisible}>
              &#10095;
            </ArrowIcon>
          </DashboardTitle>
          <DashboardContent isVisible={isDashboardVisible}>
            <Dashboard>
              <DashboardRow isVisible={isContentVisible} delay={0.1}>
                <DashboardLabel>Type:</DashboardLabel>
                <DashboardValue>
                  Fair Launch
                  <HelpIcon onClick={handleHelpIconClick} />
                </DashboardValue>
              </DashboardRow>
              <DashboardRow isVisible={isContentVisible} delay={0.2}>
                <DashboardLabel>Soft Cap:</DashboardLabel>
                <DashboardValue>{softCap}<FaEthereum /></DashboardValue>
              </DashboardRow>
              <DashboardRow isVisible={isContentVisible} delay={0.3}>
                <DashboardLabel>Hard Cap:</DashboardLabel>
                <DashboardValue>{hardCap}<FaEthereum /></DashboardValue>
              </DashboardRow>
              <DashboardRow isVisible={isContentVisible} delay={0.4}>
                <DashboardLabel>Amount Raised:</DashboardLabel>
                <DashboardValue>{totalRaised}<FaEthereum /></DashboardValue>
              </DashboardRow>
              <DashboardRow isVisible={isContentVisible} delay={0.5}>
                <DashboardLabel>Implied Market Cap:</DashboardLabel>
                <DashboardValue>{expectedMarketCap}<FaEthereum /></DashboardValue>
              </DashboardRow>
              <ChartContainer isVisible={isContentVisible}>
                <PieChart width={240} height={240}>
                  <Pie
                    data={data}
                    cx={120}
                    cy={110}
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                    cornerRadius={8}
                    onMouseEnter={handlePieEnter}
                    onMouseLeave={handlePieLeave}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeTooltip === entry.name ? HOVER_COLORS[index % HOVER_COLORS.length] : COLORS[index % COLORS.length]}
                        stroke="rgba(0, 0, 0, 0.2)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </Dashboard>
          </DashboardContent>
        </DashboardContainer>
      </ContentWrapper>
      <ParticipateButton 
        onClick={handleExecute} 
        disabled={!amount}
      >
        Participate
      </ParticipateButton>
      <HelpTooltip 
        visible={showTooltip} 
        onClick={handleTooltipClick}
      >
        <strong>Proportional Oversubscribed Capped Sale</strong><br /><br />
        This Fair Launch has a <em>soft</em> and <em>hard</em> cap. <br /> <br />
        1.) If the total amount raised is smaller than the soft cap, all participation gets reimbursed. <br /> <br />
        2.) If the amount raised is bigger than the hard cap, the excess tokens get proportionally reimbursed to every user.<br /> <br />
        Participants receive a part of the 62% of ROSE tokens sold based on their proportional share of the total <FaEthereum /> submitted.<br /> <br />
        <em>Note: The Implied Market Cap will increase linearly with the contribution amount until it reaches the Hard Cap of 500<FaEthereum />. <br /> The Implied Market Cap will vary between 800<FaEthereum /> at the Soft Cap and 2000<FaEthereum /> at the Hard Cap and beyond.</em>
      </HelpTooltip>
    </LaunchContainer>
  );
};

export default Launch;
