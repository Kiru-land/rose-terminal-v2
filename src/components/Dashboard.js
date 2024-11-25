import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context.js';
import { ethers } from 'ethers';
import { getEthPrice } from '../utils/getEthPrice.js';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const DashboardOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DashboardContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

  @media (max-width: 600px) {
    width: 95%;
    padding: 10px;
    gap: 10px;
  }
`;

const MetricsSection = styled.div`
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: rgba(0, 255, 0, 0.05);
  border-radius: 15px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
`;

const MetricCard = styled.div`
  flex: 1;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;

  @media (max-width: 600px) {
    padding: 10px;
  }

  &:hover {
    background-color: rgba(0, 255, 0, 0.1);
    border-radius: 10px;
  }
`;

const MetricLabel = styled.div`
  color: #00ff00;
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.8;

  @media (max-width: 600px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

const MetricValue = styled.div`
  color: #00ff00;
  font-size: 18px;
  font-weight: bold;
  
  @media (max-width: 600px) {
    font-size: 16px;
    word-break: break-all;
  }
`;

const MetricPercentage = styled.div`
  color: #00ff00;
  font-size: 12px;
  opacity: 0.6;
  margin-top: 4px;

  @media (max-width: 600px) {
    font-size: 11px;
    margin-top: 2px;
  }
`;

const Dashboard = ({ onClose }) => {
    const { provider, kiru, bond, signer, totalSupply, reserve0, reserve1 } = useWeb3();
    const [metrics, setMetrics] = useState({
        alphaBurn: '0',
        alphaBurnPercent: '0',
        betaBurn: '0',
        betaBurnPercent: '0',
        totalBurn: '0',
        totalBurnPercent: '0',
        locked: '0',
        claimable: '0',
        marketCap: '0',
        liquidity: '0'
    });

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const TOTAL_SUPPLY = 1000000000000n * 10n**18n; // 1 trillion with 18 decimals
                const kiruContract = new ethers.Contract(
                    kiru,
                    [
                        'function totalSupply() view returns (uint256)',
                        'function balanceOf(address) view returns (uint256)'
                    ],
                    provider
                );
                
                // Fetch current total supply and burned tokens
                const currentSupply = await kiruContract.totalSupply();
                const burnedTokens = await kiruContract.balanceOf('0x0000000000000000000000000000000000000000');
                
                // Calculate alpha and beta burns
                const alphaBurn = TOTAL_SUPPLY - currentSupply;
                const betaBurn = burnedTokens;
                const totalBurn = alphaBurn + betaBurn;
                
                // Calculate percentages using Number conversion for floating-point math
                const alphaBurnPercent = (Number(alphaBurn) / Number(TOTAL_SUPPLY)) * 100;
                const betaBurnPercent = (Number(betaBurn) / Number(TOTAL_SUPPLY)) * 100;
                const totalBurnPercent = (Number(totalBurn) / Number(TOTAL_SUPPLY)) * 100;
                
                setMetrics(prev => ({
                    ...prev,
                    alphaBurn: (alphaBurn / 10n**18n).toString(),
                    alphaBurnPercent: alphaBurnPercent.toFixed(2),
                    betaBurn: (betaBurn / 10n**18n).toString(),
                    betaBurnPercent: betaBurnPercent.toFixed(2),
                    totalBurn: (totalBurn / 10n**18n).toString(),
                    totalBurnPercent: totalBurnPercent.toFixed(2),
                }));

                // Add rewards fetching
                if (bond && signer) {
                    const bondContract = new ethers.Contract(
                        bond,
                        [
                            'function rewards(address) view returns (uint256)',
                            'function lastBond(address) view returns (uint256)'
                        ],
                        provider
                    );

                    const userAddress = await signer.getAddress();
                    const rewards = await bondContract.rewards(userAddress);
                    const lastBondTimestamp = await bondContract.lastBond(userAddress);
                    
                    // Check if within 3 days (3 * 24 * 60 * 60 seconds)
                    const currentTimestamp = Math.floor(Date.now() / 1000);
                    const threeDaysSeconds = 3 * 24 * 60 * 60;
                    const isLocked = (currentTimestamp - Number(lastBondTimestamp)) < threeDaysSeconds;
                    
                    setMetrics(prev => ({
                        ...prev,
                        locked: isLocked ? (rewards / 10n**18n).toString() : '0',
                        claimable: !isLocked ? (rewards / 10n**18n).toString() : '0',
                    }));
                }

                // Market metrics calculations
                if (reserve0 && reserve1 && totalSupply) {
                    const ethPrice = await getEthPrice();
                    
                    // Calculate market cap: (reserve0/reserve1 * totalSupply) * ethPrice
                    const marketCap = (parseFloat(reserve0) / parseFloat(reserve1) * parseFloat(totalSupply)) * ethPrice;
                    
                    // Calculate liquidity: reserve0 * 2 * ethPrice
                    const liquidity = parseFloat(reserve0) * 2 * ethPrice;
                    
                    setMetrics(prev => ({
                        ...prev,
                        marketCap: marketCap.toFixed(2),
                        liquidity: liquidity.toFixed(2)
                    }));
                }
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        if (provider && kiru) {
            fetchMetrics();
        }
    }, [provider, kiru, bond, signer, totalSupply, reserve0, reserve1]);

    return (
        <DashboardOverlay onClick={onClose}>
            <DashboardContainer onClick={(e) => e.stopPropagation()}>
                {/* Burn Metrics Section */}
                <MetricsSection>
                    <MetricCard>
                        <MetricLabel>α Burn</MetricLabel>
                        <MetricValue>{metrics.alphaBurn}</MetricValue>
                        <MetricPercentage>{metrics.alphaBurnPercent}%</MetricPercentage>
                    </MetricCard>

                    <MetricCard>
                        <MetricLabel>β Burn</MetricLabel>
                        <MetricValue>{metrics.betaBurn}</MetricValue>
                        <MetricPercentage>{metrics.betaBurnPercent}%</MetricPercentage>
                    </MetricCard>

                    <MetricCard>
                        <MetricLabel>Total Burn</MetricLabel>
                        <MetricValue>{metrics.totalBurn}</MetricValue>
                        <MetricPercentage>{metrics.totalBurnPercent}%</MetricPercentage>
                    </MetricCard>
                </MetricsSection>

                {/* Lock Metrics Section */}
                <MetricsSection>
                    <MetricCard>
                        <MetricLabel>Locked</MetricLabel>
                        <MetricValue>{metrics.locked}</MetricValue>
                    </MetricCard>

                    <MetricCard>
                        <MetricLabel>Claimable</MetricLabel>
                        <MetricValue>{metrics.claimable}</MetricValue>
                    </MetricCard>
                </MetricsSection>

                {/* Market Metrics Section */}
                <MetricsSection>
                    <MetricCard>
                        <MetricLabel>Market Cap</MetricLabel>
                        <MetricValue>{metrics.marketCap}</MetricValue>
                    </MetricCard>

                    <MetricCard>
                        <MetricLabel>Liquidity</MetricLabel>
                        <MetricValue>{metrics.liquidity}</MetricValue>
                    </MetricCard>
                </MetricsSection>
            </DashboardContainer>
        </DashboardOverlay>
    );
};

export default Dashboard;
