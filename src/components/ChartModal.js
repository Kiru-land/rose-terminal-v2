import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';
import styled from 'styled-components';

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
  background-color: #000000;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 800px;
`;

const ChartContainer = styled.div`
  height: 400px;
`;

const TimeframeSelect = styled.select`
  background-color: #333;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const ChartModal = ({ onClose }) => {
  const chartContainerRef = useRef();
  const [allPriceData, setAllPriceData] = useState([]);
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    const fetchAllPriceData = async () => {
      try {
        const response = await axios.get('/api/proxy/get-rose-price?timeframe=all');
        if (response.data.success && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map(item => ({
            time: item.timestamp,
            value: item.price
          }));
          setAllPriceData(formattedData);
        } else {
          console.error('Invalid data structure received:', response.data);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchAllPriceData();
  }, []);

  const filteredData = useMemo(() => {
    if (!allPriceData.length) return [];

    const now = Date.now();
    const timeframeInMs = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    return allPriceData.filter(item => 
      now - new Date(item.time).getTime() <= timeframeInMs[timeframe]
    );
  }, [allPriceData, timeframe]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#000000',
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        formatter: (price) => price.toExponential(2),
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#00FF00',
      lineWidth: 2,
    });

    if (filteredData.length > 0) {
      lineSeries.setData(filteredData);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [filteredData]);

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <TimeframeSelect value={timeframe} onChange={handleTimeframeChange}>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1D">1D</option>
          <option value="All">All</option>
        </TimeframeSelect>
        <ChartContainer ref={chartContainerRef} />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChartModal;
