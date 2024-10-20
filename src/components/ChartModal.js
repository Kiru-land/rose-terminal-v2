// src/components/ChartModal.js
import React, { useRef, useEffect, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
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
  margin-bottom: 10px;
  padding: 5px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
`;

const ChartModal = ({ onClose }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const [priceData, setPriceData] = useState([]);
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    fetchPriceData();
  }, []);

  const fetchPriceData = async () => {
    try {
      const response = await axios.get('/api/proxy/get-rose-price');
      if (response.data.success && Array.isArray(response.data.data)) {
        setPriceData(response.data.data);
      } else {
        console.error('Invalid data structure received:', response.data);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  useEffect(() => {
    if (priceData.length === 0 || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: 'black' },
        textColor: 'white',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        format: (price) => price.toExponential(2),
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#00FF00',
      lineWidth: 2,
    });

    lineSeries.setData(priceData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [priceData]);

  const handleTimeframeChange = (event) => {
    const newTimeframe = event.target.value;
    setTimeframe(newTimeframe);

    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      switch (newTimeframe) {
        case '15min':
          timeScale.applyOptions({ timeVisible: true, secondsVisible: true });
          break;
        case '1h':
          timeScale.applyOptions({ timeVisible: true, secondsVisible: false });
          break;
        case '4h':
        case '1d':
          timeScale.applyOptions({ timeVisible: true, secondsVisible: false });
          break;
        case 'all':
          timeScale.applyOptions({ timeVisible: true, secondsVisible: false });
          break;
        default:
          timeScale.applyOptions({ timeVisible: true, secondsVisible: false });
          break;
      }
      timeScale.fitContent();
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <TimeframeSelect value={timeframe} onChange={handleTimeframeChange}>
          <option value="15min">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
          <option value="all">All</option>
        </TimeframeSelect>
        <ChartContainer ref={chartContainerRef} />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChartModal;
