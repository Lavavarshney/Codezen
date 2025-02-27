// frontend/src/components/Dashboard/MonteCarloPrediction.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import styles from "../../style";

const MonteCarloPrediction = ({ selectedScheme }) => {
  const [monteCarloData, setMonteCarloData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const SIMULATIONS = 100;
  const DAYS_AHEAD = 252;

  useEffect(() => {
    const fetchDataAndSimulate = async () => {
      if (!selectedScheme || !selectedScheme.code) {
        setMonteCarloData([]);
        setHistoricalData([]);
        setError("No scheme selected.");
        return;
      }

      console.log("Fetching data for scheme:", selectedScheme.code);
      setLoading(true);
      setError(null);

      try {
        // Fetch historical NAV
        const navResponse = await axios.get(`http://localhost:8000/api/historical-nav/${selectedScheme.code}`);
        console.log("NAV Response Sample:", JSON.stringify(navResponse.data.slice(0, 5), null, 2));
        const navData = navResponse.data.map(item => ({
          ...item,
          date: parseDate(item.date), // Normalize to yyyy-mm-dd
        }));
        if (!navData || navData.length === 0) {
          console.warn("No historical NAV data found.");
          setHistoricalData([]);
          setMonteCarloData([]);
          return;
        }
        setHistoricalData(navData);

        // Fetch risk/volatility data
        const riskResponse = await axios.get(`http://localhost:8000/api/risk-volatility/${selectedScheme.code}`);
        console.log("Risk Response:", JSON.stringify(riskResponse.data, null, 2));
        const riskData = riskResponse.data;
        if (!riskData || !riskData.annualized_return || !riskData.annualized_volatility) {
          console.warn("Invalid or missing risk/volatility data.");
          setMonteCarloData([]);
          return;
        }
        const { annualized_return, annualized_volatility } = riskData;

        const dailyReturn = annualized_return / 252;
        const dailyVolatility = annualized_volatility / Math.sqrt(252);
        console.log("Daily Return:", dailyReturn, "Daily Volatility:", dailyVolatility);

        const simulatedPaths = runMonteCarloSimulation(dailyReturn, dailyVolatility, navData);
        console.log("Simulated Paths Sample:", simulatedPaths.length > 0 ? JSON.stringify(simulatedPaths[0].slice(0, 5), null, 2) : "[]");
        setMonteCarloData(simulatedPaths);
      } catch (err) {
        console.error("Error fetching data for Monte Carlo:", err.message, err.response?.data || err);
        setError(`Failed to fetch data: ${err.message}`);
        setMonteCarloData([]);
        setHistoricalData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDataAndSimulate();
  }, [selectedScheme]);

  // Parse date from various formats to yyyy-mm-dd, handle undefined or invalid cases
  const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      console.warn("Invalid or missing date string, using fallback:", dateStr);
      return new Date().toISOString().split("T")[0]; // Fallback to today's date
    }

    const parts = dateStr.split("-");
    if (parts.length !== 3) {
      console.warn("Unexpected date format, using fallback:", dateStr);
      return new Date().toISOString().split("T")[0]; // Fallback to today's date
    }

    let [day, month, year] = parts;
    // Handle dd-mm-yyyy format (common with mftool)
    if (parseInt(day) > 12 && parseInt(month) <= 12) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    // Assume yyyy-mm-dd or adjust if first part looks like a year
    if (parseInt(day) > 31 || parseInt(month) > 12) {
      console.warn("Ambiguous date format, assuming yyyy-mm-dd:", dateStr);
      return dateStr; // Return as-is if unclear
    }
    return `${day}-${month.padStart(2, "0")}-${year.padStart(2, "0")}`;
  };

  const runMonteCarloSimulation = (dailyReturn, dailyVolatility, navData) => {
    console.log("Running Monte Carlo with:", { dailyReturn, dailyVolatility, navDataLength: navData.length });
    if (!navData || navData.length === 0) {
      console.warn("No NAV data for simulation.");
      return [];
    }

    const lastEntry = navData[navData.length - 1];
    const lastNav = parseFloat(lastEntry.nav);
    console.log("Last NAV:", lastNav);
    if (isNaN(lastNav)) {
      console.warn("Last NAV is invalid:", lastEntry.nav);
      return [];
    }

    const lastDateStr = lastEntry.date;
    console.log("Last Date (parsed):", lastDateStr);
    const lastDate = new Date(lastDateStr);
    if (isNaN(lastDate.getTime())) {
      console.error("Invalid initial date, cannot proceed:", lastDateStr);
      return [];
    }

    const simulations = [];
    for (let i = 0; i < SIMULATIONS; i++) {
      const path = [{ date: lastDateStr, nav: lastNav }];
      let currentNav = lastNav;

      for (let j = 1; j <= DAYS_AHEAD; j++) {
        const randomReturn = dailyReturn + dailyVolatility * gaussianRandom();
        currentNav *= (1 + randomReturn);
        const previousDate = new Date(path[j - 1].date);
        previousDate.setDate(previousDate.getDate() + 1);

        if (isNaN(previousDate.getTime())) {
          console.error("Invalid date generated at step", j, "from", path[j - 1].date);
          return [];
        }

        path.push({
          date: previousDate.toISOString().split("T")[0],
          nav: currentNav,
        });
      }
      simulations.push(path);
    }
    return simulations;
  };

  const gaussianRandom = () => {
    const u = Math.random();
    const v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const combinedData = historicalData.concat(monteCarloData.length > 0 ? monteCarloData[0] : []);

  return (
    <section className={`${styles.paddingY} flex-col`}>
      <h2 className={styles.heading2}>Monte Carlo Prediction (1 Year)</h2>
      <div className="w-full max-w-[600px]">
        {loading ? (
          <p className={styles.paragraph}>Loading...</p>
        ) : error ? (
          <p className={styles.paragraph}>{error}</p>
        ) : selectedScheme && monteCarloData.length > 0 ? (
          <div className="flex justify-center">
            <LineChart
              width={600}
              height={300}
              data={combinedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="nav"
                stroke="#8884d8"
                name="Historical + Predicted NAV"
                dot={false}
              />
              {monteCarloData.slice(1, 5).map((path, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey="nav"
                  data={path}
                  stroke="#82ca9d"
                  name={`Simulation ${index + 1}`}
                  dot={false}
                  strokeOpacity={0.3}
                />
              ))}
            </LineChart>
          </div>
        ) : (
          <p className={styles.paragraph}>No data available for Monte Carlo simulation</p>
        )}
      </div>
    </section>
  );
};

export default MonteCarloPrediction;