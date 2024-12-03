import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import bs58 from 'bs58'; // Import bs58 library

const Web3Context = createContext();

const DEPOSIT2_ADDRESS = '0xA03557982e740093Eb61eE0Ca95a449585AaB8c0';
const BOND_ADDRESS = '0x8e24A4Fe3ad0801A185943e8138Ad389690c5dB5';
const LAUNCH_ADDRESS_TESTNET = '0x1234567890123456789012345678901234567890';
const KIRU_TOKEN_ADDRESS = '0xe04d4E49Fd4BCBcE2784cca8B80CFb35A4C01da2';
const KIRU_TOKEN_TESTNET_ADDRESS = '0xfff92F33a08BBeA79FBdb40e7E427641C02E1Aa1';
const PRESS_BUTTON_ADDRESS = '0x1234567890123456789012345678901234567890';

export const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [kiruBalance, setKiruBalance] = useState('0');
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [kiru, setKiru] = useState(null);
  const [bond, setLaunch] = useState(null);
  const [reserve0, setReserve0] = useState('0');
  const [reserve1, setReserve1] = useState('0');
  const [alpha, setAlpha] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [deposit2, setDeposit2] = useState(null);
  const [pressButton, setPressButton] = useState(null);
  const [referralCode, setReferralCode] = useState('');

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

        const kiru = newChainId === 1n ? KIRU_TOKEN_ADDRESS : newChainId === 17000n ? KIRU_TOKEN_TESTNET_ADDRESS : null;
        const bond = newChainId === 1n ? BOND_ADDRESS : newChainId === 17000n ? LAUNCH_ADDRESS_TESTNET : null;
        const deposit2Address = newChainId === 1n ? DEPOSIT2_ADDRESS : null;
        const kiruContract = new ethers.Contract(
          kiru,
          [
            'function balanceOf(address) view returns (uint256)',
            'function totalSupply() view returns (uint256)'
          ],
          newProvider
        );

        let kiruBalance = '0';
        let supply = '0';
        try {
          kiruBalance = await kiruContract.balanceOf(address);
          supply = await kiruContract.totalSupply();
        } catch (error) {
          console.error('Error getting Kiru balance or supply:', error);
        }

        // Add the new function call
        const stateContract = new ethers.Contract(
          kiru,
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

        const pressButtonAddress = newChainId === 1n ? PRESS_BUTTON_ADDRESS : null;

        setProvider(newProvider);
        setSigner(newSigner);
        setChainId(newChainId);
        setBalance(ethers.formatEther(balance));
        setKiruBalance(ethers.formatEther(kiruBalance));
        setKiru(kiru);
        setLaunch(bond);
        setTotalSupply(ethers.formatEther(supply));
        setDeposit2(deposit2Address);
        setPressButton(pressButtonAddress);
        console.log('Web3 state updated');
      } catch (error) {
        console.error('Error updating Web3 state:', error);
      }
    }
  }, [isConnected]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts',
          params: [] 
        });
        
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          await updateWeb3State();
          return true;
        } else {
          throw new Error('No accounts returned');
        }
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
    setKiruBalance('0');
    setProvider(null);
    setSigner(null);
    setKiru(null);
    setChainId(null);
    setDeposit2(null);
    console.log('Wallet disconnected');
  }, []);

  useEffect(() => {
    if (isConnected) {
      updateWeb3State();
      const intervalId = setInterval(updateWeb3State, 2000);
      return () => clearInterval(intervalId);
    }
  }, [isConnected, updateWeb3State]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', (chainId) => {
        updateWeb3State();
      });
      
      window.ethereum.on('accountsChanged', (accounts) => {
        if (!accounts || accounts.length === 0) {
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

  useEffect(() => {
    const generateReferralCode = async () => {
      if (!signer) return;
      try {
        const address = await signer.getAddress();
        // Encode the address bytes using base58
        const addressBytes = ethers.getAddress(address).substring(2); // Remove '0x'
        const bytes = ethers.hexlify(`0x${addressBytes}`);
        const uint8Array = ethers.getBytes(bytes);
        const code = bs58.encode(uint8Array); // Base58 encode

        setReferralCode(code);
      } catch (error) {
        console.error('Error generating referral code:', error);
      }
    };
    generateReferralCode();
  }, [signer]);

  const getReferralLink = () => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  return (
    <Web3Context.Provider value={{ 
      isConnected, 
      balance, 
      kiruBalance, 
      connectWallet, 
      disconnectWallet, 
      provider, 
      signer, 
      kiru, 
      chainId,
      reserve0,
      reserve1,
      alpha,
      bond,
      totalSupply,
      deposit2,
      pressButton,
      referralCode,
      getReferralLink,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export function useWeb3() {
  return useContext(Web3Context);
}
