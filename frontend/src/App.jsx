// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import styles from "./style";
import {
  Navbar,
  Hero,
  Stats,
  Business,
  Billing,
  CardDeal,
  Testimonials,
  Clients,
  CTA,
  Footer,
} from "./components";
import {
  AvailableSchemes,
  SchemeDetails,
  HistoricalNAV,
  CompareNAVs,
  AverageAUM,
  PerformanceHeatmap,
  RiskVolatility,
} from "./components/Dashboard";

// Home Page Component
const Home = () => (
  <div className="bg-primary w-full overflow-hidden">
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        <Navbar />
      </div>
    </div>
    <div className={`bg-primary ${styles.flexStart}`}>
      <div className={`${styles.boxWidth}`}>
        <Hero />
      </div>
    </div>
    <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        <Stats />
        <Business />
        <Billing />
        <CardDeal />
        <Testimonials />
        <Clients />
        <CTA />
        <Footer />
      </div>
    </div>
  </div>
);

// Mutual Fund Dashboard Component with Sidebar
const MutualFundDashboard = () => (
  <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
    <div className="flex w-full">
      {/* Sidebar */}
      <div className="w-1/4 bg-black-gradient p-4 rounded-lg mr-4">
        <h3 className="text-white font-poppins font-semibold text-[20px] mb-4">
          Mutual Fund Options
        </h3>
        <ul className="text-dimWhite">
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds"
              className="hover:text-secondary transition-colors"
            >
              View Available Schemes
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds/scheme-details"
              className="hover:text-secondary transition-colors"
            >
              Scheme Details
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds/historical-nav"
              className="hover:text-secondary transition-colors"
            >
              Historical NAV
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds/compare-navs"
              className="hover:text-secondary transition-colors"
            >
              Compare NAVs
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds/average-aum"
              className="hover:text-secondary transition-colors"
            >
              Average AUM
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds/performance-heatmap"
              className="hover:text-secondary transition-colors"
            >
              Performance Heatmap
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/dashboard/mutual-funds/risk-volatility"
              className="hover:text-secondary transition-colors"
            >
              Risk and Volatility Analysis
            </Link>
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <div className={`${styles.boxWidth}`}>
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

// Main Dashboard Component (Wrapper for Stocks and Mutual Funds)
const Dashboard = () => (
  <div className="bg-primary w-full overflow-hidden">
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        <Navbar />
      </div>
    </div>
    <Routes>
      <Route path="/stocks" element={<div className={`${styles.paddingY} ${styles.flexCenter} text-white`}>Stock Market Dashboard (To Be Developed)</div>} />
      <Route path="/mutual-funds/*" element={<MutualFundDashboard />} />
    </Routes>
  </div>
);

// App Component with Routing
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  </Router>
);

export default App;