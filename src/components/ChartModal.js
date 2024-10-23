import React, { useRef, useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalOverlay = styled.div`
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

const ChartContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 600px) {
    width: 90vw;
    padding: 15px;
  }
`;

const ChartWrapper = styled.div`
  height: 400px;
  margin-bottom: 20px;
`;

const TimeframeSelector = styled.select`
  background-color: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: none;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 10px;
  width: 60px;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 255, 0, 0.2);
  }
`;

const ChartModal = ({ onClose }) => {
  const chartContainerRef = useRef();
  const [timeframe, setTimeframe] = useState('1h');
  const [priceData, setPriceData] = useState([]);
  const [chart, setChart] = useState(null);
  const [lineSeries, setLineSeries] = useState(null);

  // Separate fetch function to be reused
  const fetchPriceData = async (selectedTimeframe) => {
    try {
      const response = await axios.get(`/api/proxy/get-rose-price?timeframe=${selectedTimeframe}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map(item => ({
          time: item.timestamp,
          value: item.price,
        }));
        setPriceData(formattedData);
      } else {
        console.error('Invalid data structure received:', response.data);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPriceData(timeframe);
  }, []);

  // Chart initialization
  useEffect(() => {
    if (chartContainerRef.current) {
      const chartInstance = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: 'solid', color: '#000000' },
          textColor: '#00ff00',
        },
        grid: {
          vertLines: { color: '#2B2B43' },
          horzLines: { color: '#2B2B43' },
        },
        rightPriceScale: {
          borderColor: '#2B2B43',
        },
        timeScale: {
          borderColor: '#2B2B43',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const lineSeriesInstance = chartInstance.addLineSeries({ color: '#00ff00' });
      setChart(chartInstance);
      setLineSeries(lineSeriesInstance);

      const handleResize = () => {
        chartInstance.applyOptions({ width: chartContainerRef.current.clientWidth });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.remove();
      };
    }
  }, []);

  // Update chart data when priceData changes
  useEffect(() => {
    if (lineSeries && priceData.length > 0) {
      lineSeries.setData(priceData);
      chart.timeScale().fitContent();
    }
  }, [priceData, lineSeries]);

  const handleTimeframeChange = async (event) => {
    const newTimeframe = event.target.value;
    setTimeframe(newTimeframe);
    await fetchPriceData(newTimeframe);
  };

  // Modified fillDataGaps function
  const fillDataGaps = (data, selectedTimeframe) => {
    if (data.length < 2) return data;

    const intervals = {
      '1h': 3600,      // 1 hour in seconds
      '4h': 14400,     // 4 hours in seconds
      '1d': 86400,     // 1 day in seconds
      '1w': 604800,    // 1 week in seconds
    };

    const interval = intervals[selectedTimeframe];
    const filledData = [];
    data.sort((a, b) => a.time - b.time);

    for (let i = 0; i < data.length - 1; i++) {
      // Add current point
      filledData.push(data[i]);
      
      const currentTime = data[i].time;
      const nextTime = data[i + 1].time;
      const timeDiff = nextTime - currentTime;

      // If there's a gap larger than our interval
      if (timeDiff > interval) {
        // Use the current point's price (the one just before the gap)
        const priceBeforeGap = data[i].value;
        
        // Fill the gap with points using the price from before the gap
        let tempTime = currentTime + interval;
        while (tempTime < nextTime) {
          filledData.push({
            time: tempTime,
            value: priceBeforeGap  // Use price from before the gap
          });
          tempTime += interval;
        }
      }
    }
    
    // Add the last point
    filledData.push(data[data.length - 1]);
    
    return filledData;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ChartContainer onClick={(e) => e.stopPropagation()}>
        <TimeframeSelector value={timeframe} onChange={handleTimeframeChange}>
          <option value="1h">1H</option>
          <option value="4h">4H</option>
          <option value="1d">1D</option>
          <option value="1w">1W</option>
        </TimeframeSelector>
        <ChartWrapper ref={chartContainerRef} />
      </ChartContainer>
    </ModalOverlay>
  );
};

export default ChartModal;
