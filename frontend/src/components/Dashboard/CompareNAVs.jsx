import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import styles from "../../style";

const CompareNAVs = () => {
  const [selectedSchemes, setSelectedSchemes] = useState([]);
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
      if (selectedSchemes.length === 0) {
        setNavData([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const schemeCodes = selectedSchemes.join(",");
        const response = await axios.get(`http://localhost:8000/api/compare-navs?scheme_codes=${schemeCodes}`);
        setNavData(response.data);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError("Failed to fetch comparison data. Please try again.");
        setNavData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNavData();
  }, [selectedSchemes]);

  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col`}>
      <h2 className={styles.heading2}>Compare NAVs</h2>
      <select
        multiple
        value={selectedSchemes}
        onChange={(e) => setSelectedSchemes([...e.target.selectedOptions].map((o) => o.value))}
        className="p-2 rounded bg-dimBlue text-white mb-4 h-24"
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
      ) : selectedSchemes.length > 0 && navData.length > 0 ? (
        <LineChart width={600} height={300} data={navData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedSchemes.map((code) => (
            <Line
              key={code}
              type="monotone"
              dataKey={schemeOptions.find((opt) => opt.code === code)?.name || code}
              stroke="#00f6ff"
            />
          ))}
        </LineChart>
      ) : (
        <p className={styles.paragraph}>Select at least one scheme to compare</p>
      )}
    </section>
  );
};

export default CompareNAVs;