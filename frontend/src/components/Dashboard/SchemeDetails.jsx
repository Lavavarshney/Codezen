import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../style";

const SchemeDetails = () => {
  const [selectedScheme, setSelectedScheme] = useState("120164"); // Default scheme code
  const [details, setDetails] = useState({});
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
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/scheme-details/${selectedScheme}`);
        setDetails(response.data);
      } catch (err) {
        console.error("Error fetching scheme details:", err);
        setError("Failed to fetch scheme details. Please try again.");
        setDetails({});
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedScheme]);

  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col`}>
      <h2 className={styles.heading2}>Scheme Details</h2>
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
      ) : Object.keys(details).length > 0 ? (
        <div className="text-white">
          {Object.entries(details).map(([key, value]) => (
            <p key={key}>
              {key.replace(/_/g, " ")}: {value}
            </p>
          ))}
        </div>
      ) : (
        <p className={styles.paragraph}>No details available</p>
      )}
    </section>
  );
};

export default SchemeDetails;