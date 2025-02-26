import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../style";

const AverageAUM = () => {
  const [aumData, setAumData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAumData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:8000/api/average-aum");
        setAumData(response.data);
      } catch (err) {
        console.error("Error fetching AUM data:", err);
        setError("Failed to fetch AUM data. Please try again.");
        setAumData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAumData();
  }, []);

  return (
    <section className={`${styles.paddingY} ${styles.flexCenter} flex-col`}>
      <h2 className={styles.heading2}>Average AUM</h2>
      {loading ? (
        <p className={styles.paragraph}>Loading...</p>
      ) : error ? (
        <p className={styles.paragraph}>{error}</p>
      ) : aumData.length > 0 ? (
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="p-2">Fund Name</th>
              <th className="p-2">Total AUM</th>
            </tr>
          </thead>
          <tbody>
            {aumData.map((item, index) => (
              <tr key={index}>
                <td className="p-2">{item["Fund Name"]}</td>
                <td className="p-2">{item["Total AUM"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.paragraph}>No AUM data available</p>
      )}
    </section>
  );
};

export default AverageAUM;