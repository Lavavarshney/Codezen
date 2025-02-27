// frontend/src/components/Dashboard/RiskVolatility.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import styles from "../../style";

const RiskVolatility = ({ selectedScheme }) => {
  const [metrics, setMetrics] = useState({});
  const [returnsData, setReturnsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch risk data when a scheme is selected
  useEffect(() => {
    const fetchRiskData = async () => {
      if (!selectedScheme) {
        setMetrics({});
        setReturnsData([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/risk-volatility/${selectedScheme.code}`);
        setMetrics({
          annualized_volatility: response.data.annualized_volatility,
          annualized_return: response.data.annualized_return,
          sharpe_ratio: response.data.sharpe_ratio,
        });
        setReturnsData(response.data.returns);
      } catch (err) {
        console.error("Error fetching risk data:", err);
        setError("Failed to fetch risk data. Please try again.");
        setMetrics({});
        setReturnsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRiskData();
  }, [selectedScheme]);

  return (
    <section className={`${styles.paddingY} flex-col`}>
      <h2 className={styles.heading2}>Risk and Volatility Analysis</h2>
      <div className="w-full max-w-[600px]">
        {loading ? (
          <p className={styles.paragraph}>Loading...</p>
        ) : error ? (
          <p className={styles.paragraph}>{error}</p>
        ) : selectedScheme && Object.keys(metrics).length > 0 ? (
          <>
            <div className="text-white mb-4">
              <p>Annualized Volatility: {(metrics.annualized_volatility * 100).toFixed(2)}%</p>
              <p>Annualized Return: {(metrics.annualized_return * 100).toFixed(2)}%</p>
              <p>Sharpe Ratio: {metrics.sharpe_ratio.toFixed(2)}</p>
            </div>
            <div className="flex justify-center">
              <LineChart width={600} height={300} data={returnsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="returns" stroke="#00f6ff" />
              </LineChart>
            </div>
          </>
        ) : (
          <p className={styles.paragraph}>No risk analysis data available</p>
        )}
      </div>
    </section>
  );
};

export default RiskVolatility;