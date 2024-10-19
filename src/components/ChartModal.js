// src/components/ChartModal.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { createChart, CrosshairMode } from 'lightweight-charts';
// Import icons (you need to have these icons in your assets)
import { ReactComponent as LineChartIcon } from '../assets/line-chart-icon.svg';
import { ReactComponent as CandlestickIcon } from '../assets/candlestick-icon.svg';
import axios from 'axios';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 600px) {
    width: 90vw;
    padding: 20px;
  }
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 20px;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ControlIcon = styled.div`
  cursor: pointer;
  margin-right: 15px;

  svg {
    fill: #00FF00;
    width: 24px;
    height: 24px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const Select = styled.select`
  font-family: 'Fira Code', monospace;
  background: none;
  color: #00FF00;
  border: none;
  cursor: pointer;
  font-size: 14px;
  appearance: none;
  padding-right: 20px;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%2300FF00' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0px top 50%;
  background-size: 20px;

  option {
    background-color: #222;
    color: #fff;
  }

  &:focus {
    outline: none;
  }
`;

const ChartModal = ({ onClose }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [candlestickData, setCandlestickData] = useState([]);
  const [timeframe, setTimeframe] = useState('1m');

  const timeframeOptions = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '30m', value: '30m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1D', value: '1D' },
    { label: '3D', value: '3D' },
  ];

  const fetchPriceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/proxy/get-rose-price`, {
        params: { timeframe }
      });
      console.log('Raw response data:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map(candle => ({
          time: candle.t / 1000, // Convert back to seconds for lightweight-charts
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c
        }));
        console.log('Formatted data:', formattedData);
        setCandlestickData(formattedData);
      } else {
        console.error('Invalid data structure received:', response.data);
        // Optionally, set an error state here
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
      // Optionally, set an error state here
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: 'black' },
        textColor: 'white',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#ccc' },
      timeScale: { borderColor: '#ccc' },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00FF00',
      downColor: '#FF0000',
      borderVisible: false,
      wickUpColor: '#00FF00',
      wickDownColor: '#FF0000',
    });

    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && seriesRef.current && candlestickData.length > 0) {
      console.log('Setting chart data:', candlestickData);
      seriesRef.current.setData(candlestickData);
      chartRef.current.timeScale().fitContent();
    }
  }, [isLoading, candlestickData]);

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ContentWrapper>
          <ControlsContainer>
            <Select value={timeframe} onChange={handleTimeframeChange}>
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </ControlsContainer>
          <ChartContainer ref={chartContainerRef} />
        </ContentWrapper>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChartModal;
