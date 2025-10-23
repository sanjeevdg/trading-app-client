import React from "react";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


import BestDayTradingDeals from "./components/BestDayTradingDeals";
import StockAnalyzer from "./components/StockAnalyzer";
import StockDashboard from './components/StockDashboard';
import StockDashboardCandlestick from './components/StockDashboardCandlestick';
//import StockDashboardSyncfusion from './components/StockDashboardSyncfusion';
import StockDashboardRfc from './components/StockDashboardRfc';
import StockDashboardTradingView from './components/StockDashboardTradingView';


//     <Link to="/StockDashboardSyncfusion">StockDashboardSyncfusion</Link>
//          <Route path="/StockDashboardSyncfusion" element={<StockDashboardSyncfusion />} />
const App: React.FC = () => {
  return (

<Router>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <Link to="/StockAnalyzer">StockAnalyzer</Link>
        <Link to="/BestDayTradingDeals">BestDayTradingDeals</Link>
        <Link to="/StockDashboard">StockDashboard</Link>
        <Link to="/StockDashboardCandlestick">StockDashboardCandlestick</Link>
        <Link to="/StockDashboardTradingView">StockDashboardTradingView</Link>   
        <Link to="/StockDashboardRfc">StockDashboardRfc</Link>
        
      </nav>

      <Routes>

        <Route path="/StockAnalyzer" element={<StockAnalyzer />} />
        <Route path="/BestDayTradingDeals" element={<BestDayTradingDeals />} />
        <Route path="/StockDashboard" element={<StockDashboard />} />
        <Route path="/StockDashboardCandlestick" element={<StockDashboardCandlestick />} />
        <Route path="/StockDashboardRfc" element={<StockDashboardRfc />} />
        <Route path="/StockDashboardTradingView" element={<StockDashboardTradingView />} />

      </Routes>
      </Router>
          );

};


export default App;
    
