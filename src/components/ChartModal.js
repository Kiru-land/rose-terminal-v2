// src/components/ChartModal.js
import React, { useRef, useEffect, useState } from 'react';
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
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 800px;
`;

const ChartContainer = styled.div`
  height: 400px;
`;

const CloseButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const ChartModal = ({ onClose }) => {
  const chartContainerRef = useRef();
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await axios.get('/api/proxy/get-rose-price');

        if (response.data.success && Array.isArray(response.data.data)) {
          // Format the data as required by Lightweight Charts
          const formattedData = response.data.data
            .map((item) => ({
              time: item.timestamp, // Assuming timestamp is in seconds since epoch
              value: parseFloat(item.price),
            }))
            .sort((a, b) => a.time - b.time);
          setPriceData(formattedData);
        } else {
          console.error('Invalid data structure received:', response.data);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchPriceData();
  }, []);

  useEffect(() => {
    if (priceData.length === 0 || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#1e1e1e',
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 10,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        borderVisible: true,
        borderColor: '#485c7b',
        visible: true,
        tickMarkFormatter: (time, tickMarkType, locale) => {
          let date;
          if (typeof time === 'number') {
            // time is a UTCTimestamp in seconds
            date = new Date(time * 1000); // Convert seconds to milliseconds
          } else if (
            typeof time === 'object' &&
            time.year !== undefined &&
            time.month !== undefined &&
            time.day !== undefined
          ) {
            // time is a BusinessDay object
            date = new Date(Date.UTC(time.year, time.month - 1, time.day));
          } else {
            console.error('Unsupported time format:', time);
            return '';
          }
          return date.toLocaleString(locale, {
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        },
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price) => {
          // Format price using scientific notation with two decimal places
          return price.toExponential(2);
        },
      },
    });

    lineSeries.setData(priceData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [priceData]);

  return (
    <ModalOverlay>
      <ModalContent>
        {priceData.length > 0 ? (
          <ChartContainer ref={chartContainerRef} />
        ) : (
          <div>No price data available</div>
        )}
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChartModal;
