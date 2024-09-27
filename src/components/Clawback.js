import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context';
import { usePopUp } from '../contexts/PopUpContext';
import { ethers } from 'ethers';
import { generateProof, verifyProof } from './MerkleInclusion';

// Styled components
const TradeContainer = styled.div`
  width: ${props => props.width}px;
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TradeRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-right: 10px;
`;

const Panel = styled.div`
  flex-grow: 1;
  background-color: #2a2a2a;
  border-radius: 5px;
  padding: 10px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 16px;
  &:focus {
    outline: none;
  }
`;

const QuoteText = styled.div`
  color: white;
  font-size: 18px;
`;

const ExecuteButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  &:disabled {
    background-color: #2a2a2a;
    cursor: not-allowed;
  }
`;

const Clawback = ({ animateLogo, setAsyncOutput }) => {
  const [address, setAddress] = useState('');
  const [allocation, setAllocation] = useState(null);
  const { showPopUp } = usePopUp();
  const { signer, rose } = useWeb3();
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

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    // Here you would typically fetch the allocation for the given address
    // For now, we'll just set a dummy value
    setAllocation(newAddress ? '1000' : null);
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

  return (
    <TradeContainer width={panelWidth}>
      <TradeRow>
        <IconButton>🏷️</IconButton>
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
      </TradeRow>
      <TradeRow>
        <IconButton>🌹</IconButton>
        <Panel>
          <QuoteText>
            {allocation ? `${allocation} ROSE` : ''}
          </QuoteText>
        </Panel>
      </TradeRow>
      <ExecuteButton 
        onClick={handleExecute} 
        disabled={!address || !allocation}
      >
        Clawback
      </ExecuteButton>
    </TradeContainer>
  );
};

export default Clawback;

