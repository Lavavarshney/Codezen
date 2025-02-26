import { useState, useEffect } from "react";
import axios from "axios";
import Plotly from "react-plotly.js";
import styles from "../../style";

const PerformanceHeatmap = () => {
  const [selectedScheme, setSelectedScheme] = useState("120164");
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch scheme codes for dropdown
  const [schemeOptions, setSchemeOptions] = useState([]);
  useEffect(() => {
    const fetchSchemeCodes = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/schemes?amc=ICICI");
        const options = Object.entries(response.data).map(([code, name]) => ({
          code,
          name,
        }));
        setSchemeOptions(options);
      } catch (err) {
        console.error("Error fetching scheme codes:", err);
      }
    };
    fetchSchemeCodes();
  }, []);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/performance-heatmap/${selectedScheme}`);
        setHeatmapData(response.data);
      } catch (err) {
        console.error("Error fetching heatmap data:", err);
        setError("Failed to fetch heatmap data. Please try again.");
        setHeatmapData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmapData();
  }, [selectedScheme]);

  const plotData = heatmapData.length > 0 ? [{
    x: heatmapData.map((d) => d.month),
    y: heatmapData.map((d) => d.dayChange),
    z: heatmapData.map((d) => d.dayChange),
    type: "heatmap",
    colorscale: "Viridis",
  }] : [];

  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col`}>
      <h2 className={styles.heading2}>Performance Heatmap</h2>
      <select
        value={selectedScheme}
        onChange={(e) => setSelectedScheme(e.target.value)}
        className="p-2 rounded bg-dimBlue text-white mb-4"
      >
        {schemeOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      {loading ? (
        <p className={styles.paragraph}>Loading...</p>
      ) : error ? (
        <p className={styles.paragraph}>{error}</p>
      ) : heatmapData.length > 0 ? (
        <Plotly
          data={plotData}
          layout={{
            title: "Performance Heatmap",
            xaxis: { title: "Month" },
            yaxis: { title: "Day Change" },
          }}
        />
      ) : (
        <p className={styles.paragraph}>No heatmap data available</p>
      )}
    </section>
  );
};

export default PerformanceHeatmap;