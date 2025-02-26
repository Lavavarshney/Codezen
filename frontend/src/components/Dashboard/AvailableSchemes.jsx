import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../style";

const AvailableSchemes = () => {
  const [amc, setAmc] = useState("ICICI");
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/schemes?amc=${amc}`);
        const schemesArray = Object.entries(response.data).map(([code, name]) => ({
          code,
          name,
        }));
        setSchemes(schemesArray);
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setError("Failed to fetch schemes. Please try again.");
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [amc]);

  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col`}>
      <h2 className={styles.heading2}>View Available Schemes</h2>
      <input
        type="text"
        value={amc}
        onChange={(e) => setAmc(e.target.value)}
        className="p-2 rounded bg-dimBlue text-white mb-4"
        placeholder="Enter AMC Name"
      />
      {loading ? (
        <p className={styles.paragraph}>Loading...</p>
      ) : error ? (
        <p className={styles.paragraph}>{error}</p>
      ) : schemes.length > 0 ? (
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="p-2">Scheme Code</th>
              <th className="p-2">Scheme Name</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((scheme) => (
              <tr key={scheme.code}>
                <td className="p-2">{scheme.code}</td>
                <td className="p-2">{scheme.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.paragraph}>No schemes found for the given AMC</p>
      )}
    </section>
  );
};

export default AvailableSchemes;