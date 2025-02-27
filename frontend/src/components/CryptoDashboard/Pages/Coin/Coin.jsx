// frontend/src/components/CryptoDashboard/pages/Coin/Coin.jsx
import React, { useContext, useEffect, useState } from "react";
import "./Coin.css";
import { useParams } from "react-router-dom";
import { CoinContext } from "../../../../context/CoinContext";
import LineChart from "../../LineChart/LineChart";
import styles from "../../../../style";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState();
  const { currency } = useContext(CoinContext);

  const fetchCoinData = async () => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-Hvgn6sK6p2ANPLykxRssVbTx",
      },
    };

    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options)
      .then((response) => response.json())
      .then((response) => setCoinData(response))
      .catch((err) => console.error(err));
  };

  const fetchHistoricalData = async () => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-yDF1jqFeSyQ6SL3MbpeuPuMc",
      },
    };

    fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`,
      options
    )
      .then((response) => response.json())
      .then((response) => setHistoricalData(response))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [currency]);

  if (coinData && historicalData) {
    return (
      <div className={`bg-primary ${styles.paddingY} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <div className="coin-name flex flex-col items-center gap-5 my-20">
            <img src={coinData.image.large} alt="" className="min-w-[100px]" />
            <p className={`${styles.heading2} text-center`}>
              {coinData.name} ({coinData.symbol.toUpperCase()})
            </p>
          </div>
          <div className="coin-chart max-w-[600px] h-[250px] mx-auto">
            <LineChart historicalData={historicalData} />
          </div>
          <div className="coin-info max-w-[600px] mx-auto mt-12 text-white">
            <ul className="flex justify-between py-2 border-b border-gray-600">
              <li>Crypto Market Rank</li>
              <li>{coinData.market_cap_rank}</li>
            </ul>
            <ul className="flex justify-between py-2 border-b border-gray-600">
              <li>Crypto Price</li>
              <li>
                {currency.Symbol}{" "}
                {coinData.market_data.current_price[currency.name].toLocaleString()}
              </li>
            </ul>
            <ul className="flex justify-between py-2 border-b border-gray-600">
              <li>Market Cap</li>
              <li>
                {currency.Symbol}{" "}
                {coinData.market_data.market_cap[currency.name].toLocaleString()}
              </li>
            </ul>
            <ul className="flex justify-between py-2 border-b border-gray-600">
              <li>24 Hour High</li>
              <li>
                {currency.Symbol}{" "}
                {coinData.market_data.high_24h[currency.name].toLocaleString()}
              </li>
            </ul>
            <ul className="flex justify-between py-2 border-b border-gray-600">
              <li>24 Hour Low</li>
              <li>
                {currency.Symbol}{" "}
                {coinData.market_data.low_24h[currency.name].toLocaleString()}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`spinner ${styles.flexCenter} min-h-[80vh]`}>
        <div className="spin w-[65px] h-[65px] border-4 border-gray-400 border-t-[#4500c6] rounded-full animate-spin"></div>
      </div>
    );
  }
};

export default Coin;