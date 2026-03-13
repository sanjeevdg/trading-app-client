import React, { useState,useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

import AlpacaDashboard from './components/AlpacaDashboard';
import PriceRangeScreener from './components/PriceRangeScreener';

import StrategyRSI from './components/StrategyRSI';
import TQQQPatterns from './components/TQQQPatterns';

import PatternCandleChart from './components/PatternCandleChart';
import MultiPaneChartWeb2 from './components/MultiPaneChartWeb2';
import MatplotlibChart from './components/MatplotlibChart';

import TestTradingView from './components/TestTradingView';


import ScreenerTable from './components/ScreenerTable';
import TvStockScreener from './components/TvStockScreener';
import TradingScreenerWidget from './components/TradingScreenerWidget';
import CsvGrid2 from './components/CsvGrid2';
import WatchlistPage from './components/WatchlistPage';

import BacktestDashboard from './components/BacktestDashboard';
import StrongBuyGainersGrid from './components/StrongBuyGainersGrid';
import { useLocation } from "react-router-dom";



const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
//const [winLoc, setWinLoc ] = useState(window.location.pathname);

 useEffect(() => {
    if (location.pathname.includes("chart")) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [location.pathname]);


const sidebarLinks = [
  {
    label: "Screeners",
    children: [
      { path: "/ScreenerTable", label: "Preset Screeners" },
      { path: "/PriceRangeScreener", label: "Price Range Screener" },      
      { path: "/TvStockScreener", label: "TV Stock Screener" },
      { path: "/StrongBuyGainersGrid", label: "Strong Buy Gainers Grid" },
      
      { path: "/TradingScreenerWidget", label: "Trading Screener Widget" },
    ]
  },
  {
    label: "Csv Grid",
    children: [      
       { path: "/CsvGrid2", label: "Csv Grid 2" },  
    ]
  },
  {
    label: "Charts",
    children: [      
      { path: "/TestTradingView", label: "Test Trading View" },
    ]
  },
  {
    label: "Matplotlib Charts",
    children: [
      { path: "/MatplotlibChart", label: "Matplotlib Chart" },
      { path: "/StrategyRSI", label: "Preset Strategy RSI" },
      { path: "/TQQQPatterns", label: "TQQQ Patterns" },
    ]
  },
  {
    label: "Trading",
    children: [
      { path: "/BacktestDashboard", label: "Backtest Dashboard" },
      { path: "/WatchlistPage", label: "Watchlist Page" },
      { path: "/AlpacaDashboard", label: "Alpaca Dashboard" },
    ]
  }
];

  return (
    
      <>
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
                {sidebarLinks.map((section) => (
  <div key={section.label} style={{ marginBottom: "1rem" }}>
    
    {/* Section Title */}
    <div
      style={{
        fontWeight: 700,
        fontSize: "0.9rem",
        color: "#6b7280",
        marginBottom: "0.4rem",
        paddingLeft: "4px"
      }}
    >
      {section.label}
    </div>

    {/* Submenu Items */}
    {section.children.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        style={{
          display: "block",
          padding: "0.5rem 0.75rem",
          borderRadius: "8px",
          color: "#1e3a8a",
          textDecoration: "none",
          fontWeight: 500,
          marginLeft: "8px",
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

  </div>
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
              
    
    
    <Route path="/TradingScreenerWidget" element={<TradingScreenerWidget
        height={700}
        colorTheme="light"
         market="america"
      />} />
    
    <Route path="/AlpacaDashboard" element={<AlpacaDashboard />} />
    <Route path="/CsvGrid2" element={<CsvGrid2 />} />
    <Route path="/WatchlistPage" element={<WatchlistPage />} />
    <Route path="/BacktestDashboard" element={<BacktestDashboard />} />
    
    <Route path="/TQQQPatterns" element={<TQQQPatterns />} />
    <Route path="/MatplotlibChart" element={<MatplotlibChart />} />
    <Route path="/StrategyRSI" element={<StrategyRSI />} />
    <Route path="/TvStockScreener" element={<TvStockScreener />} />

    <Route path="/ScreenerTable" element={<ScreenerTable />} />
    <Route path="/PriceRangeScreener" element={<PriceRangeScreener />} />
    
    <Route path="/TestTradingView" element={<TestTradingView />} />
    <Route path="/PatternCandleChart/:symbol" element={<PatternCandleChart />} /> 

    <Route path="/MultiPaneChartWeb2/:symbol" element={<MultiPaneChartWeb2 />} />
    <Route path="/StrongBuyGainersGrid" element={<StrongBuyGainersGrid />} />




    </Routes>

        </main>
      </div>
    </>
  );
};

export default App;
