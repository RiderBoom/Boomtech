import React, { useState, useEffect } from "react";
// Removed external ethers import to fix build error
import { 
  Wallet, 
  Bell, 
  Download, 
  Upload, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  History,
  CheckCircle,
  XCircle,
  Moon,
  Sun,
  DollarSign,
  Coins // เพิ่มไอคอนเหรียญ
} from "lucide-react";

// ✅ ส่วนที่ 1: กำหนด Address ของ Smart Contract ที่ต้องการเชื่อมต่อ
// ตัวอย่าง: USDT Smart Contract บน Ethereum Mainnet
const USDT_CONTRACT_ADDRESS = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"; 

const Web3WalletApp = () => {
  // --- State ---
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [usdtBalance, setUsdtBalance] = useState("0.00"); // ✅ State สำหรับเก็บค่าจาก Contract
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Market Data
  const [tokenPrices, setTokenPrices] = useState({
    ethereum: { usd: 0, change: 0 },
    bitcoin: { usd: 0, change: 0 },
    dai: { usd: 0, change: 0 },
    solana: { usd: 0, change: 0 },
    binancecoin: { usd: 0, change: 0 },
    dogecoin: { usd: 0, change: 0 },
  });
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Alerts
  const [alerts, setAlerts] = useState({
    ethereum: 3500,
    bitcoin: 65000,
    dai: 1.05,
    solana: 150,
    binancecoin: 600,
    dogecoin: 0.20
  });
  const [triggered, setTriggered] = useState({});
  const [alertHistory, setAlertHistory] = useState([]);
  
  // Notification Permission
  const [notifPermission, setNotifPermission] = useState("default");

  // --- Effects ---

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Auto-check prices every 30s
  useEffect(() => {
    getMultiTokenPrices(); // Initial fetch
    const interval = setInterval(() => {
      getMultiTokenPrices();
    }, 30000);
    return () => clearInterval(interval);
  }, []); 

  useEffect(() => {
    checkAlerts();
  }, [tokenPrices, alerts]);

  // --- Actions ---

  // ✅ ส่วนที่ 2: ฟังก์ชันอ่านค่าจาก Smart Contract (ไม่ต้องใช้ ABI เต็มๆ ถ้าอ่านค่าง่ายๆ)
  const getSmartContractBalance = async (userAddress) => {
    try {
      // 1. สร้าง Data สำหรับเรียกฟังก์ชัน balanceOf(address)
      // Function Selector ของ balanceOf คือ '0x70a08231'
      const functionSelector = "0x70a08231";
      // แปลง Address เป็น 64 ตัวอักษร (Padding)
      const paddedAddress = userAddress.substring(2).padStart(64, "0");
      const data = functionSelector + paddedAddress;

      // 2. ส่งคำสั่ง eth_call ไปยัง Blockchain
      const balanceHex = await window.ethereum.request({
        method: "eth_call",
        params: [{
          to: USDT_CONTRACT_ADDRESS, // ส่งไปที่ Smart Contract Address
          data: data // ข้อมูลที่เข้ารหัสแล้ว
        }, "latest"]
      });

      // 3. แปลงผลลัพธ์ (Hex -> Decimal)
      // USDT มีทศนิยม 6 ตำแหน่ง (Decimals = 6)
      const tokenValue = parseInt(balanceHex, 16) / 1000000; 
      
      setUsdtBalance(tokenValue.toFixed(2));
      console.log("USDT Balance:", tokenValue);

    } catch (error) {
      console.error("Error reading smart contract:", error);
      setUsdtBalance("Error");
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนบนเดสก์ท็อป");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const connectToMetaMask = async () => {
    setIsDemoMode(false);
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const addr = accounts[0];

        let balanceEth = "0.0000";
        try {
           const balanceHex = await window.ethereum.request({
             method: "eth_getBalance",
             params: [addr, "latest"],
           });
           balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
        } catch (e) {
          console.warn("เกิดข้อผิดพลาดในการดึงยอดเงิน", e);
        }

        setAddress(addr);
        setBalance(balanceEth);
        setIsConnected(true);

        // ✅ ส่วนที่ 3: เรียกฟังก์ชัน Smart Contract หลังจากเชื่อมต่อกระเป๋าสำเร็จ
        // หมายเหตุ: จะทำงานได้ถูกต้องเมื่อ User อยู่บน Ethereum Mainnet เท่านั้น
        getSmartContractBalance(addr);

      } catch (error) {
        console.error(error);
        alert("การเชื่อมต่อ MetaMask ล้มเหลวหรือถูกปฏิเสธ");
      }
    } else {
      alert("ไม่พบ MetaMask กรุณาติดตั้งก่อนใช้งาน");
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const connectDemoMode = () => {
    setIsDemoMode(true);
    setAddress("0x71C...9A23 (โหมดสาธิต)");
    setBalance("12.4502");
    setUsdtBalance("5430.50"); // Mock data for demo
    setIsConnected(true);
  };

  const disconnect = () => {
    setAddress("");
    setBalance("0.0000");
    setUsdtBalance("0.00");
    setIsConnected(false);
    setIsDemoMode(false);
  };

  const getMultiTokenPrices = async () => {
    setLoadingPrices(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,dai,solana,binancecoin,dogecoin&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await response.json();
      
      const mappedData = {};
      Object.keys(data).forEach(key => {
        mappedData[key] = {
          usd: data[key].usd,
          change: data[key].usd_24h_change
        };
      });

      setTokenPrices(mappedData);
      setLastUpdated(new Date().toLocaleTimeString('th-TH'));
    } catch (error) {
      console.error("ไม่สามารถดึงราคาได้:", error);
      if (isDemoMode) {
        setTokenPrices({
          ethereum: { usd: 3450 + Math.random() * 50, change: 2.5 },
          bitcoin: { usd: 64000 + Math.random() * 500, change: -1.2 },
          dai: { usd: 0.99 + Math.random() * 0.02, change: 0.01 },
          solana: { usd: 145 + Math.random() * 5, change: 5.4 },
          binancecoin: { usd: 590 + Math.random() * 10, change: 0.8 },
          dogecoin: { usd: 0.16 + Math.random() * 0.01, change: -3.5 },
        });
        setLastUpdated(new Date().toLocaleTimeString('th-TH'));
      }
    } finally {
      setLoadingPrices(false);
    }
  };

  const checkAlerts = () => {
    if (!tokenPrices.ethereum?.usd) return;

    const newTriggered = { ...triggered };
    let hasNewAlerts = false;

    Object.keys(alerts).forEach((token) => {
      const currentPrice = tokenPrices[token]?.usd;
      if (!currentPrice) return;

      const threshold = alerts[token];
      
      if (currentPrice >= threshold) {
        if (!triggered[token]) {
          newTriggered[token] = true;
          hasNewAlerts = true;
          triggerNotification(token, currentPrice, threshold);
        }
      } else {
        if (triggered[token]) {
           newTriggered[token] = false; 
        }
      }
    });

    if (hasNewAlerts) {
      setTriggered(newTriggered);
    }
  };

  const triggerNotification = (token, price, threshold) => {
    const title = `🚨 แจ้งเตือนราคา ${token.toUpperCase()}`;
    const body = `${token.toUpperCase()} แตะระดับราคา $${price} (เกณฑ์ที่ตั้งไว้: $${threshold})`;

    if (notifPermission === "granted") {
      new Notification(title, {
        body,
        icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      });
    }

    setAlertHistory((prev) => [
      {
        id: Date.now(),
        token,
        price,
        threshold,
        time: new Date().toLocaleString('th-TH'),
      },
      ...prev,
    ]);
  };

  const handleAlertChange = (token, value) => {
    setAlerts(prev => ({
      ...prev,
      [token]: parseFloat(value) || 0
    }));
    setTriggered(prev => ({ ...prev, [token]: false }));
  };

  const exportAlertHistory = () => {
    if (alertHistory.length === 0) {
      alert("ไม่มีประวัติการแจ้งเตือนให้ส่งออก");
      return;
    }
    const headers = ["เหรียญ", "ราคา", "เกณฑ์ที่ตั้งไว้", "เวลา"];
    const rows = alertHistory.map(
      (alert) => `${alert.token},${alert.price},${alert.threshold},${alert.time}`
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "alert_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importAlertHistory = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").slice(1); 
        const importedAlerts = lines
          .filter((line) => line.trim() !== "")
          .map((line, index) => {
            const [token, price, threshold, time] = line.split(",");
            return { id: Date.now() + index, token, price, threshold, time };
          });
        setAlertHistory(prev => [...importedAlerts, ...prev]);
        alert("นำเข้าประวัติการแจ้งเตือนสำเร็จ!");
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ CSV");
      }
    };
    reader.readAsText(file);
  };

  // --- Components ---

  const Sparkline = ({ isPositive }) => {
    const color = isPositive ? "#10B981" : "#EF4444";
    const points = Array.from({ length: 10 }, (_, i) => {
      return `${i * 10},${30 - Math.random() * 20}`;
    }).join(" ");

    return (
      <svg width="100" height="40" viewBox="0 0 90 40" className="opacity-50">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const TokenCard = ({ symbol, name, priceData, threshold, onChange }) => {
    const price = priceData?.usd || 0;
    const change = priceData?.change || 0;
    const isPositive = change >= 0;

    return (
      <div className={`p-6 rounded-xl shadow-sm border flex flex-col gap-4 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {name} <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{symbol}</span>
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-2xl font-mono text-indigo-500 font-semibold">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`p-2 rounded-full ${triggered[symbol] ? 'bg-red-100 text-red-600 animate-pulse' : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-green-50 text-green-600')}`}>
              {triggered[symbol] ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
            </div>
            <Sparkline isPositive={isPositive} />
          </div>
        </div>
        
        <div className={`pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
          <label className={`text-xs font-semibold uppercase tracking-wider mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
            เกณฑ์แจ้งเตือนราคา ($)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={threshold}
              onChange={(e) => onChange(symbol, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
            />
            <Bell size={16} className={triggered[symbol] ? "text-red-500" : "text-slate-300"} />
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className={`border-b sticky top-0 z-10 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wallet className="text-white" size={24} />
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Web3 Wallet App</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!isConnected ? (
              <>
                <button 
                  onClick={connectToMetaMask}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  <Wallet size={18} /> เชื่อมต่อกระเป๋าเงิน
                </button>
                <button 
                  onClick={connectDemoMode}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition"
                >
                  ลองใช้โหมดสาธิต
                </button>
              </>
            ) : (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <div className="flex flex-col items-end">
                   <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                     {isDemoMode ? "เครือข่ายสาธิต" : "Ethereum Mainnet"}
                   </span>
                   <span className={`text-sm font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                     {address.slice(0, 6)}...{address.slice(-4)}
                   </span>
                </div>
                <div className={`h-8 w-[1px] mx-1 ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                <div className="text-right">
                  <span className={`block text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>ยอดเงิน ETH</span>
                  <span className="block font-mono font-bold text-indigo-500">{balance}</span>
                </div>
                <div className={`h-8 w-[1px] mx-1 ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                 {/* ✅ แสดงยอดเงิน Token จาก Smart Contract */}
                <div className="text-right">
                  <span className={`block text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>USDT (Contract)</span>
                  <span className="block font-mono font-bold text-green-500">{usdtBalance}</span>
                </div>

                <button onClick={disconnect} className="ml-2 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-opacity-10 hover:bg-red-500 transition">
                  <XCircle size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Permission Banner */}
        {notifPermission === "default" && (
          <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="animate-bounce" />
              <div>
                <p className="font-bold">เปิดใช้งานการแจ้งเตือนราคา</p>
                <p className="text-indigo-100 text-sm">รับการแจ้งเตือนทันทีเมื่อเหรียญของคุณถึงราคาเป้าหมาย</p>
              </div>
            </div>
            <button 
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-50 transition"
            >
              อนุญาตการแจ้งเตือน
            </button>
          </div>
        )}

        {/* Portfolio Value Summary */}
        {isConnected && tokenPrices.ethereum.usd > 0 && (
          <section className={`p-6 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-r from-indigo-50 to-white border-indigo-100'}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-slate-400' : 'text-indigo-500'}`}>
              มูลค่าพอร์ตโดยรวม (Estimates)
            </h2>
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-500" size={32} />
              <span className={`text-4xl font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {/* คำนวณมูลค่ารวมทั้ง ETH และ USDT (สมมติ 1 USDT = $1) */}
                {((parseFloat(balance) * tokenPrices.ethereum.usd) + parseFloat(usdtBalance)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium mt-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                USD
              </span>
            </div>
            <p className={`text-sm mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              คำนวณจาก (ETH x ราคาตลาด) + (USDT ที่อ่านจาก Contract)
            </p>
          </section>
        )}

        {/* Dashboard Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <TrendingUp size={24} className="text-indigo-500" /> กระดานข้อมูลตลาด
            </h2>
            <div className="flex items-center gap-4">
              {lastUpdated && <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>อัปเดตล่าสุด: {lastUpdated}</span>}
              <button 
                onClick={getMultiTokenPrices}
                disabled={loadingPrices}
                className={`p-2 rounded-full border transition ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'} ${loadingPrices ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TokenCard 
              symbol="ethereum" 
              name="Ethereum" 
              priceData={tokenPrices.ethereum} 
              threshold={alerts.ethereum} 
              onChange={handleAlertChange}
            />
            <TokenCard 
              symbol="bitcoin" 
              name="Bitcoin" 
              priceData={tokenPrices.bitcoin} 
              threshold={alerts.bitcoin} 
              onChange={handleAlertChange}
            />
            <TokenCard 
              symbol="dai" 
              name="Dai" 
              priceData={tokenPrices.dai} 
              threshold={alerts.dai} 
              onChange={handleAlertChange}
            />
            {/* New Tokens */}
            <TokenCard 
              symbol="solana" 
              name="Solana" 
              priceData={tokenPrices.solana} 
              threshold={alerts.solana} 
              onChange={handleAlertChange}
            />
            <TokenCard 
              symbol="binancecoin" 
              name="BNB" 
              priceData={tokenPrices.binancecoin} 
              threshold={alerts.binancecoin} 
              onChange={handleAlertChange}
            />
            <TokenCard 
              symbol="dogecoin" 
              name="Dogecoin" 
              priceData={tokenPrices.dogecoin} 
              threshold={alerts.dogecoin} 
              onChange={handleAlertChange}
            />
          </div>
        </section>

        {/* History Section */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <History className="text-indigo-500" /> ประวัติการแจ้งเตือน
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={exportAlertHistory}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Download size={16} /> ส่งออก CSV
              </button>
              <label className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition cursor-pointer ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Upload size={16} /> นำเข้า CSV
                <input type="file" accept=".csv" onChange={importAlertHistory} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <thead className={`border-b ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <tr>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>เวลา</th>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>เหรียญ</th>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>ราคาที่แจ้งเตือน</th>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>เกณฑ์ที่ตั้งไว้</th>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>สถานะ</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {alertHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                      ยังไม่มีการแจ้งเตือน ลองตั้งค่าเกณฑ์ให้ต่ำกว่าราคาปัจจุบันเพื่อทดสอบ
                    </td>
                  </tr>
                ) : (
                  alertHistory.map((alert, idx) => (
                    <tr key={idx} className={`transition ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{alert.time}</td>
                      <td className={`px-6 py-4 capitalize font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{alert.token}</td>
                      <td className="px-6 py-4 font-mono text-indigo-500">${alert.price}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">${alert.threshold}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> แจ้งเตือนแล้ว
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Web3WalletApp;
