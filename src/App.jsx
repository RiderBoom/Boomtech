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
  Send,
  QrCode,
  Copy,
  ArrowRight,
  Activity,
  CreditCard
} from "lucide-react";

// ✅ 1. กำหนด Address ของ Smart Contract (USDT บน Mainnet)
const USDT_CONTRACT_ADDRESS = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"; 

const Web3WalletApp = () => {
  // --- State ---
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [usdtBalance, setUsdtBalance] = useState("0.00");
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Modals
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Send Form State
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH"); // "ETH" or "USDT"
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Local Transaction History (สำหรับ Demo/Session ปัจจุบัน)
  const [transactions, setTransactions] = useState([]);

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

  useEffect(() => {
    getMultiTokenPrices(); 
    const interval = setInterval(() => {
      getMultiTokenPrices();
    }, 30000);
    return () => clearInterval(interval);
  }, []); 

  useEffect(() => {
    checkAlerts();
  }, [tokenPrices, alerts]);

  // --- Blockchain Actions ---

  const getSmartContractBalance = async (userAddress) => {
    try {
      // balanceOf selector: 0x70a08231
      const functionSelector = "0x70a08231";
      const paddedAddress = userAddress.substring(2).padStart(64, "0");
      const data = functionSelector + paddedAddress;

      const balanceHex = await window.ethereum.request({
        method: "eth_call",
        params: [{
          to: USDT_CONTRACT_ADDRESS,
          data: data 
        }, "latest"]
      });

      // USDT Decimals = 6
      const tokenValue = parseInt(balanceHex, 16) / 1000000; 
      setUsdtBalance(tokenValue.toFixed(2));
    } catch (error) {
      console.error("Error reading smart contract:", error);
      if(!isDemoMode) setUsdtBalance("0.00");
    }
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
          console.warn("Error fetching balance", e);
        }

        setAddress(addr);
        setBalance(balanceEth);
        setIsConnected(true);
        getSmartContractBalance(addr);

      } catch (error) {
        console.error(error);
        alert("การเชื่อมต่อ MetaMask ล้มเหลว");
      }
    } else {
      alert("ไม่พบ MetaMask กรุณาติดตั้งก่อนใช้งาน");
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const connectDemoMode = () => {
    setIsDemoMode(true);
    setAddress("0x71C...9A23");
    setBalance("12.4502");
    setUsdtBalance("5430.50");
    setIsConnected(true);
    // เพิ่ม Transaction หลอกๆ
    setTransactions([
        { id: 1, type: "Receive", token: "ETH", amount: "2.5", to: "0x71C...9A23", time: "10:30 น." },
        { id: 2, type: "Send", token: "USDT", amount: "100.00", to: "0xAB3...1122", time: "เมื่อวาน" }
    ]);
  };

  const disconnect = () => {
    setAddress("");
    setBalance("0.0000");
    setUsdtBalance("0.00");
    setIsConnected(false);
    setIsDemoMode(false);
    setTransactions([]);
  };

  // ✅ ฟังก์ชันโอนเงิน (Send Transaction)
  const handleSendTransaction = async () => {
    if (!sendRecipient || !sendAmount) {
      alert("กรุณากรอกที่อยู่ผู้รับและจำนวนเงิน");
      return;
    }
    
    setIsSending(true);
    setTxHash(null);

    try {
      if (isDemoMode) {
        // จำลองการโอนในโหมด Demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newTx = {
            id: Date.now(),
            type: "Send",
            token: selectedToken,
            amount: sendAmount,
            to: sendRecipient.slice(0,6) + "...",
            time: "เมื่อสักครู่"
        };
        setTransactions([newTx, ...transactions]);
        
        // ตัดยอดเงินจำลอง
        if(selectedToken === "ETH") setBalance((prev) => (parseFloat(prev) - parseFloat(sendAmount)).toFixed(4));
        else setUsdtBalance((prev) => (parseFloat(prev) - parseFloat(sendAmount)).toFixed(2));

        alert("โอนเงินสำเร็จ (Demo Mode)");
        setShowSendModal(false);
      } else {
        // ของจริงผ่าน MetaMask
        let txParams = {};

        if (selectedToken === "ETH") {
            // โอน ETH
            // แปลง Amount เป็น Wei (Hex) -> 1 ETH = 10^18 Wei
            const amountWei = BigInt(parseFloat(sendAmount) * 1e18).toString(16);
            
            txParams = {
                from: address,
                to: sendRecipient,
                value: "0x" + amountWei,
                // gas: "0x5208", // 21000 gas limit (optional, let metamask estimate)
            };
        } else {
            // โอน USDT (ERC-20)
            // Function: transfer(address,uint256) -> Selector: 0xa9059cbb
            // USDT Decimals = 6
            const amountUnits = BigInt(parseFloat(sendAmount) * 1000000).toString(16);
            
            const functionSelector = "0xa9059cbb";
            const paddedAddress = sendRecipient.substring(2).padStart(64, "0");
            const paddedAmount = amountUnits.padStart(64, "0");
            const data = functionSelector + paddedAddress + paddedAmount;

            txParams = {
                from: address,
                to: USDT_CONTRACT_ADDRESS,
                data: data
            };
        }

        const tx = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [txParams],
        });

        setTxHash(tx);
        
        // บันทึกลง Local History
        const newTx = {
            id: Date.now(),
            type: "Send",
            token: selectedToken,
            amount: sendAmount,
            to: sendRecipient.slice(0,6) + "...",
            time: "เมื่อสักครู่",
            hash: tx
        };
        setTransactions([newTx, ...transactions]);

        alert(`ส่ง Transaction แล้ว! Hash: ${tx}`);
        setShowSendModal(false);
      }
    } catch (error) {
      console.error("Transaction Error:", error);
      alert("เกิดข้อผิดพลาดในการโอน: " + error.message);
    } finally {
      setIsSending(false);
      // Reset form
      setSendAmount("");
      setSendRecipient("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(isDemoMode ? "0x71C7656EC7ab88b098defB751B7401B5f6d89A23" : address);
    alert("คัดลอกที่อยู่แล้ว!");
  };

  // --- Data Fetching ---

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
      console.error("API Error:", error);
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
      if (currentPrice >= threshold && !triggered[token]) {
          newTriggered[token] = true;
          hasNewAlerts = true;
          triggerNotification(token, currentPrice, threshold);
      }
    });

    if (hasNewAlerts) {
      setTriggered(newTriggered);
    }
  };

  const triggerNotification = (token, price, threshold) => {
    if (notifPermission === "granted") {
      new Notification(`🚨 ${token.toUpperCase()} Price Alert`, {
        body: `${token.toUpperCase()} reached $${price} (Threshold: $${threshold})`,
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
    setAlerts(prev => ({ ...prev, [token]: parseFloat(value) || 0 }));
    setTriggered(prev => ({ ...prev, [token]: false }));
  };

  const exportAlertHistory = () => {
    if (alertHistory.length === 0) { alert("ไม่มีข้อมูล"); return; }
    const headers = ["Token", "Price", "Threshold", "Time"];
    const rows = alertHistory.map(a => `${a.token},${a.price},${a.threshold},${a.time}`);
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "alert_history.csv";
    link.click();
  };

  const importAlertHistory = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split("\n").slice(1); 
      const imported = lines.filter(l => l.trim()).map((l, i) => {
        const [token, price, threshold, time] = l.split(",");
        return { id: Date.now() + i, token, price, threshold, time };
      });
      setAlertHistory(prev => [...imported, ...prev]);
    };
    reader.readAsText(file);
  };

  // --- Components ---

  const Sparkline = ({ isPositive }) => {
    const color = isPositive ? "#10B981" : "#EF4444";
    const points = Array.from({ length: 10 }, (_, i) => `${i * 10},${30 - Math.random() * 20}`).join(" ");
    return (
      <svg width="100" height="40" viewBox="0 0 90 40" className="opacity-50">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <p className="text-2xl font-mono text-indigo-500 font-semibold">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
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
          <label className={`text-xs font-semibold uppercase tracking-wider mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>แจ้งเตือนเมื่อราคาเกิน ($)</label>
          <div className="flex items-center gap-2">
            <input type="number" value={threshold} onChange={(e) => onChange(symbol, e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono ${darkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
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
            <h1 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Web3 Wallet</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {!isConnected ? (
              <>
                <button onClick={connectToMetaMask} className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'}`}><Wallet size={18} /> เชื่อมต่อกระเป๋า</button>
                <button onClick={connectDemoMode} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition">Demo Mode</button>
              </>
            ) : (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <div className="flex flex-col items-end">
                   <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{isDemoMode ? "Demo Net" : "Mainnet"}</span>
                   <span className={`text-sm font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-800'}`}>{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
                <button onClick={disconnect} className="ml-2 p-1 rounded-full text-slate-400 hover:text-red-500 transition"><XCircle size={18} /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Wallet Dashboard Section (เมื่อเชื่อมต่อแล้ว) */}
        {isConnected && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Portfolio Card */}
                <div className={`col-span-2 p-6 rounded-2xl border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-700' : 'bg-gradient-to-br from-indigo-600 to-blue-500 border-indigo-100 text-white'}`}>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={120} /></div>
                    
                    <div className="relative z-10">
                        <p className={`text-sm font-medium opacity-80 ${darkMode ? 'text-indigo-200' : 'text-indigo-100'}`}>มูลค่าพอร์ตโดยรวม (ประมาณ)</p>
                        <div className="flex items-end gap-2 mt-1 mb-6">
                            <h2 className="text-4xl font-bold font-mono text-white">
                                ${((parseFloat(balance) * tokenPrices.ethereum.usd) + parseFloat(usdtBalance)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <span className="text-sm mb-2 opacity-80">USD</span>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-black/20 p-3 rounded-xl min-w-[120px]">
                                <p className="text-xs opacity-70 mb-1">ETH Balance</p>
                                <p className="font-mono text-lg font-bold">{balance}</p>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl min-w-[120px]">
                                <p className="text-xs opacity-70 mb-1">USDT Balance</p>
                                <p className="font-mono text-lg font-bold">{usdtBalance}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setShowSendModal(true)}
                                className="flex-1 bg-white text-indigo-600 py-2.5 px-4 rounded-xl font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Send size={18} /> โอนเงิน
                            </button>
                            <button 
                                onClick={() => setShowReceiveModal(true)}
                                className="flex-1 bg-indigo-500/30 text-white border border-white/30 py-2.5 px-4 rounded-xl font-bold hover:bg-white/20 transition flex items-center justify-center gap-2"
                            >
                                <QrCode size={18} /> รับเงิน
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Transaction History (Simple) */}
                <div className={`rounded-2xl border p-5 overflow-hidden flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <Activity size={18} className="text-indigo-500" /> กิจกรรมล่าสุด
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px]">
                        {transactions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                                <History size={32} className="mb-2 opacity-50" />
                                ยังไม่มีธุรกรรมใหม่
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'Send' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {tx.type === 'Send' ? <ArrowRight size={14} /> : <CheckCircle size={14} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{tx.type}</p>
                                            <p className="text-xs text-slate-500">{tx.token} • {tx.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-mono font-bold ${tx.type === 'Send' ? 'text-red-500' : 'text-green-500'}`}>
                                            {tx.type === 'Send' ? '-' : '+'}{tx.amount}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Send Modal */}
        {showSendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2"><Send size={20} className="text-indigo-500" /> โอนเหรียญ (Send)</h3>
                        <button onClick={() => setShowSendModal(false)}><XCircle size={24} className="text-slate-400 hover:text-red-500" /></button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">เลือกเหรียญ</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setSelectedToken("ETH")}
                                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${selectedToken === "ETH" ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : (darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50')}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> ETH
                                </button>
                                <button 
                                    onClick={() => setSelectedToken("USDT")}
                                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${selectedToken === "USDT" ? 'border-green-500 bg-green-50 text-green-600' : (darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50')}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> USDT
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">ที่อยู่ผู้รับ (Recipient Address)</label>
                            <input 
                                type="text" 
                                placeholder="0x..." 
                                value={sendRecipient}
                                onChange={(e) => setSendRecipient(e.target.value)}
                                className={`w-full p-3 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">จำนวนเงิน ({selectedToken})</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    className={`w-full p-3 rounded-xl border font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                />
                                <button 
                                    onClick={() => setSendAmount(selectedToken === "ETH" ? (parseFloat(balance) - 0.001).toString() : usdtBalance)}
                                    className="absolute right-2 top-2 px-2 py-1 bg-indigo-100 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-200"
                                >
                                    MAX
                                </button>
                            </div>
                            <p className="text-xs text-right mt-1 opacity-60">
                                ยอดที่มี: {selectedToken === "ETH" ? balance : usdtBalance} {selectedToken}
                            </p>
                        </div>

                        <button 
                            onClick={handleSendTransaction}
                            disabled={isSending}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mt-2 transition ${isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {isSending ? (
                                <>กำลังทำรายการ...</>
                            ) : (
                                <><Send size={18} /> ยืนยันการโอน</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Receive Modal */}
        {showReceiveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl text-center ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mx-auto"><QrCode size={20} className="text-indigo-500" /> รับเงิน (Receive)</h3>
                        <button onClick={() => setShowReceiveModal(false)} className="absolute right-6"><XCircle size={24} className="text-slate-400 hover:text-red-500" /></button>
                    </div>

                    <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
                         {/* QR Code Placeholder (ใช้ API หรือ Library จริงได้) */}
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${address}`} 
                            alt="Wallet QR" 
                            className="w-48 h-48 opacity-90"
                         />
                    </div>
                    
                    <p className="text-sm opacity-70 mb-2">ที่อยู่กระเป๋าเงินของคุณ (ETH & ERC-20)</p>
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 mb-4 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-mono text-xs truncate text-left flex-1 opacity-80">{address}</span>
                        <button onClick={copyToClipboard} className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition"><Copy size={16} /></button>
                    </div>

                    <p className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        ⚠️ โปรดตรวจสอบเครือข่ายให้ถูกต้อง (Ethereum Mainnet) ก่อนทำการโอนเหรียญเข้ามา
                    </p>
                </div>
            </div>
        )}

        {/* Dashboard Grid (เดิม) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <TrendingUp size={24} className="text-indigo-500" /> ตลาดคริปโต
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
            <TokenCard symbol="ethereum" name="Ethereum" priceData={tokenPrices.ethereum} threshold={alerts.ethereum} onChange={handleAlertChange} />
            <TokenCard symbol="bitcoin" name="Bitcoin" priceData={tokenPrices.bitcoin} threshold={alerts.bitcoin} onChange={handleAlertChange} />
            <TokenCard symbol="dai" name="Dai" priceData={tokenPrices.dai} threshold={alerts.dai} onChange={handleAlertChange} />
            <TokenCard symbol="solana" name="Solana" priceData={tokenPrices.solana} threshold={alerts.solana} onChange={handleAlertChange} />
            <TokenCard symbol="binancecoin" name="BNB" priceData={tokenPrices.binancecoin} threshold={alerts.binancecoin} onChange={handleAlertChange} />
            <TokenCard symbol="dogecoin" name="Dogecoin" priceData={tokenPrices.dogecoin} threshold={alerts.dogecoin} onChange={handleAlertChange} />
          </div>
        </section>

        {/* Alert History Section */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <History className="text-indigo-500" /> ประวัติการแจ้งเตือน
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={exportAlertHistory} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Download size={16} /> ส่งออก CSV</button>
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
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>ราคา</th>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>เกณฑ์</th>
                  <th className={`px-6 py-4 font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>สถานะ</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {alertHistory.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center opacity-50 italic">ยังไม่มีการแจ้งเตือน</td></tr>
                ) : (
                  alertHistory.map((alert, idx) => (
                    <tr key={idx} className={`transition ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{alert.time}</td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{alert.token}</td>
                      <td className="px-6 py-4 font-mono text-indigo-500">${alert.price}</td>
                      <td className="px-6 py-4 font-mono opacity-60">${alert.threshold}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} /> แจ้งเตือนแล้ว</span></td>
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
