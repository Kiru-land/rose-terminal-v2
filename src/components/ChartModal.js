// src/components/ChartModal.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { createChart, CrosshairMode } from 'lightweight-charts';
// Import icons (you need to have these icons in your assets)
import { ReactComponent as LineChartIcon } from '../assets/line-chart-icon.svg';
import { ReactComponent as CandlestickIcon } from '../assets/candlestick-icon.svg';

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
  const [chartType, setChartType] = useState('line');
  const [isLoading, setIsLoading] = useState(true);
  const [lineData, setLineData] = useState([]);
  const [candlestickData, setCandlestickData] = useState([]);
  const [timeframe, setTimeframe] = useState('3600'); // Default to 1 hour

  const timeframeOptions = [
    { label: '1h', value: '3600' },
    { label: '4h', value: '14400' },
    { label: '1D', value: '86400' },
    { label: '3D', value: '259200' },
    { label: '1W', value: '604800' },
    { label: '1M', value: '2592000' },
  ];

  const convertToCandlestickData = (data, timeframe) => {
    const interval = parseInt(timeframe);
    const candlestickData = [];
    let currentCandle = null;

    data.forEach(dataPoint => {
      const time = Math.floor(dataPoint.time / interval) * interval;
      if (!currentCandle || currentCandle.time !== time) {
        if (currentCandle) {
          candlestickData.push(currentCandle);
        }
        currentCandle = {
          time: time,
          open: dataPoint.value,
          high: dataPoint.value,
          low: dataPoint.value,
          close: dataPoint.value,
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, dataPoint.value);
        currentCandle.low = Math.min(currentCandle.low, dataPoint.value);
        currentCandle.close = dataPoint.value;
      }
    });

    if (currentCandle) {
      candlestickData.push(currentCandle);
    }

    return candlestickData;
  };

  const aggregateLineData = (data, timeframe) => {
    const interval = parseInt(timeframe);
    const aggregatedData = [];
    let currentPoint = null;

    data.forEach(dataPoint => {
      const time = Math.floor(dataPoint.time / interval) * interval;
      if (!currentPoint || currentPoint.time !== time) {
        if (currentPoint) {
          aggregatedData.push(currentPoint);
        }
        currentPoint = {
          time: time,
          value: dataPoint.value,
        };
      } else {
        // For line charts, we can use the last value in the interval
        currentPoint.value = dataPoint.value;
      }
    });

    if (currentPoint) {
      aggregatedData.push(currentPoint);
    }

    return aggregatedData;
  };

  const createChartSeries = useCallback(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (chartType === 'line') {
      const lineSeries = chart.addLineSeries({
        color: '#00FF00',
        lineWidth: 2,
      });
      const aggregatedLineData = aggregateLineData(lineData, timeframe);
      lineSeries.setData(aggregatedLineData);
      seriesRef.current = lineSeries;
    } else if (chartType === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00FF00',
        downColor: '#009900',
        borderUpColor: '#00FF00',
        borderDownColor: '#009900',
        wickUpColor: '#00FF00',
        wickDownColor: '#009900',
      });
      candlestickSeries.setData(candlestickData);
      seriesRef.current = candlestickSeries;
    }
  }, [chartType, lineData, candlestickData, timeframe]);

  useEffect(() => {
    fetch('https://www.rose-terminal.com/api/prices/get-rose-price')
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          const rawData = result.data;
          const lineData = Object.entries(rawData).map(([timestamp, value]) => ({
            time: Number(timestamp) / 1000,
            value: value,
          })).sort((a, b) => a.time - b.time);

          setLineData(lineData);
          const candlestickData = convertToCandlestickData(lineData, timeframe);
          setCandlestickData(candlestickData);
          setIsLoading(false);
        } else {
          console.error('API request failed:', result.error);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching data', err);
        setIsLoading(false);
      });
  }, [timeframe]);

  useEffect(() => {
    if (!isLoading) {
      createChartSeries();
    }
  }, [isLoading, createChartSeries, chartType, timeframe]);

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

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
      timeScale: { 
        borderColor: '#ccc',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time, tickMarkType, locale) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          
          if (tickMarkType === 1) { // Day tick mark
            return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
          }
          
          return `${hours}:${minutes}`;
        },
      },
    });

    chartRef.current = chart;

    // Apply custom time scale options
    chart.timeScale().applyOptions({
      timeVisible: true,
      secondsVisible: false,
    });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ContentWrapper>
          <ControlsContainer>
            <ControlIcon onClick={() => setChartType('line')}>
              <LineChartIcon />
            </ControlIcon>
            <ControlIcon onClick={() => setChartType('candlestick')}>
              <CandlestickIcon />
            </ControlIcon>
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
