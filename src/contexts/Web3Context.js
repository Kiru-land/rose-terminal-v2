import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

const SALE_ADDRESS = '0x1234567890123456789012345678901234567890';
const SALE_ADDRESS_TESTNET = '0x1234567890123456789012345678901234567890';
const ROSE_TOKEN_ADDRESS = '0x0eA2cA5122381C6A4e79368F08a07Eca46bCe300';
const ROSE_TOKEN_TESTNET_ADDRESS = '0xdB02B6a7cfe9d4DE7D2dC585EFc27a24b6345aD1';

export const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [roseBalance, setRoseBalance] = useState('0');
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [rose, setRose] = useState(null);
  const [sale, setSale] = useState(null);
  const [reserve0, setReserve0] = useState('0');
  const [reserve1, setReserve1] = useState('0');
  const [alpha, setAlpha] = useState('0');

  const updateWeb3State = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined' && isConnected) {
      try {
        console.log('Updating Web3 state');
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const address = await newSigner.getAddress();
        const balance = await newProvider.getBalance(address);
        const network = await newProvider.getNetwork();
        const newChainId = network.chainId;

        const rose = newChainId === 1n ? ROSE_TOKEN_ADDRESS : newChainId === 17000n ? ROSE_TOKEN_TESTNET_ADDRESS : null;
        const sale = newChainId === 1n ? SALE_ADDRESS : newChainId === 17000n ? SALE_ADDRESS_TESTNET : null;
        const roseContract = new ethers.Contract(
          rose,
          ['function balanceOf(address) view returns (uint256)'],
          newProvider
        );

        let roseBalance = '0';
        try {
          roseBalance = await roseContract.balanceOf(address);
        } catch (error) {
          console.error('Error getting Rose balance:', error);
        }

        // Add the new function call
        const stateContract = new ethers.Contract(
          rose,
          ['function getState() view returns (uint256,uint256,uint256)'],
          newProvider
        );

        try {
          const [newReserve0, newReserve1, newAlpha] = await stateContract.getState();
          setReserve0(ethers.formatEther(newReserve0));
          setReserve1(ethers.formatEther(newReserve1));
          setAlpha(ethers.formatUnits(newAlpha, 6));
        } catch (error) {
          console.error('Error getting state:', error);
        }

        setProvider(newProvider);
        setSigner(newSigner);
        setChainId(newChainId);
        setBalance(ethers.formatEther(balance));
        setRoseBalance(ethers.formatEther(roseBalance));
        setRose(rose);
        setSale(sale);
        console.log('Web3 state updated');
      } catch (error) {
        console.error('Error updating Web3 state:', error);
      }
    }
  }, [isConnected]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
        await updateWeb3State();
        return true;
      } catch (error) {
        console.error('Detailed error in connectWallet:', error);
        throw error;
      }
    } else {
      console.error('Ethereum provider not found');
      throw new Error('Ethereum provider not found. Please install MetaMask.');
    }
  }, [updateWeb3State]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setBalance('0');
    setRoseBalance('0');
    setProvider(null);
    setSigner(null);
    setRose(null);
    setChainId(null);
    console.log('Wallet disconnected');
  }, []);

  useEffect(() => {
    if (isConnected) {
      updateWeb3State();
      const intervalId = setInterval(updateWeb3State, 5000);
      return () => clearInterval(intervalId);
    }
  }, [isConnected, updateWeb3State]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          updateWeb3State();
        }
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [disconnectWallet, updateWeb3State]);

  return (
    <Web3Context.Provider value={{ 
      isConnected, 
      balance, 
      roseBalance, 
      connectWallet, 
      disconnectWallet, 
      provider, 
      signer, 
      rose, 
      chainId,
      reserve0,
      reserve1,
      alpha,
      sale
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
