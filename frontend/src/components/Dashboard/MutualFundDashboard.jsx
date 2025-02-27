// frontend/src/components/Dashboard/MutualFundDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Plotly from "react-plotly.js";
import styles from "../../style";
import RiskVolatility from "./RiskVolatility";
import MonteCarloPrediction from "./MonteCarloPrediiction";

const MutualFundDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [randomFunds, setRandomFunds] = useState([]);
  const [fundDetails, setFundDetails] = useState({});
  const [historicalNav, setHistoricalNav] = useState([]);
  const [aumData, setAumData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch random funds on initial load
  useEffect(() => {
    const fetchRandomFunds = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/schemes?search=");
        const allFunds = Object.entries(response.data).map(([code, name]) => ({ code, name }));
        const shuffled = allFunds.sort(() => 0.5 - Math.random());
        setRandomFunds(shuffled.slice(0, 5));
      } catch (err) {
        console.error("Error fetching random funds:", err);
        setError("Failed to load initial funds.");
      } finally {
        setLoading(false);
      }
    };
    fetchRandomFunds();
  }, []);

  // Fetch suggestions based on search term
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/schemes?search=${searchTerm}`);
        const schemesArray = Object.entries(response.data).map(([code, name]) => ({
          code,
          name,
        }));
        setSuggestions(schemesArray.slice(0, 10));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("Failed to fetch suggestions.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all fund details when a fund is selected
  useEffect(() => {
    const fetchFundDetails = async () => {
      if (!selectedFund) {
        setFundDetails({});
        setHistoricalNav([]);
        setAumData([]);
        setHeatmapData([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const detailsResponse = await axios.get(`http://localhost:8000/api/scheme-details/${selectedFund.code}`);
        setFundDetails(detailsResponse.data);

        const navResponse = await axios.get(`http://localhost:8000/api/historical-nav/${selectedFund.code}`);
        setHistoricalNav(navResponse.data);

        const aumResponse = await axios.get("http://localhost:8000/api/average-aum");
        setAumData(aumResponse.data.filter(item => item["Fund Name"] === selectedFund.name).slice(0, 1));

        const heatmapResponse = await axios.get(`http://localhost:8000/api/performance-heatmap/${selectedFund.code}`);
        setHeatmapData(heatmapResponse.data);
      } catch (err) {
        console.error("Error fetching fund details:", err);
        setError("Failed to fetch fund details.");
      } finally {
        setLoading(false);
      }
    };
    fetchFundDetails();
  }, [selectedFund]);

  // Define event handlers
  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    setSelectedFund(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSelectFund = (fund) => {
    setSelectedFund(fund);
    setSearchTerm(fund.name);
    setSuggestions([]);
  };

  const plotData = heatmapData.length > 0
    ? [{
        x: heatmapData.map((d) => d.month),
        y: heatmapData.map((d) => d.dayChange),
        z: heatmapData.map((d) => d.dayChange),
        type: "heatmap",
        colorscale: "Viridis",
      }]
    : [];

  const filteredNavData = historicalNav.length > 30
    ? historicalNav.slice(-60).filter((_, index) => index % 2 === 0)
    : historicalNav;

  return (
    <div className={`bg-primary ${styles.paddingX} min-h-screen py-6`}>
      <div className="max-w-[1200px] mx-auto">
        {/* Search Bar */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-md">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full p-2 rounded bg-gray-900 text-white focus:outline-none border border-gray-700"
            placeholder="Search for a mutual fund..."
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-gray-800 text-white rounded-lg w-[300px] max-h-60 overflow-y-auto mt-2 shadow-lg">
              {suggestions.map((fund) => (
                <li
                  key={fund.code}
                  onClick={() => handleSelectFund(fund)}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                >
                  {fund.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading ? (
          <p className="text-white text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : selectedFund ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fund Details Card */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-white text-lg font-semibold mb-2">{selectedFund.name}</h3>
              <div className="text-gray-300 text-sm">
                {Object.entries(fundDetails).slice(0, 5).map(([key, value]) => (
                  <p key={key} className="mb-1">
                    <span className="font-medium">{key.replace(/_/g, " ")}:</span>{" "}
                    {key === "scheme_start_date" && value.includes("date")
                      ? (() => {
                          const parsed = JSON.parse(value.replace(/'/g, '"'));
                          return `${parsed.date} (NAV: ${parsed.nav})`;
                        })()
                      : value}
                  </p>
                ))}
              </div>
            </div>

            {/* Historical NAV Card */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-white text-lg font-semibold mb-2">Historical NAV (30+ Days)</h3>
              {filteredNavData.length > 0 ? (
                <LineChart width={350} height={200} data={filteredNavData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickCount={6} />
                  <YAxis stroke="#fff" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                  <Line type="monotone" dataKey="nav" stroke="#00f6ff" dot={false} strokeWidth={2} />
                </LineChart>
              ) : (
                <p className="text-gray-400">No NAV data</p>
              )}
            </div>

            {/* Average AUM Card */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-white text-lg font-semibold mb-2">Average AUM</h3>
              {aumData.length > 0 ? (
                <div className="text-gray-300 text-sm">
                  <p><span className="font-medium">Total AUM:</span> {aumData[0]["Total AUM"]}</p>
                </div>
              ) : (
                <p className="text-gray-400">No AUM data</p>
              )}
            </div>

            {/* Performance Heatmap Card */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-white text-lg font-semibold mb-2">Performance Heatmap</h3>
              {heatmapData.length > 0 ? (
                <Plotly
                  data={plotData}
                  layout={{
                    xaxis: { title: "Month", color: "#fff", tickfont: { size: 10 } },
                    yaxis: { title: "Day Change", color: "#fff", tickfont: { size: 10 } },
                    width: 350,
                    height: 200,
                    margin: { t: 20, b: 40, l: 40, r: 20 },
                  }}
                  config={{ displayModeBar: false }}
                />
              ) : (
                <p className="text-gray-400">No heatmap data</p>
              )}
            </div>

            {/* Risk & Volatility Card */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <RiskVolatility selectedScheme={selectedFund} />
            </div>

            {/* Monte Carlo Prediction Card */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <MonteCarloPrediction selectedScheme={selectedFund} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomFunds.map((fund) => (
              <div
                key={fund.code}
                onClick={() => handleSelectFund(fund)}
                className="bg-gray-800 rounded-lg p-4 shadow-md hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <h3 className="text-white text-md font-semibold mb-2">{fund.name}</h3>
                <p className="text-gray-400 text-sm">Code: {fund.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MutualFundDashboard;