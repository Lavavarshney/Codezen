// frontend/src/components/Dashboard/MutualFundDashboard.jsx
import { Routes, Route, Link } from "react-router-dom";
import styles from "../../style";
import {
  AvailableSchemes,
  SchemeDetails,
  HistoricalNAV,
  CompareNAVs,
  AverageAUM,
  PerformanceHeatmap,
  RiskVolatility,
} from "./index";

const MutualFundDashboard = () => (
  <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-black-gradient p-4 rounded-lg mr-4 flex-shrink-0 min-w-[200px]">
        <h3 className="text-white font-poppins font-semibold text-[20px] mb-4">
          Mutual Fund Options
        </h3>
        <ul className="text-dimWhite">
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds" className="hover:text-secondary transition-colors">
              View Available Schemes
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds/scheme-details" className="hover:text-secondary transition-colors">
              Scheme Details
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds/historical-nav" className="hover:text-secondary transition-colors">
              Historical NAV
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds/compare-navs" className="hover:text-secondary transition-colors">
              Compare NAVs
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds/average-aum" className="hover:text-secondary transition-colors">
              Average AUM
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds/performance-heatmap" className="hover:text-secondary transition-colors">
              Performance Heatmap
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard/mutual-funds/risk-volatility" className="hover:text-secondary transition-colors">
              Risk and Volatility Analysis
            </Link>
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <div className={`${styles.boxWidth} flex-grow max-w-[calc(100%-200px)]`}>
        <Routes>
          <Route path="/" element={<AvailableSchemes />} />
          <Route path="/scheme-details" element={<SchemeDetails />} />
          <Route path="/historical-nav" element={<HistoricalNAV />} />
          <Route path="/compare-navs" element={<CompareNAVs />} />
          <Route path="/average-aum" element={<AverageAUM />} />
          <Route path="/performance-heatmap" element={<PerformanceHeatmap />} />
          <Route path="/risk-volatility" element={<RiskVolatility />} />
        </Routes>
      </div>
    </div>
  </div>
);

export default MutualFundDashboard;