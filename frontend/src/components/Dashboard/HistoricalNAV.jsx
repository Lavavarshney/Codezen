import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import styles from "../../style";

const HistoricalNAV = () => {
  const [selectedScheme, setSelectedScheme] = useState("120164");
  const [navData, setNavData] = useState([]);
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
    const fetchNavData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/historical-nav/${selectedScheme}`);
        setNavData(response.data);
      } catch (err) {
        console.error("Error fetching NAV data:", err);
        setError("Failed to fetch NAV data. Please try again.");
        setNavData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNavData();
  }, [selectedScheme]);

  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col`}>
      <h2 className={styles.heading2}>Historical NAV</h2>
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
      ) : navData.length > 0 ? (
        <LineChart width={600} height={300} data={navData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="nav" stroke="#00f6ff" />
        </LineChart>
      ) : (
        <p className={styles.paragraph}>No NAV data available</p>
      )}
    </section>
  );
};

export default HistoricalNAV;