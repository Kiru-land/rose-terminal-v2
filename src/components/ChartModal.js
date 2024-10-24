import React, { useRef, useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import config from '../config.js';

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
  const [originalPriceData, setOriginalPriceData] = useState([]); // Store original data
  const [priceData, setPriceData] = useState([]);
  const [chart, setChart] = useState(null);
  const [lineSeries, setLineSeries] = useState(null);

  // Add WebSocket state
  const wsRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('/api/proxy/get-rose-price?timeframe=1h');
        if (response.data.success && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map((item) => ({
            time: item.timestamp,
            value: item.price,
          }));
          setOriginalPriceData(formattedData); // Cache the data
          // Initially aggregate data for the default timeframe
          const aggregatedData = aggregateData(formattedData, timeframe);
          setPriceData(aggregatedData);
        } else {
          console.error('Invalid data structure received:', response.data);
        }
      } catch (error) {
        console.error('Error fetching initial price data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Handle WebSocket connection
  useEffect(() => {
    // Replace 'ws://yourserver.com:8080' with your server's WebSocket URL
    const socket = new WebSocket(config.SERVER_IP);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleNewPriceData(data);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      // Optionally implement reconnection logic here
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  // Handle incoming price data
  const handleNewPriceData = (data) => {
    // Update originalPriceData with the new data point
    setOriginalPriceData((prevData) => {
      const newData = [...prevData, { time: data.timestamp, value: data.price }];
      return newData;
    });

    // Re-aggregate the data based on the current timeframe
    setPriceData((prevData) => {
      const aggregatedData = aggregateData(originalPriceData, timeframe);
      return aggregatedData;
    });

    // Update the chart with the new data point
    if (lineSeries) {
      lineSeries.update({ time: data.timestamp, value: data.price });
      // Optionally adjust the time scale to keep the new data in view
      chart.timeScale().scrollToRealTime();
    }
  };

  // Aggregate data based on selected timeframe and fill gaps
  const aggregateData = (data, selectedTimeframe) => {
    const timeframeMap = {
      '1h': 3600,    // 1 hour in seconds
      '4h': 14400,   // 4 hours in seconds
      '1d': 86400,   // 1 day in seconds
      // '1w': 604800,  // 1 week in seconds (Removed)
    };
    const interval = timeframeMap[selectedTimeframe];
    if (!interval) {
      console.error(`Invalid timeframe selected: ${selectedTimeframe}`);
      return [];
    }

    const aggregatedData = [];
    if (data.length === 0) {
      return aggregatedData;
    }

    // Sort data by time
    const sortedData = [...data].sort((a, b) => a.time - b.time);

    // Determine the start and end times based on the first and last data points
    const startTime = Math.floor(sortedData[0].time / interval) * interval;
    const endTime = Math.floor(sortedData[sortedData.length - 1].time / interval) * interval;

    let currentTime = startTime;
    let dataIndex = 0;
    let previousPrice = sortedData[0].value;

    while (currentTime <= endTime) {
      const bucketPrices = [];

      // Collect all prices within the current interval
      while (
        dataIndex < sortedData.length &&
        sortedData[dataIndex].time >= currentTime &&
        sortedData[dataIndex].time < currentTime + interval
      ) {
        bucketPrices.push(sortedData[dataIndex].value);
        previousPrice = sortedData[dataIndex].value;
        dataIndex++;
      }

      // If we have collected prices, calculate the average
      if (bucketPrices.length > 0) {
        const avgValue =
          bucketPrices.reduce((sum, val) => sum + val, 0) / bucketPrices.length;
        aggregatedData.push({
          time: currentTime,
          value: avgValue,
        });
      } else {
        // No data in this interval, use the previous price
        aggregatedData.push({
          time: currentTime,
          value: previousPrice,
        });
      }

      currentTime += interval;
    }

    return aggregatedData;
  };

  // Handle timeframe changes
  const handleTimeframeChange = (event) => {
    const newTimeframe = event.target.value;
    setTimeframe(newTimeframe);

    const aggregatedData = aggregateData(originalPriceData, newTimeframe);
    setPriceData(aggregatedData);
  };

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
        localization: {
          priceFormatter: (price) => price.toExponential(2),
        },
      });

      const lineSeriesInstance = chartInstance.addLineSeries({
        color: '#00ff00',
      });

      setChart(chartInstance);
      setLineSeries(lineSeriesInstance);

      const handleResize = () => {
        chartInstance.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
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

  return (
    <ModalOverlay onClick={onClose}>
      <ChartContainer onClick={(e) => e.stopPropagation()}>
        <TimeframeSelector value={timeframe} onChange={handleTimeframeChange}>
          <option value="1h">1H</option>
          <option value="4h">4H</option>
          <option value="1d">1D</option>
          {/* Removed the '1w' option */}
          {/* <option value="1w">1W</option> */}
        </TimeframeSelector>
        <ChartWrapper ref={chartContainerRef} />
      </ChartContainer>
    </ModalOverlay>
  );
};

export default ChartModal;
