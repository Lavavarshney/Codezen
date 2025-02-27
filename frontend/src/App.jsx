import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styles from "./style";
import { Navbar, Hero, Stats, Business, Billing, CardDeal, Testimonials, Clients, CTA, Footer } from "./components";
import Posts from "./components/CommunityForum"; // Adjust path if needed

const App = () => {
  // Home component to keep the original layout
  const Home = () => (
    <div className={`bg-primary ${styles.flexStart}`}>
      <div className={`${styles.boxWidth}`}>
        <Hero />
        <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
          <div className={`${styles.boxWidth}`}>
            <Stats />
            <Business />
            <Billing />
            <CardDeal />
            <Testimonials />
            <Clients />
            <CTA />
            <Posts/>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );

  // Placeholder components for other navLinks (optional)
  const Features = () => <div className="p-4">Features Page</div>;
  const Product = () => <div className="p-4">Product Page</div>;
  const ClientsPage = () => <div className="p-4">Clients Page</div>;

  return (
    <Router>
      <div className="bg-primary w-full overflow-hidden">
        {/* Navbar is always visible */}
        <div className={`${styles.paddingX} ${styles.flexCenter}`}>
          <div className={`${styles.boxWidth}`}>
            <Navbar />
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/product" element={<Product />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/communityforum" element={<Posts />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;