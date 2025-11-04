import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import BestDayTradingDeals from "./components/BestDayTradingDeals";
import StockAnalyzer from "./components/StockAnalyzer";
import StockDashboard from "./components/StockDashboard";
import StockDashboardCandlestick from "./components/StockDashboardCandlestick";
import StockDashboardSyncfusion from "./components/StockDashboardSyncfusion";
import StockDashboardRfc from "./components/StockDashboardRfc";
import StockDashboardTradingView from "./components/StockDashboardTradingView";
import CandlestickScreener from "./components/CandlestickScreener";
import CandleScreener2 from "./components/CandleScreener2";



import StockPatternChecker from './components/StockPatternChecker';
import PatternsChecker from './components/PatternsChecker';

import TradingScreenerWidget from './components/TradingScreenerWidget';
import SmaScreener from './components/SmaScreener';
import TrendingSymbols from './components/TrendingSymbols';
import SmallCapGainers from './components/SmallCapGainers';


const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarLinks = [
    { path: "/TradingScreenerWidget", label: "Trading Screener Widget" },
    { path: "/TrendingSymbols", label: "Day Gainers" },
  { path: "/SmallCapGainers", label: "Small Cap Gainers" },
    { path: "/PatternsChecker", label: "Patterns Checker" },    
    { path: "/SmaScreener", label: "Sma Screener" },
    { path: "/StockPatternChecker", label: "Stock Pattern Checker" },    
    { path: "/CandlestickScreener", label: "Candlestick Screener" },
    { path: "/CandleScreener2", label: "Screener 2" },
    
    
    
    
  ];

  return (
    <Router>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
          color: "white",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "1.25rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            ☰
          </button>
          <div>📈 Trading Intelligence Dashboard</div>
        </div>
      </header>

      {/* Layout Container */}
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 64px)",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.3s ease-in-out",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: sidebarOpen ? "240px" : "0",
            background: "#f3f4f6",
            borderRight: sidebarOpen ? "1px solid #e5e7eb" : "none",
            padding: sidebarOpen ? "1rem" : "0",
            overflowY: "auto",
            transition: "all 0.3s ease-in-out",
            boxShadow: sidebarOpen ? "2px 0 5px rgba(0,0,0,0.05)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          {sidebarOpen && (
            <>
              <h3 style={{ color: "#1f2937", marginBottom: "1rem", fontSize: "1rem" }}>
                🧭 Navigation
              </h3>
              <nav
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      color: "#1e3a8a",
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "background 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.background = "#e0e7ff";
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </aside>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            background: "#ffffff",
            padding: "1.5rem",
            overflowY: "auto",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          <Routes>
            <Route
              path="/CandlestickScreener"
              element={
                <CandlestickScreener backendUrl="https://trading-app-server-35kc.onrender.com/api/screen" />
              }
            />
            <Route path="/PatternsChecker" element={<PatternsChecker />} />            
            <Route path="/StockPatternChecker" element={<StockPatternChecker />} />            
            <Route path="/CandleScreener2" element={<CandleScreener2 />} />
            
              <Route path="/TradingScreenerWidget" element={<TradingScreenerWidget
        height={700}
        colorTheme="light"
         market="america"
      />} />
         <Route path="/SmaScreener" element={<SmaScreener />} />
<Route path="/TrendingSymbols" element={<TrendingSymbols />} />
<Route path="/SmallCapGainers" element={<SmallCapGainers />} />



          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
