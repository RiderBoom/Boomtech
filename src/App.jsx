import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, ArrowRightLeft, Heart, Settings, Shield, RefreshCw, Copy, Check, 
  AlertTriangle, Users, QrCode, TrendingUp, Search, Coins, LineChart, 
  BarChart2, Globe, Activity, DollarSign, BarChart4, Gauge, LogOut, 
  Newspaper, Clock, ExternalLink, MessageSquare, Send, Image as ImageIcon, X,
  ShoppingBag, ShoppingCart, CreditCard, Package, Plus, Minus, Trash2, Smartphone,
  Bot, Sparkles, Zap, MessageCircle, History, Bell, Box, Edit2, Save, Lock,
  MapPin as MapPinIcon, Flame, UploadCloud, FileText, LayoutDashboard, Truck, CheckCircle, Filter, ChevronRight,
  Store, ArrowUpRight, ArrowDownLeft, Repeat, ScanLine, Briefcase, Youtube, PlayCircle, Landmark, Banknote, ArrowDown,
  Layers, ArrowRight, Pin, XCircle, CheckSquare, UserCheck, Clock4 
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth'; 
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const App = () => {
  // --- Configuration ---
  const DEFAULT_CONTRACT_ADDRESS = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; 
  const SHOP_WALLET_ADDRESS = "0xCEEcd5Fe0034F397B5A66a7BcD754B5B08a6cd70"; 
  const PROMPTPAY_ID = "0950524447"; 
  const USD_THB_RATE = 34.5; 

  const ADMIN_WALLETS = [
      "0xCEEcd5Fe0034F397B5A66a7BcD754B5B08a6cd70", 
      "0xCEEcd5Fe0034F397B5A66a7BcD754B5B08a6cd70", 
  ];

  // --- Firebase Setup ---
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [db, setDb] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbError, setDbError] = useState(null); 
   
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [transactions, setTransactions] = useState([]);
   
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
   
  // --- State ---
  const [ethersLib, setEthersLib] = useState(null); 
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0000"); 
  const [tokenBalance, setTokenBalance] = useState("0.00");
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [activeTab, setActiveTab] = useState("wallet"); 

  // Wallet Tab State
  const [walletMode, setWalletMode] = useState("dashboard"); 

  // Form Data
  const [transferType, setTransferType] = useState("ETH");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [donateType, setDonateType] = useState("ETH");
  const [donateTokenAddress, setDonateTokenAddress] = useState("");

  // Swap State
  const [swapFrom, setSwapFrom] = useState("ETH");
  const [swapTo, setSwapTo] = useState("USDT");
  const [swapAmount, setSwapAmount] = useState("");

  // Bridge State
  const [bridgeFrom, setBridgeFrom] = useState("Ethereum");
  const [bridgeTo, setBridgeTo] = useState("Bitkub Chain");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [bridgeToken, setBridgeToken] = useState("USDT");
   
  // Shop State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("PROMPTPAY"); 
  const [usdtAddress, setUsdtAddress] = useState(""); 
  const [isSellerMode, setIsSellerMode] = useState(false); 
  const [shopOrders, setShopOrders] = useState([]); 

  // ✅ Merchant/Shop Registration State (ปรับปรุง)
  // merchantStatus: 'none' | 'pending' | 'approved' | 'rejected'
  const [merchantStatus, setMerchantStatus] = useState("none"); 
  const [isMerchant, setIsMerchant] = useState(false); // True only if status is 'approved'
  const [shopRegisterForm, setShopRegisterForm] = useState({ shopName: "", shopDesc: "", contact: "" });
  const [merchantRequests, setMerchantRequests] = useState([]);

  // Admin Internal State
  const [adminSubTab, setAdminSubTab] = useState("dashboard"); 
  const [filterStatus, setFilterStatus] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  
  // Rejection State
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // New Product State
  const [newProduct, setNewProduct] = useState({ name: "", priceTHB: "", category: "Merch", image: "", affiliateLink: "", stock: "10" });
  const [editingProductId, setEditingProductId] = useState(null);
  const [shopCategories, setShopCategories] = useState(["All", "Trader's Sanctuary", "Desk Setup", "Future Living", "Crypto Secure"]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
   
  const [shippingAddress, setShippingAddress] = useState("");
  const [slipImage, setSlipImage] = useState(null); 
  const slipInputRef = useRef(null); 

  // AI Chatbot State
  const [isAiChatOpen, setIsAiChatOpen] = useState(false); 
  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: 'bot', text: 'สวัสดีครับ! ผมคือ BoomBot AI (Powered by Gemini) 🤖 ผู้ช่วยอัจฉริยะของคุณ ถามเรื่องราคาเหรียญ วิเคราะห์กราฟ หรือความรู้ Crypto ได้เลยครับ!' }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const aiChatEndRef = useRef(null);

  // Status & UI
  const [isLoading, setIsLoading] = useState(false);
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [isOwner, setIsOwner] = useState(false); 
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Market Data
  const [selectedCoin, setSelectedCoin] = useState("ethereum"); 
  const [coinSymbol, setCoinSymbol] = useState("ETH"); 
  const [isCustomSymbol, setIsCustomSymbol] = useState(false);
  const [coinInput, setCoinInput] = useState("");
  const [coinImage, setCoinImage] = useState("https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880");
  const [currentPrice, setCurrentPrice] = useState(3000); 
  const [priceChange, setPriceChange] = useState(0);
  const [marketStats, setMarketStats] = useState({ marketCap: 0, totalVolume: 0, high24h: 0, low24h: 0, ath: 0 });
  const [fearGreed, setFearGreed] = useState({ value: 0, status: "Neutral" });

  // News Data
  const [newsData, setNewsData] = useState([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // Admin
  const [newFee, setNewFee] = useState("");
  const [newTreasury, setNewTreasury] = useState("");

  // Initial Products
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: "AI Desktop Pet (LOOI Edition)", 
      priceTHB: 5590, 
      category: "Desk Setup", 
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80",
      isTrending: true,
      desc: "หุ่นยนต์ AI แก้เหงาบนโต๊ะเทรด โต้ตอบได้",
      affiliateLink: "https://shopee.co.th",
      stock: 5
    },
    { 
      id: 2, 
      name: "Oura Ring Gen 4 (Gold)", 
      priceTHB: 12900,
      category: "Trader's Sanctuary", 
      image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=500&q=80",
      isTrending: true,
      desc: "แหวนอัจฉริยะวัดการนอนและชีพจร",
      affiliateLink: "https://lazada.co.th",
      stock: 12
    },
    { 
      id: 3, 
      name: "Biometric Hardware Wallet", 
      priceTHB: 4500,
      category: "Crypto Secure", 
      image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=500&q=80",
      isTrending: true,
      desc: "ปลอดภัยสูงสุดด้วยระบบสแกนนิ้ว",
      stock: 8
    },
    { 
      id: 4, 
      name: "Transparent Powerbank 20000mAh", 
      priceTHB: 1990,
      category: "Desk Setup", 
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=500&q=80",
      isTrending: false,
      desc: "ดีไซน์ใสเห็นวงจร Cyberpunk Style",
      stock: 20
    },
    { 
      id: 5, 
      name: "Hologram Clock 3D", 
      priceTHB: 3200,
      category: "Future Living", 
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80",
      isTrending: false,
      desc: "นาฬิกาดิจิทัลลอยตัวแบบโฮโลแกรม",
      stock: 15
    },
    { 
      id: 6, 
      name: "Smart Walking Vacuum", 
      priceTHB: 15900,
      category: "Future Living", 
      image: "https://images.unsplash.com/photo-1589820296156-2454bb8a4d50?auto=format&fit=crop&w=500&q=80",
      isTrending: false,
      desc: "หุ่นยนต์ดูดฝุ่นแบบเดินข้ามสิ่งกีดขวางได้",
      stock: 3
    }
  ]);

  const quickCoins = [
    { symbol: 'BTC', id: 'bitcoin' },
    { symbol: 'ETH', id: 'ethereum' },
    { symbol: 'BNB', id: 'binancecoin' },
    { symbol: 'SOL', id: 'solana' },
    { symbol: 'DOGE', id: 'dogecoin' },
    { symbol: 'GOLD', custom: 'OANDA:XAUUSD' }, 
    { symbol: 'AAPL', custom: 'NASDAQ:AAPL' }    
  ];

  const chains = [
      { id: 'Ethereum', name: 'Ethereum Mainnet', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'BSC', name: 'BNB Chain (BSC)', icon: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
      { id: 'Polygon', name: 'Polygon (Matic)', icon: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' },
      { id: 'Bitkub Chain', name: 'Bitkub Chain', icon: 'https://www.bitkubchain.com/static/images/logo_bkc.svg' } 
  ];

  // Constants
  const glassPanel = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl";
  const glassButton = "bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md transition-all active:scale-95 text-slate-200";
  const glassInput = "bg-slate-950/50 border border-white/10 focus:border-cyan-500/50 outline-none transition-all text-slate-200 placeholder-slate-500";
  const headingFont = "font-['Sora'] tracking-tight";
  const bodyFont = "font-['Outfit']";

  // --- Initialize Firebase & Ethers (Condensed) ---
  useEffect(() => {
    try {
      let config = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "", authDomain: "boomwallet-2583b.firebaseapp.com", projectId: "boomwallet-2583b", storageBucket: "boomwallet-2583b.firebasestorage.app", messagingSenderId: "1032978734418", appId: "1:1032978734418:web:50605af806581bf4a86e8b" };
      if (!config) return;
      const app = initializeApp(config);
      const authInstance = getAuth(app);
      setFirebaseApp(app); setDb(getFirestore(app));
      const initAuth = async () => { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(authInstance, __initial_auth_token); } else { await signInAnonymously(authInstance); } };
      initAuth().catch(err => setDbError("Auth failed: " + err.code));
      onAuthStateChanged(authInstance, setFirebaseUser);
    } catch (e) { setDbError("Init Error: " + e.message); }
    const initEthers = async () => { if (typeof ethers !== 'undefined') { setEthersLib(ethers); } else if (window.ethers) { setEthersLib(window.ethers); } else { const script = document.createElement('script'); script.src = "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"; script.async = true; script.onload = () => { if (window.ethers) setEthersLib(window.ethers); }; document.body.appendChild(script); } };
    initEthers();
  }, []);

  // --- Real-time Listeners ---
  useEffect(() => {
    if (!db || !appId || !firebaseUser) return;
    setDbError(null); 
    const unsubChat = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'community_chat'), (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      msgs.sort((a, b) => a.timestamp - b.timestamp); setChatMessages(msgs); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    const unsubTx = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), (snapshot) => {
        const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        txs.sort((a, b) => b.timestamp - a.timestamp); setTransactions(txs.slice(0, 10)); 
        setShopOrders(txs.filter(t => t.type.includes('SHOP_BUY')));
    });

    // ✅ Listen for Merchant Requests
    const unsubMerchants = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'merchant_requests'), (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMerchantRequests(reqs);
        
        // ✅ Check Status from Firestore directly
        if (account) {
            const myReq = reqs.find(r => r.owner === account);
            if (myReq) {
                setMerchantStatus(myReq.status);
                setIsMerchant(myReq.status === 'approved'); // ✅ Only True if Approved
                if (myReq.status === 'approved') setShopRegisterForm(myReq);
            } else {
                setMerchantStatus("none");
                setIsMerchant(false);
            }
        }
    });

    return () => { unsubChat(); unsubTx(); unsubMerchants(); };
  }, [db, appId, firebaseUser, account]); 

  // --- Auto-Refresh for News ---
  useEffect(() => {
    if (activeTab === 'news') {
        fetchNews();
        const interval = setInterval(fetchNews, 60000); 
        return () => clearInterval(interval);
    }
  }, [activeTab]);

  // --- Admin Functions ---
  const updateOrderStatus = async (orderId, newStatus) => {
      if (!db || !appId) return;
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', orderId), { status: newStatus }); showStatus(`สถานะ: ${newStatus}`, "success"); } catch (e) { showStatus("Error updating status", "error"); }
  };

  const updateMerchantStatus = async (reqId, newStatus) => {
      if (!db || !appId) return;
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'merchant_requests', reqId), { status: newStatus }); showStatus(`อัปเดตสถานะร้านค้าเป็น: ${newStatus}`, "success"); } catch (e) { showStatus("Error updating merchant", "error"); }
  };

  const confirmRejection = async () => {
    if (!rejectingOrderId) return;
    const reason = rejectionReason.trim() || "ไม่ระบุเหตุผล / Unspecified Reason";
    setIsLoading(true);
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', rejectingOrderId), { status: 'Rejected', rejectionReason: reason });
        const order = shopOrders.find(o => o.id === rejectingOrderId);
        const buyerName = order ? order.from.slice(0,6) + '...' + order.from.slice(-4) : "Unknown";
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'community_chat'), {
            text: `❌ **ORDER REJECTED**\n\n🆔 Order: ${rejectingOrderId.slice(0,8)}...\n👤 Buyer: ${buyerName}\n⚠️ **Reason:** ${reason}\n\nกรุณาตรวจสอบสลิปหรือติดต่อแอดมินหากมีข้อสงสัย`,
            sender: "BoomShop Admin 🛡️", isWallet: false, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", timestamp: Date.now(),
        });
        showStatus("ปฏิเสธคำสั่งซื้อเรียบร้อย", "success");
        setRejectingOrderId(null); setRejectionReason("");
    } catch (e) { console.error("Rejection Error:", e); showStatus("เกิดข้อผิดพลาดในการปฏิเสธ", "error"); } finally { setIsLoading(false); }
  };

  // --- ✅ Merchant Registration Function (Updated) ---
  const handleRegisterShop = async () => {
      if (merchantStatus === 'pending') return showStatus("กำลังรอการตรวจสอบจาก Admin", "info");
      if (merchantStatus === 'approved') return showStatus("คุณเป็นร้านค้าอยู่แล้ว", "info");
      
      if (!shopRegisterForm.shopName || !shopRegisterForm.shopDesc) return showStatus("กรุณากรอกข้อมูลให้ครบ", "error");
      
      setIsLoading(true);
      try {
          // ✅ Save to Firestore 'merchant_requests' instead of localStorage
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'merchant_requests'), {
              ...shopRegisterForm,
              owner: account,
              status: 'pending', // ✅ Default status is pending
              timestamp: Date.now()
          });
          
          showStatus("ส่งคำขอสมัครเรียบร้อย! โปรดรอการอนุมัติจาก Admin", "success");
          setWalletMode('dashboard');
      } catch (e) {
          console.error(e);
          showStatus("เกิดข้อผิดพลาดในการสมัคร", "error");
      } finally {
          setIsLoading(false);
      }
  };

  // --- Wallet Actions ---
  const handleSwap = () => {
      if(!swapAmount) return showStatus("ระบุจำนวน", "error");
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); showStatus(`Swap ${swapAmount} ${swapFrom} -> ${swapTo} สำเร็จ (Mock)`, "success"); setSwapAmount(""); }, 2000);
  };

  const handleBridge = () => {
      if(!bridgeAmount) return showStatus("ระบุจำนวน", "error");
      if(bridgeFrom === bridgeTo) return showStatus("ต้นทางและปลายทางต้องไม่เหมือนกัน", "error");
      setIsLoading(true);
      setTimeout(() => { setIsLoading(false); showStatus(`Bridge ${bridgeAmount} ${bridgeToken} จาก ${bridgeFrom} ไป ${bridgeTo} สำเร็จ (Mock)`, "success"); setBridgeAmount(""); }, 3000);
  };

  // --- Donate Actions ---
  const handleDonate = async () => {
      const targetAddress = SHOP_WALLET_ADDRESS;
      setIsLoading(true);
      try {
          if (donateType === "PROMPTPAY") {
             if (!amount) throw new Error("กรุณาระบุยอดเงินบริจาค");
             await new Promise(r => setTimeout(r, 1500)); // Mock delay
             recordTransaction("DONATE_QR", amount, "THB", "Treasury");
             showStatus("ขอบคุณสำหรับเงินบริจาค (PromptPay)! 🙏", "success");
             setAmount("");
             return;
          }
          if (!ethersLib) return;
          if (donateType === "ETH") {
            const tx = await signer.sendTransaction({ to: targetAddress, value: ethersLib.utils.parseEther(amount) });
            await tx.wait();
            recordTransaction("DONATE_ETH", amount, "ETH", "Treasury");
          } else if (donateType === "ERC20") {
             // Logic for ERC20 would go here
             throw new Error("ERC20 Donation Mock - Not implemented");
          }
          showStatus("ขอบคุณสำหรับการบริจาค! 🙏", "success");
          setAmount("");
      } catch (err) { showStatus("บริจาคไม่สำเร็จ: " + (err.reason || err.message), "error"); } finally { setIsLoading(false); }
  };

  // --- Core Functions ---
  const connectWallet = async () => { 
      setAccount("0x123...4567"); checkOwner("0x123...4567"); setBalance("12.5000");
  }; 
  const checkOwner = async (addr) => {
      const currentAddr = addr.toLowerCase().trim();
      const isAdminWallet = ADMIN_WALLETS.some(admin => admin.toLowerCase().trim() === currentAddr);
      setIsOwner(isAdminWallet); 
  };
  const showStatus = (msg, type = "info") => { setStatusMsg(typeof msg === 'object' ? JSON.stringify(msg) : String(msg)); setStatusType(type); if (type === "success") setTimeout(() => setStatusMsg(""), 5000); };
  const recordTransaction = async (type, amount, token, to, details = "", shippingAddress = null, slipImage = null) => { if (!db || !appId || !firebaseUser) return; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { type, amount, token, to, details, shippingAddress, slipImage, status: "Pending", from: account, timestamp: Date.now() }); } catch (e) { console.error(e); } };
  const getRecipientAddress = () => SHOP_WALLET_ADDRESS;

  // --- fetchNews ---
  const fetchNews = async () => {
      setIsNewsLoading(true);
      try {
          const ytChannels = ['UCoiEtD4v1qMAqHV5MDI5Qpg', 'UCuTTT_6JxuAtRdvF3BvVjdg', 'UCk2v78J533nQo88qX25825g', 'UCVRXbIsWcdGSS8y8q_Dk_gA', 'UCnAtV9WlZ-Z68G8zV7s7sGA', 'UCxLdT8s1q6yV1yJ1lQ7q9Xg', 'UC7tS5J-jQJ3X6lZJ8Kx7QHg'];
          const videoPromises = ytChannels.map(id => fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${id}`).then(res => res.json()));
          const videoResults = await Promise.all(videoPromises);
          let allVideos = [];
          videoResults.forEach(data => {
              if(data.status === 'ok') {
                  const videos = data.items.map(item => ({
                      id: item.guid.split(':')[2] || item.guid, title: item.title, type: 'video', thumbnail: `https://i.ytimg.com/vi/${item.guid.split(':')[2] || item.guid}/mqdefault.jpg`, url: item.link, source: data.feed.title, date: new Date(item.pubDate).getTime()
                  }));
                  allVideos = [...allVideos, ...videos];
              }
          });
          for (let i = allVideos.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [allVideos[i], allVideos[j]] = [allVideos[j], allVideos[i]]; }
          setNewsData(allVideos);
      } catch (e) { console.error("News Fetch Error:", e); setNewsData([]); } finally { setIsNewsLoading(false); }
  };

  // Handlers
  const handleTransfer = async () => { setIsLoading(true); setTimeout(() => { setIsLoading(false); showStatus("โอนเงินสำเร็จ (Mock)", "success"); recordTransaction("TRANSFER", amount, transferType, recipient); }, 2000); };
  const handleSaveProduct = () => {
      if (!newProduct.name || !newProduct.priceTHB) return showStatus("กรุณากรอกข้อมูล", "error");
      if (newProduct.category && !shopCategories.includes(newProduct.category)) setShopCategories(prev => [...prev, newProduct.category]);
      const prodData = { ...newProduct, priceTHB: parseFloat(newProduct.priceTHB), stock: parseInt(newProduct.stock) || 0, image: newProduct.image || "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=500&q=80" };
      if (editingProductId) { setProducts(prev => prev.map(p => p.id === editingProductId ? { ...prodData, id: editingProductId } : p)); setEditingProductId(null); } else { setProducts(prev => [{ id: Date.now(), ...prodData }, ...prev]); }
      setNewProduct({ name: "", priceTHB: "", category: "Desk Setup", image: "", affiliateLink: "", stock: "10" }); setIsAddingNewCategory(false); showStatus("บันทึกสำเร็จ", "success");
  };
  const startEditProduct = (product) => { setNewProduct({ ...product, priceTHB: product.priceTHB.toString(), stock: product.stock.toString(), affiliateLink: product.affiliateLink || "" }); setEditingProductId(product.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cancelEdit = () => { setNewProduct({ name: "", priceTHB: "", category: "Desk Setup", image: "", affiliateLink: "", stock: "10" }); setEditingProductId(null); setIsAddingNewCategory(false); };
  const deleteProduct = (id) => { if(editingProductId === id) cancelEdit(); setProducts(prev => prev.filter(p => p.id !== id)); showStatus("ลบสินค้าแล้ว", "info"); };
  const addToCart = (product) => { setCart(prev => { const existing = prev.find(item => item.id === product.id); if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item); return [...prev, { ...product, qty: 1 }]; }); showStatus("เพิ่มลงตะกร้าแล้ว", "success"); };
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQty = (id, delta) => setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  const handleSlipSelect = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => setSlipImage(reader.result); reader.readAsDataURL(file); };
  
  const cartTotalTHB = cart.reduce((acc, item) => acc + (item.priceTHB * item.qty), 0);
  const cartTotalETH = (cartTotalTHB / USD_THB_RATE / currentPrice).toFixed(6);

  const handleCheckout = async () => { 
      if (!shippingAddress.trim()) {
        return showStatus("กรุณากรอกที่อยู่จัดส่ง", "error");
      }
      if ((paymentMethod === 'PROMPTPAY' || paymentMethod === 'BANK') && !slipImage) {
        return showStatus("กรุณาแนบสลิปโอนเงิน", "error");
      }

      setIsLoading(true); 

      try {
        const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
        const finalAmount = paymentMethod.includes('ETH') || paymentMethod.includes('USDT') ? cartTotalETH : cartTotalTHB.toLocaleString();
        
        await recordTransaction(
            "SHOP_BUY_" + paymentMethod, 
            finalAmount, 
            paymentMethod.includes('ETH') || paymentMethod.includes('USDT') ? paymentMethod : "THB", 
            SHOP_WALLET_ADDRESS, 
            itemsSummary, 
            shippingAddress, 
            slipImage
        ); 
        
        const buyerName = account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Guest Customer";
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'community_chat'), {
                text: `🛍️ **NEW ORDER RECEIVED**\n\n👤 Buyer: ${buyerName}\n📦 Items:\n${itemsSummary.replace(/, /g, '\n')}\n💰 Total: ${finalAmount} ${paymentMethod.includes('ETH') || paymentMethod.includes('USDT') ? "" : "THB"}\n💳 via ${paymentMethod}\n📍 **Shipping:**\n${shippingAddress}`, 
                sender: "BoomShop Bot 🤖",
                isWallet: false,
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BoomShop",
                image: slipImage, 
                timestamp: Date.now()
            });
        } catch(chatErr) {
            console.error("Chat post error", chatErr);
        }

        showStatus("สั่งซื้อสำเร็จ! ขอบคุณที่อุดหนุน", "success"); 
        setCart([]); 
        setSlipImage(null); 
        setShippingAddress("");
        setIsCartOpen(false); 
      } catch (error) {
          console.error("Checkout Error:", error);
          showStatus("เกิดข้อผิดพลาดในการสั่งซื้อ", "error");
      } finally {
          setIsLoading(false); 
      }
  };

  const handleUpdateFee = async () => { /* ... */ };
  const handleUpdateTreasury = async () => { /* ... */ };
  const fetchPriceData = async () => { /* ... */ };
  const fetchGlobalData = async () => { /* ... */ };
  const handleSearchCoin = async (e) => { /* ... */ };
  const handleAiSendMessage = async (e) => { /* ... */ };
  const handleImageSelect = (e) => { /* ... */ };
  const handleSendMessage = async (e) => { /* ... */ };
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); showStatus("คัดลอกแล้ว", "success"); };
  const formatNumber = (num) => { if (!num) return "-"; if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; return num.toLocaleString(); };
  const TradingViewWidget = ({ symbol, isCustom }) => <div className="w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative" />; 

  return (
    <div className={`min-h-screen ${bodyFont} bg-[#020617] text-slate-200 p-4 md:p-8 relative`}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.12) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 25%)' }}></div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap');`}</style>
      
      {/* ✅ Rejection Modal */}
      {rejectingOrderId && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className={`w-full max-w-md p-6 rounded-2xl ${glassPanel} border border-red-500/30`}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" /> ยืนยันการปฏิเสธคำสั่งซื้อ
                    </h3>
                    <p className="text-slate-300 text-sm mb-2">ระบุเหตุผลที่ปฏิเสธ (จะแสดงในหน้าชุมชน):</p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="เช่น สลิปปลอม, ยอดเงินไม่ถูกต้อง, สินค้าหมด..."
                        className={`w-full h-24 rounded-xl p-3 text-sm mb-4 ${glassInput} border-red-500/30 focus:border-red-500`}
                    />
                    <div className="flex gap-3">
                        <button onClick={() => { setRejectingOrderId(null); setRejectionReason(""); }} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold">ยกเลิก</button>
                        <button onClick={confirmRejection} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20">ยืนยันปฏิเสธ</button>
                    </div>
                </div>
            </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-center p-6 rounded-2xl ${glassPanel}`}>
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-14 h-14 bg-slate-900 rounded-xl border border-slate-700/50 flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                 <ShoppingBag className="w-8 h-8 text-white" />
              </div>
            </div>
            <div><h1 className={`text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${headingFont}`}>BoomTech Gateway</h1><p className="text-slate-400 text-sm flex items-center gap-1">Universal Protocol <span className="text-xs bg-blue-900/50 px-2 py-0.5 rounded text-blue-400 border border-blue-800">BETA</span></p></div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {isOwner && <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 text-xs font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> ADMIN</div>}
            <button onClick={connectWallet} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${account ? "bg-slate-800 text-cyan-400 border border-cyan-500/30" : "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"}`}>
                <Wallet className="w-4 h-4" /> {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className={`rounded-2xl overflow-hidden relative ${glassPanel}`}>
          
          {/* Cart Button */}
          {activeTab === 'shop' && cart.length > 0 && !isSellerMode && (
            <button 
                onClick={() => setIsCartOpen(!isCartOpen)} 
                className="absolute top-3 right-3 md:top-4 md:right-4 z-20 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-95 animate-in zoom-in duration-300"
            >
                <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-slate-900 font-bold">
                        {cart.reduce((a,b) => a+b.qty, 0)}
                    </span>
                </div>
            </button>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
            {[
                { id: 'wallet', icon: Wallet, label: 'กระเป๋าเงิน' }, 
                { id: 'shop', icon: ShoppingBag, label: 'ร้านค้า' }, 
                { id: 'news', icon: Youtube, label: 'ข่าวสาร & คลิป' }, 
                { id: 'community', icon: MessageSquare, label: 'ชุมชน' }, 
                { id: 'donate', icon: Heart, label: 'บริจาค' }, 
                { id: 'admin', icon: LayoutDashboard, label: 'Admin Dashboard' }, 
            ].map(tab => {
               if (tab.id === 'admin' && !isOwner) return null;
               return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === tab.id ? 'text-white bg-slate-800/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}><tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} /> {tab.label}{activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}</button>);
            })}
          </div>

          <div className="p-6 md:p-8">
            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ... (Same Wallet Logic) ... */}
                    {walletMode !== 'dashboard' && (
                        <button onClick={() => setWalletMode('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                            <ArrowRightLeft className="w-4 h-4 rotate-180" /> Back to Dashboard
                        </button>
                    )}
                    {walletMode === 'dashboard' && (
                        <div className="space-y-8">
                            {/* Balance Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-2xl text-white h-56 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div><p className="text-blue-200 text-sm font-medium mb-1">Total Balance</p><h2 className="text-4xl font-bold">{balance} ETH</h2></div>
                                    <QrCode className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setWalletMode('transfer')} className="flex-1 bg-white/20 p-2 rounded-xl text-sm font-bold">โอนเงิน</button>
                                    <button onClick={() => setWalletMode('deposit')} className="flex-1 bg-white/20 p-2 rounded-xl text-sm font-bold">รับเงิน</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { icon: Repeat, label: "Swap", action: () => setWalletMode('swap') },
                                    { icon: ScanLine, label: "Scan", action: () => setWalletMode('scan') },
                                    { icon: Layers, label: "Bridge", action: () => setWalletMode('bridge') }, // ✅ Bridge Button
                                    { icon: Store, label: "My Shop", action: () => setWalletMode('register_shop') }
                                ].map((item, idx) => (
                                    <button key={idx} onClick={item.action} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl ${glassPanel} hover:bg-slate-800 transition-all`}>
                                        <item.icon className="w-6 h-6 text-slate-300" />
                                        <span className="text-xs font-medium text-slate-300">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Shop Register Banner */}
                            {merchantStatus === 'none' && (
                                <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl p-6 relative overflow-hidden shadow-lg group cursor-pointer" onClick={() => setWalletMode('register_shop')}>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5"/> อยากมีรายได้เพิ่มไหม?</h3>
                                        <p className="text-orange-100 text-sm mb-4">สมัครเป็นพาร์ทเนอร์ร้านค้ากับ BoomTech วันนี้</p>
                                        <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold text-sm shadow-md">สมัครเปิดร้านค้า</button>
                                    </div>
                                </div>
                            )}

                            {merchantStatus === 'pending' && (
                                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold text-white mb-1">⏳ รอการตรวจสอบ</h3>
                                    <p className="text-yellow-100 text-sm">คำขอเปิดร้านของคุณกำลังรอการอนุมัติจาก Admin</p>
                                </div>
                            )}

                            {merchantStatus === 'approved' && (
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div><h3 className="text-xl font-bold text-white mb-1">Merchant Active</h3><p className="text-emerald-100 text-sm">คุณเป็นพาร์ทเนอร์ร้านค้าแล้ว</p></div>
                                        <button onClick={() => { setActiveTab('shop'); setIsSellerMode(true); }} className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm">ไปที่ร้านค้าของฉัน</button>
                                    </div>
                                </div>
                            )}

                             {/* Assets List */}
                             <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-blue-400"/> Assets</h3>
                                <div className="space-y-3">
                                    <div className={`flex items-center justify-between p-4 rounded-xl ${glassPanel} hover:border-blue-500/50 transition-colors`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"><img src="https://assets.coingecko.com/coins/images/279/large/ethereum.png" className="w-6 h-6" alt="ETH"/></div>
                                            <div><p className="font-bold text-white">Ethereum</p><p className="text-xs text-slate-400">ETH</p></div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">{balance}</p>
                                            <p className="text-xs text-slate-400">≈ ${(parseFloat(balance) * 3000).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center justify-between p-4 rounded-xl ${glassPanel} hover:border-emerald-500/50 transition-colors`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"><img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" className="w-6 h-6" alt="USDT"/></div>
                                            <div><p className="font-bold text-white">Tether USD</p><p className="text-xs text-slate-400">USDT</p></div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">{tokenBalance}</p>
                                            <p className="text-xs text-slate-400">≈ ${tokenBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* 2. Transfer Mode */}
                    {walletMode === 'transfer' && (
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Send className="w-6 h-6 text-blue-400"/> โอนเงิน</h2>
                            <div className="space-y-4">
                                <div className={`flex p-1 rounded-xl w-full ${glassPanel} mb-4`}>
                                    <button onClick={() => setTransferType('ETH')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${transferType === 'ETH' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>ETH</button>
                                    <button onClick={() => setTransferType('ERC20')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${transferType === 'ERC20' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Token</button>
                                </div>
                                {transferType === 'ERC20' && (
                                    <div><label className="text-xs text-slate-400 ml-1">Token Address</label><input type="text" placeholder="0x..." value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} className={`w-full rounded-xl px-4 py-3 font-mono text-sm ${glassInput}`}/></div>
                                )}
                                <div><label className="text-xs text-slate-400 ml-1">Recipient Address</label><input type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} className={`w-full rounded-xl px-4 py-3 font-mono text-sm ${glassInput}`}/></div>
                                <div>
                                    <label className="text-xs text-slate-400 ml-1">Amount</label>
                                    <div className="relative">
                                        <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full rounded-xl px-4 py-3 font-mono text-sm ${glassInput}`}/>
                                        <span className="absolute right-4 top-3.5 text-slate-500 text-sm font-bold">{transferType === 'ETH' ? 'ETH' : 'TOKENS'}</span>
                                    </div>
                                </div>
                                <button onClick={handleTransfer} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg mt-4 flex items-center justify-center gap-2">
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <ArrowRightLeft className="w-5 h-5"/>} Confirm Transfer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. Deposit Mode */}
                    {walletMode === 'deposit' && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2"><QrCode className="w-6 h-6 text-emerald-400"/> รับเงิน (Deposit)</h2>
                            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-white/5 mb-8">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${account}`} alt="Wallet QR" className="w-64 h-64 rounded-xl" />
                            </div>
                            <div className="w-full max-w-md bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-3">
                                <span className="text-sm text-slate-400 font-medium">Wallet Address ของคุณ</span>
                                <div className="flex items-center gap-3">
                                    <code className="flex-1 font-mono text-emerald-400 break-all bg-emerald-900/10 p-3 rounded-lg border border-emerald-500/20 text-sm">{account || "ยังไม่เชื่อมต่อ"}</code>
                                    <button onClick={() => account && copyToClipboard(account)} className={`p-3 rounded-lg ${glassButton}`}><Copy className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Swap Mode (Mock) */}
                    {walletMode === 'swap' && (
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Repeat className="w-6 h-6 text-purple-400"/> แลกเปลี่ยน (Swap)</h2>
                            <div className={`p-6 rounded-2xl ${glassPanel} space-y-4`}>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <div className="flex justify-between mb-2"><span className="text-xs text-slate-400">From</span><span className="text-xs text-slate-400">Bal: {balance}</span></div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="0.0" value={swapAmount} onChange={(e)=>setSwapAmount(e.target.value)} className="bg-transparent text-2xl font-bold text-white w-full outline-none"/>
                                        <button className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-1 font-bold">{swapFrom} <ChevronRight className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <div className="flex justify-center -my-3 relative z-10"><button className="bg-slate-800 p-2 rounded-full border border-slate-700 shadow-xl"><ArrowDown className="w-4 h-4 text-white"/></button></div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <div className="flex justify-between mb-2"><span className="text-xs text-slate-400">To (Estimate)</span></div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="0.0" value={bridgeAmount} onChange={(e)=>setBridgeAmount(e.target.value)} className="bg-transparent text-2xl font-bold text-white w-full outline-none"/>
                                        <button className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-1 font-bold">{swapTo} <ChevronRight className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <button onClick={handleSwap} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold shadow-lg mt-2 flex items-center justify-center gap-2">
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin"/> : "Swap Tokens"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 5. Scan Mode (Mock) */}
                    {walletMode === 'scan' && (
                        <div className="flex flex-col items-center justify-center py-10">
                             <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><ScanLine className="w-6 h-6 text-emerald-400"/> สแกน QR (Scan)</h2>
                             <div className="w-64 h-64 bg-black rounded-3xl border-2 border-emerald-500/50 relative overflow-hidden flex items-center justify-center mb-6">
                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-full w-full animate-pulse"></div>
                                 <p className="text-emerald-400 animate-pulse text-sm">Scanning...</p>
                             </div>
                             <div className="flex gap-4">
                                 <button className={`px-6 py-3 rounded-xl ${glassButton}`}><ImageIcon className="w-5 h-5"/> Upload Image</button>
                             </div>
                        </div>
                    )}

                    {/* ✅ 6. Cross-Chain Bridge Mode */}
                    {walletMode === 'bridge' && (
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Layers className="w-6 h-6 text-cyan-400"/> Cross-Chain Bridge</h2>
                            <div className={`p-6 rounded-2xl ${glassPanel} space-y-4`}>
                                {/* From Chain */}
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 ml-1">From Network</label>
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">🌐</div>
                                            <select value={bridgeFrom} onChange={(e) => setBridgeFrom(e.target.value)} className="bg-transparent text-white text-sm font-bold outline-none">
                                                {chains.map(c => <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center -my-2 relative z-10"><div className="bg-slate-800 p-1.5 rounded-full border border-slate-700 shadow-xl"><ArrowDown className="w-4 h-4 text-slate-400"/></div></div>

                                {/* To Chain */}
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 ml-1">To Network</label>
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">🎯</div>
                                            <select value={bridgeTo} onChange={(e) => setBridgeTo(e.target.value)} className="bg-transparent text-white text-sm font-bold outline-none">
                                                {chains.map(c => <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4">
                                    <div className="flex justify-between mb-2"><span className="text-xs text-slate-400">Send Amount</span><span className="text-xs text-slate-400">Bal: {balance}</span></div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="0.0" value={bridgeAmount} onChange={(e)=>setBridgeAmount(e.target.value)} className="bg-transparent text-2xl font-bold text-white w-full outline-none"/>
                                        <button className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-1 font-bold text-xs">{bridgeToken}</button>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 flex justify-between px-1">
                                    <span>Estimated Gas Fee:</span>
                                    <span className="text-white font-mono">0.005 ETH</span>
                                </div>

                                <button onClick={handleBridge} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold shadow-lg mt-2 flex items-center justify-center gap-2">
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin"/> : "Bridge Assets"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 7. Register Shop Mode */}
                    {walletMode === 'register_shop' && (
                        <div className="max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold text-white text-center mb-6">ลงทะเบียนร้านค้า</h2>
                            <div className={`p-6 rounded-2xl ${glassPanel} space-y-4`}>
                                <input type="text" placeholder="ชื่อร้านค้า" value={shopRegisterForm.shopName} onChange={(e) => setShopRegisterForm({...shopRegisterForm, shopName: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm ${glassInput}`}/>
                                <textarea placeholder="รายละเอียด" value={shopRegisterForm.shopDesc} onChange={(e) => setShopRegisterForm({...shopRegisterForm, shopDesc: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm h-24 resize-none ${glassInput}`}/>
                                <button onClick={handleRegisterShop} disabled={isLoading} className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg mt-4 flex items-center justify-center gap-2">{isLoading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <CheckCircle className="w-5 h-5"/>} ยืนยันการสมัคร</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ Shop Tab: Includes Seller Dashboard */}
            {activeTab === 'shop' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[500px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div><h2 className={`text-2xl font-bold text-white flex items-center gap-2 ${headingFont}`}><ShoppingBag className="w-6 h-6 text-blue-400" /> BoomShop</h2><p className="text-slate-400 text-sm">Curated Tech Shop เพื่อชาว Crypto โดยเฉพาะ</p></div>
                        {/* ✅ FIX: Use shopCategories (state) instead of SHOP_CATEGORIES */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">{shopCategories.map(cat => (<button key={cat} onClick={() => setShopCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${shopCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}>{cat}</button>))}</div>
                    </div>

                    {/* 🔥 Trending Now Section (Only in Buyer Mode) */}
                    {!isSellerMode && shopCategory === 'All' && (
                        <div className="mb-8 animate-in slide-in-from-right duration-500">
                            <h3 className={`text-lg font-bold text-white mb-4 flex items-center gap-2 ${headingFont}`}>
                                <Flame className="w-5 h-5 text-orange-500 animate-pulse" /> Trending Now <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">Viral 2026</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {products.filter(p => p.isTrending).slice(0, 3).map(product => (
                                    <div key={product.id} className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer border border-slate-800 hover:border-orange-500/50 transition-all shadow-lg" onClick={() => addToCart(product)}>
                                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col justify-end p-4">
                                            <h4 className="font-bold text-white truncate text-lg shadow-black drop-shadow-md">{product.name}</h4>
                                            <div className="flex justify-between items-center mt-auto">
                                                <span className="text-emerald-400 font-mono font-bold text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">฿{product.priceTHB.toLocaleString()}</span>
                                                <button className="bg-orange-500 hover:bg-orange-400 text-white p-2 rounded-lg transition-colors shadow-lg shadow-orange-500/20"><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ✅ Seller Dashboard Toggle Button (Visible only to Merchants/Admins) */}
                    {(isMerchant || isOwner) && (
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => setIsSellerMode(!isSellerMode)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isSellerMode ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-yellow-500 border border-yellow-500/50'}`}
                            >
                                {isSellerMode ? <X className="w-4 h-4"/> : <Settings className="w-4 h-4"/>}
                                {isSellerMode ? "ปิดโหมดผู้ขาย" : "จัดการร้านค้า (Seller Mode)"}
                            </button>
                        </div>
                    )}

                    {/* ✅ Seller Dashboard Content (Moved back to Shop Tab) */}
                    {isSellerMode ? (
                        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl ${glassPanel} flex items-center justify-between`}>
                                    <div><p className="text-slate-400 text-xs uppercase">สินค้าของฉัน</p><h3 className={`text-2xl font-bold text-white ${headingFont}`}>{products.length}</h3></div>
                                    <div className="p-3 bg-blue-500/20 rounded-lg"><Box className="w-6 h-6 text-blue-400"/></div>
                                </div>
                                <div className={`p-4 rounded-xl ${glassPanel} flex items-center justify-between`}>
                                    <div><p className="text-slate-400 text-xs uppercase">ยอดขาย (ออเดอร์)</p><h3 className={`text-2xl font-bold text-white ${headingFont}`}>{shopOrders.length}</h3></div>
                                    <div className="p-3 bg-emerald-500/20 rounded-lg"><ShoppingBag className="w-6 h-6 text-emerald-400"/></div>
                                </div>
                            </div>

                            {/* Add/Edit Product */}
                            <div className={`p-6 rounded-2xl ${glassPanel}`}>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    {editingProductId ? <Edit2 className="w-5 h-5 text-yellow-400"/> : <Plus className="w-5 h-5 text-emerald-400"/>} 
                                    {editingProductId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="ชื่อสินค้า" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className={`rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                    <input type="number" placeholder="ราคา (บาท)" value={newProduct.priceTHB} onChange={(e) => setNewProduct({...newProduct, priceTHB: e.target.value})} className={`rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                    
                                    {/* ✅ Dynamic Category Selector (Using shopCategories state) */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Category / Collection</label>
                                        {!isAddingNewCategory ? (
                                            <div className="flex gap-2">
                                                <select 
                                                    value={newProduct.category} 
                                                    onChange={(e) => {
                                                        if (e.target.value === 'NEW') {
                                                            setIsAddingNewCategory(true);
                                                            setNewProduct({...newProduct, category: ''});
                                                        } else {
                                                            setNewProduct({...newProduct, category: e.target.value});
                                                        }
                                                    }} 
                                                    className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}
                                                >
                                                    {/* ✅ FIX: Use shopCategories */}
                                                    {shopCategories.filter(c => c !== "All").map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                                    <option value="NEW" className="bg-slate-900 text-yellow-400 font-bold">+ New Collection</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="ชื่อ Collection ใหม่..." 
                                                    value={newProduct.category} 
                                                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                                                    className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}
                                                    autoFocus
                                                />
                                                <button 
                                                    onClick={() => setIsAddingNewCategory(false)}
                                                    className="px-3 py-2 bg-slate-700 rounded-lg text-xs text-white hover:bg-slate-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <input type="text" placeholder="URL รูปภาพ (Optional)" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className={`rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                    {/* ✅ ช่องกรอก Affiliate Link */}
                                    <div className="md:col-span-2">
                                        <input type="text" placeholder="Affiliate Link (e.g. Shopee/Lazada/Amazon) - ถ้ามี" value={newProduct.affiliateLink} onChange={(e) => setNewProduct({...newProduct, affiliateLink: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {editingProductId && <button onClick={cancelEdit} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-bold">ยกเลิก</button>}
                                    <button onClick={handleSaveProduct} className={`flex-1 text-white py-2 rounded-lg font-bold transition-colors ${editingProductId ? 'bg-yellow-600' : 'bg-emerald-600'}`}>
                                        {editingProductId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
                                    </button>
                                </div>
                            </div>

                            {/* Product List */}
                            <div className={`p-6 rounded-2xl ${glassPanel}`}>
                                <h3 className="text-xl font-bold text-white mb-4">รายการสินค้าในคลัง</h3>
                                <div className="space-y-2">
                                    {products.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border bg-slate-950/50 border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <img src={p.image} className="w-10 h-10 rounded-md object-cover" alt=""/>
                                                <div><p className="font-bold text-sm text-white">{p.name}</p><p className="text-xs text-slate-400">฿{p.priceTHB.toLocaleString()}</p></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditProduct(p)} className="text-yellow-400 p-2 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                                                <button onClick={() => deleteProduct(p.id)} className="text-red-400 p-2 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard Shop Grid (Buyer View) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => shopCategory === 'All' || p.category === shopCategory).map(product => (
                                <div key={product.id} className={`rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all group flex flex-col relative ${glassPanel}`}>
                                    <div className="h-48 overflow-hidden relative"><img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className={`font-bold text-white text-lg mb-1 ${headingFont}`}>{product.name}</h3>
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <div className="text-emerald-400 font-bold font-mono">฿{product.priceTHB.toLocaleString()}</div>
                                            <div className="flex gap-2">
                                                {/* ✅ ปุ่ม Affiliate Link ใน Grid ปกติ */}
                                                {product.affiliateLink && (
                                                    <a href={product.affiliateLink} target="_blank" rel="noreferrer" className={`p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/40 hover:text-orange-200 transition-colors border border-orange-500/30`} title="สั่งซื้อผ่าน Affiliate"><ExternalLink className="w-5 h-5" /></a>
                                                )}
                                                <button onClick={() => addToCart(product)} className={`p-2 rounded-lg ${glassButton}`} title="เพิ่มลงตะกร้า"><Plus className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* ✅ Cart Modal (Complete Payment Options) */}
                    {isCartOpen && (
                        <div className="absolute top-16 right-4 w-full md:w-96 max-h-[calc(100%-5rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl z-30 p-6 flex flex-col animate-in slide-in-from-top-2 fade-in duration-200 rounded-2xl">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800"><h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> ตะกร้าสินค้า</h3><button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-white" /></button></div>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                {cart.length === 0 ? (<div className="text-center text-slate-500 py-10"><Package className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>ตะกร้าว่างเปล่า</p></div>) : (cart.map(item => (
                                    <div key={item.id} className="flex gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800"><img src={item.image} className="w-16 h-16 rounded-lg object-cover" alt="" /><div className="flex-1"><h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4><p className="text-xs text-emerald-400 mb-2">฿{item.priceTHB.toLocaleString()}</p><div className="flex items-center gap-2"><button onClick={() => updateQty(item.id, -1)} className="p-1 bg-slate-800 rounded text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button><span className="text-xs font-mono w-4 text-center">{item.qty}</span><button onClick={() => updateQty(item.id, 1)} className="p-1 bg-slate-800 rounded text-slate-400 hover:text-white"><Plus className="w-3 h-3" /></button><button onClick={() => removeFromCart(item.id)} className="ml-auto p-1 text-red-400 hover:bg-red-900/20 rounded"><Trash2 className="w-3 h-3" /></button></div></div></div>
                                )))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                                {/* ✅ Payment Method Selection */}
                                <div>
                                    <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">เลือกช่องทางชำระเงิน</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setPaymentMethod('PROMPTPAY')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'PROMPTPAY' ? 'bg-sky-600/20 border-sky-500 text-sky-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                            <QrCode className="w-5 h-5" /> <span className="text-xs font-bold">QR / PromptPay</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('CREDIT')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CREDIT' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                            <CreditCard className="w-5 h-5" /> <span className="text-xs font-bold">Credit Card</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('BANK')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'BANK' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                            <Banknote className="w-5 h-5" /> <span className="text-xs font-bold">Mobile Banking</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('ETH')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'ETH' || paymentMethod === 'USDT' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                            <Coins className="w-5 h-5" /> <span className="text-xs font-bold">Crypto</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                {paymentMethod === 'PROMPTPAY' && (
                                    <div className="bg-white p-3 rounded-xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                        <img src={`https://promptpay.io/${PROMPTPAY_ID}/${cartTotalTHB}.png`} alt="PromptPay" className="w-32 h-32" />
                                        <div className="text-slate-900 font-bold text-lg mt-2">{cartTotalTHB.toLocaleString()} THB</div>
                                        <div className="text-xs text-slate-500">Scan to Pay</div>
                                    </div>
                                )}
                                
                                {paymentMethod === 'CREDIT' && (
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-3 animate-in fade-in duration-300">
                                        <input type="text" placeholder="Card Number" className={`w-full rounded-lg px-3 py-2 text-sm ${glassInput}`} />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="MM/YY" className={`w-full rounded-lg px-3 py-2 text-sm ${glassInput}`} />
                                            <input type="text" placeholder="CVC" className={`w-full rounded-lg px-3 py-2 text-sm ${glassInput}`} />
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'BANK' && (
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-2 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-900/20 border border-emerald-500/30 cursor-pointer hover:bg-emerald-900/30">
                                            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">K</div>
                                            <div className="text-xs text-white">K-Plus (Kasikorn)</div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-900/20 border border-purple-500/30 cursor-pointer hover:bg-purple-900/30">
                                            <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-xs">S</div>
                                            <div className="text-xs text-white">SCB Easy</div>
                                        </div>
                                    </div>
                                )}

                                {(paymentMethod === 'ETH' || paymentMethod === 'USDT') && (
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-3 animate-in fade-in duration-300">
                                        <div className="flex justify-between text-sm text-slate-400"><span>Amount:</span> <span className="text-white font-mono">{cartTotalETH} ETH</span></div>
                                        <button className="w-full bg-orange-600/20 text-orange-400 py-2 rounded-lg text-xs font-bold border border-orange-500/50">Connect Wallet to Pay</button>
                                    </div>
                                )}

                                {/* ✅ ส่วนกรอกที่อยู่ & แนบสลิป */}
                                <div>
                                    <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">ที่อยู่จัดส่ง (Shipping Address) <span className="text-red-400">*</span></label>
                                    <textarea 
                                        placeholder="ชื่อ-นามสกุล, เบอร์โทรศัพท์, ที่อยู่จัดส่ง..." 
                                        value={shippingAddress} 
                                        onChange={(e) => setShippingAddress(e.target.value)} 
                                        className={`w-full rounded-lg px-3 py-2 text-sm h-20 resize-none ${glassInput}`}
                                    />
                                </div>
                                
                                {(paymentMethod === 'PROMPTPAY' || paymentMethod === 'BANK') && (
                                    <div className="space-y-2">
                                        <input type="file" accept="image/*" ref={slipInputRef} onChange={handleSlipSelect} className="hidden" />
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => slipInputRef.current?.click()} 
                                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg border border-slate-700 text-xs flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <UploadCloud className="w-4 h-4" /> แนบสลิปโอนเงิน / หลักฐาน
                                            </button>
                                            {slipImage && (
                                                <button onClick={() => setSlipImage(null)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        {slipImage && (
                                            <div className="relative rounded-lg overflow-hidden border border-emerald-500/30 h-20">
                                                <img src={slipImage} alt="Slip Preview" className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 w-full bg-emerald-500/90 text-white text-[8px] text-center py-0.5 font-bold">Attached</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800"><span className="text-slate-400">Total</span><span className="text-xl font-bold text-white font-mono">฿{cartTotalTHB.toLocaleString()}</span></div>
                                <button onClick={handleCheckout} disabled={cart.length === 0 || isLoading || !shippingAddress.trim()} className={`w-full text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 disabled:opacity-50 transition-all active:scale-95`}>{isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirm Order"}</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* ✅ News Tab: YouTube Video Feed */}
            {activeTab === 'news' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold text-white flex items-center gap-2 ${headingFont}`}>
                      <Youtube className="w-6 h-6 text-red-500" /> 
                      <span className="hidden md:inline">Thai News & Variety Feed</span>
                      <span className="md:hidden">Thai Feed</span>
                  </h2>
                  <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">TH</div>
                      </div>
                      <span className="text-xs text-slate-400">อัปเดตล่าสุด</span>
                  </div>
                </div>
                
                {isNewsLoading ? (
                    <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-slate-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsData.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-slate-500">ไม่พบวีดีโออัปเดตในขณะนี้</div>
                        ) : (
                            newsData.map((item, idx) => (
                                // Video Card (แสดงเฉพาะ Video)
                                <a href={item.url} target="_blank" rel="noreferrer" key={idx} className="block group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 transition-all flex flex-col h-full">
                                    <div className="aspect-video relative overflow-hidden shrink-0">
                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <div className="bg-red-600 text-white rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"><PlayCircle className="w-8 h-8 fill-current" /></div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 backdrop-blur-md">
                                            <Youtube className="w-3 h-3 text-red-500"/> {item.source}
                                        </div>
                                        {/* Badge แนะนำสุ่ม */}
                                        {idx < 3 && <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Flame className="w-3 h-3 fill-current"/> มาแรง</div>}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="text-white font-bold line-clamp-2 mb-2 group-hover:text-red-400 transition-colors text-sm leading-relaxed">{item.title}</h3>
                                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-800/50">
                                            <p className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(item.date).toLocaleDateString('th-TH')}</p>
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">รับชม</span>
                                        </div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}
              </div>
            )}
            
            {/* Community Tab - Restored */}
            {activeTab === 'community' && (
              <div className="flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-900/30 p-2 rounded-lg"><MessageSquare className="w-6 h-6 text-blue-400"/></div>
                      <div>
                          <h2 className={`text-xl font-bold text-white ${headingFont}`}>Community Board & Chat</h2>
                          <p className="text-xs text-slate-400">พื้นที่พูดคุยแลกเปลี่ยนสำหรับชาว BoomTech</p>
                      </div>
                  </div>

                  {/* Announcement Board (Pinned) */}
                  <div className="mb-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/30 flex items-start gap-3 shadow-lg">
                      <Pin className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                      <div>
                          <h4 className="text-sm font-bold text-indigo-200 mb-1">ประกาศจากแอดมิน</h4>
                          <p className="text-xs text-slate-300">ยินดีต้อนรับสู่ชุมชน BoomTech! กฎกติกา: ห้ามสแปมลิงก์พนัน หรือเนื้อหาที่ไม่เหมาะสม หากพบเห็นจะถูกแบนทันที</p>
                      </div>
                  </div>

                  {dbError && (<div className="mb-4 bg-red-900/20 border border-red-500/50 p-3 rounded-xl flex items-center gap-3 text-red-200 text-xs"><AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" /><span>{dbError}</span></div>)}
                  
                  <div className={`flex-1 rounded-xl overflow-hidden flex flex-col shadow-inner relative ${glassPanel}`}>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                          {chatMessages.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                                  <MessageSquare className="w-12 h-12 opacity-20"/>
                                  <p>ยังไม่มีข้อความ เริ่มต้นทักทายเพื่อนๆ ได้เลย!</p>
                              </div>
                          ) : (
                              chatMessages.map((msg) => (
                                  <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '') ? 'flex-row-reverse' : ''}`}>
                                      <img src={msg.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0" />
                                      <div className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '') ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className={`text-[10px] font-bold ${msg.sender === (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '') ? 'text-blue-200' : 'text-slate-400'}`}>{msg.sender}</span>
                                              {msg.isWallet && <Shield className="w-3 h-3 text-emerald-400" />}
                                              <span className="text-[9px] opacity-60 ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                          </div>
                                          {msg.image && (
                                              <div className="mb-2 rounded-lg overflow-hidden border border-black/20 relative group">
                                                  <img src={msg.image} alt="attached" className="max-w-full h-auto object-cover max-h-60" />
                                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                                              </div>
                                          )}
                                          {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}
                                      </div>
                                  </div>
                              ))
                          )}
                          <div ref={chatEndRef} />
                      </div>
                      {selectedImage && (<div className="absolute bottom-[70px] left-4 right-4 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border border-slate-600 flex items-center justify-between shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2"><div className="flex items-center gap-3 overflow-hidden"><img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded-md border border-slate-500" /><span className="text-xs text-slate-300 truncate">พร้อมส่งรูปภาพ...</span></div><button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button></div>)}
                      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center"><input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden"/><button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full ${glassButton}`} title="แนบรูปภาพ"><ImageIcon className="w-5 h-5" /></button><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={account ? "พิมพ์ข้อความ..." : "เชื่อมต่อกระเป๋าเพื่อแชท"} disabled={!account && !isLoading} className={`flex-1 rounded-full px-4 py-2 text-sm ${glassInput}`}/><button type="submit" disabled={(!chatInput.trim() && !selectedImage) || !account} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 shadow-lg"><Send className="w-4 h-4 ml-0.5" /></button></form>
                  </div>
              </div>
            )}

            {/* Donate Tab */}
            {activeTab === 'donate' && (
              <div className="space-y-8 text-center py-10 animate-in fade-in zoom-in duration-300"><div className="w-24 h-24 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/20 shadow-lg shadow-pink-500/10"><Heart className="w-12 h-12 text-pink-500" /></div><div><h2 className={`text-2xl font-bold text-white mb-2 ${headingFont}`}>สนับสนุนโปรเจกต์ (Donation)</h2><p className="text-slate-400 max-w-md mx-auto text-sm">เงินบริจาคจะถูกส่งเข้า Treasury โดยตรง เพื่อใช้ในการพัฒนาและบำรุงรักษาระบบ</p></div><div className="flex justify-center gap-4"><button onClick={() => setDonateType("ETH")} className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${donateType === 'ETH' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'}`}><Wallet className="w-4 h-4" /> ETH</button><button onClick={() => setDonateType("ERC20")} className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${donateType === 'ERC20' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'}`}><Coins className="w-4 h-4" /> USDT / Token</button></div><div className="max-w-sm mx-auto space-y-4">{donateType === 'ERC20' && (<input type="text" placeholder="Token/USDT Address (0x...)" value={donateTokenAddress} onChange={(e) => setDonateTokenAddress(e.target.value)} className={`w-full rounded-xl px-4 py-3 font-mono text-sm ${glassInput}`} />)}<div className="relative"><input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full rounded-xl px-4 py-3 font-mono text-white text-center text-2xl font-bold outline-none transition-colors ${donateType === 'ETH' ? 'focus:border-pink-500' : 'focus:border-purple-500'} ${glassInput}`} /><span className="absolute right-4 top-5 text-slate-500 text-sm font-bold">{donateType === 'ETH' ? 'ETH' : 'TOKENS'}</span></div>{donateType === 'ETH' && (<div className="flex gap-2 justify-center">{[0.01, 0.05, 0.1].map((val) => <button key={val} onClick={() => setAmount(val.toString())} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg border border-slate-700 transition-colors">{val} ETH</button>)}</div>)}</div><button onClick={handleDonate} disabled={isLoading || !amount} className={`w-full max-w-sm mx-auto text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${donateType === 'ETH' ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'}`}>{isLoading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Heart className="w-5 h-5 fill-current" />} {isLoading ? "กำลังดำเนินการ..." : `ยืนยันบริจาค ${donateType}`}</button></div>
            )}
            
            {/* ✅ ADMIN TAB: Full Option (Only Visible to Admin) */}
            {activeTab === 'admin' && isOwner && (
                <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Sidebar Nav for Admin */}
                    <div className="w-full lg:w-64 shrink-0 space-y-2">
                        {['dashboard', 'orders', 'products', 'settings', 'merchants'].map(sub => (
                            <button 
                                key={sub} 
                                onClick={() => setAdminSubTab(sub)} 
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${adminSubTab === sub ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <span className="capitalize flex items-center gap-3">
                                    {sub === 'dashboard' && <LayoutDashboard className="w-4 h-4"/>}
                                    {sub === 'orders' && <FileText className="w-4 h-4"/>}
                                    {sub === 'products' && <Box className="w-4 h-4"/>}
                                    {sub === 'settings' && <Settings className="w-4 h-4"/>}
                                    {sub === 'merchants' && <UserCheck className="w-4 h-4"/>}
                                    {sub}
                                </span>
                                {adminSubTab === sub && <ChevronRight className="w-4 h-4"/>}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        
                        {/* 1. DASHBOARD OVERVIEW */}
                        {adminSubTab === 'dashboard' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign className="w-16 h-16 text-emerald-400"/></div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Total Revenue</p>
                                        <h3 className="text-2xl font-bold text-white font-mono">{(shopOrders.length * 0.05).toFixed(2)} ETH</h3>
                                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3"/> +12% this month</p>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShoppingBag className="w-16 h-16 text-blue-400"/></div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Total Orders</p>
                                        <h3 className="text-2xl font-bold text-white font-mono">{shopOrders.length}</h3>
                                        <p className="text-[10px] text-blue-400 flex items-center gap-1 mt-2">All time orders</p>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Truck className="w-16 h-16 text-orange-400"/></div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Pending Shipment</p>
                                        <h3 className="text-2xl font-bold text-white font-mono">{shopOrders.filter(o => !o.status || o.status === 'Pending').length}</h3>
                                        <p className="text-[10px] text-orange-400 flex items-center gap-1 mt-2">Needs attention</p>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Box className="w-16 h-16 text-purple-400"/></div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Total Products</p>
                                        <h3 className="text-2xl font-bold text-white font-mono">{products.length}</h3>
                                        <p className="text-[10px] text-purple-400 flex items-center gap-1 mt-2">Active items</p>
                                    </div>
                                </div>

                                {/* Analytics Graph */}
                                <div className={`p-6 rounded-xl ${glassPanel}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400"/> Sales Performance</h3>
                                        <select className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 outline-none"><option>Last 7 Days</option><option>Last 30 Days</option></select>
                                    </div>
                                    <div className="h-48 flex items-end justify-between gap-3 px-2">
                                        {[35, 50, 25, 65, 45, 80, 55, 95, 70, 40, 60, 85].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                                                <div className="w-full bg-gradient-to-t from-blue-600/50 to-cyan-400/50 rounded-t-sm hover:from-blue-500 hover:to-cyan-300 transition-all relative" style={{height: `${h}%`}}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 shadow-xl">{h} Sales</div>
                                                </div>
                                                <div className="h-1 w-full bg-slate-800 mt-1 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                    </div>
                                </div>

                                {/* Top Products */}
                                <div className={`p-6 rounded-xl ${glassPanel}`}>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500"/> Top Selling Products</h3>
                                    <div className="space-y-3">
                                        {products.slice(0, 3).map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full font-bold text-slate-500 text-xs">#{i+1}</div>
                                                    <img src={p.image} className="w-10 h-10 rounded object-cover" alt=""/>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{p.name}</p>
                                                        <p className="text-[10px] text-slate-400">฿{p.priceTHB.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-emerald-400">{20 - i * 5} Sold</p>
                                                    <p className="text-[10px] text-slate-500">Total: ฿{((20 - i * 5) * p.priceTHB).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. ORDERS MANAGEMENT (Enhanced) */}
                        {adminSubTab === 'orders' && (
                            <div className={`p-6 rounded-xl ${glassPanel}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Order Management</h3>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"/>
                                            <input type="text" placeholder="Search Order ID / Buyer..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs ${glassInput}`}/>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex border-b border-slate-800 mb-4 overflow-x-auto">
                                    {['All', 'Pending', 'Shipped', 'Completed'].map(status => (
                                        <button 
                                            key={status} 
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${filterStatus === status ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {status} <span className="ml-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400">{status === 'All' ? shopOrders.length : shopOrders.filter(o => (o.status || 'Pending') === status).length}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {shopOrders.filter(o => (filterStatus === 'All' || (o.status || 'Pending') === filterStatus) && ((o.details || "").toLowerCase().includes(orderSearch.toLowerCase()) || (o.from || "").toLowerCase().includes(orderSearch.toLowerCase()))).length === 0 ? (
                                        <div className="text-center py-10">
                                            <Package className="w-12 h-12 text-slate-700 mx-auto mb-2"/>
                                            <p className="text-slate-500">ไม่พบรายการสั่งซื้อ</p>
                                        </div>
                                    ) : (
                                        shopOrders
                                        .filter(o => (filterStatus === 'All' || (o.status || 'Pending') === filterStatus) && ((o.details || "").toLowerCase().includes(orderSearch.toLowerCase()) || (o.from || "").toLowerCase().includes(orderSearch.toLowerCase())))
                                        .map((order) => (
                                            <div key={order.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 hover:border-blue-500/30 transition-all">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                                                                    order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                                                                    order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                                                    order.status === 'Approved' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                                                                    order.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                                    'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                                                }`}>
                                                                    {order.status || 'Pending'}
                                                                </span>
                                                                <span className="text-xs text-slate-500">ID: {order.id.slice(0,8)}...</span>
                                                                <span className="text-xs text-slate-500">• {new Date(order.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            <h4 className="text-white font-bold text-lg">{order.details || "Unknown Items"}</h4>
                                                            <div className="text-emerald-400 font-mono font-bold mt-1 text-sm">{order.amount} {order.token}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Buyer Info</p>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <code className="text-xs text-slate-300 truncate flex-1">{order.from}</code>
                                                                <button onClick={() => copyToClipboard(order.from)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Copy className="w-3 h-3"/></button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> Delivery Address</p>
                                                            {order.shippingAddress ? (
                                                                <div className="relative group">
                                                                    <div className="text-xs text-slate-200 whitespace-pre-wrap">{order.shippingAddress}</div>
                                                                    <button onClick={() => copyToClipboard(order.shippingAddress)} className="absolute top-0 right-0 p-1 bg-slate-800 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-3 h-3"/></button>
                                                                </div>
                                                            ) : <span className="text-xs text-red-400 italic">- No Address Provided -</span>}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 pt-2 border-t border-slate-800 mt-2">
                                                        {(!order.status || order.status === 'Pending') && (
                                                            <>
                                                                <button onClick={() => updateOrderStatus(order.id, 'Approved')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors">
                                                                    <CheckSquare className="w-3 h-3" /> ยืนยันยอด/Approve
                                                                </button>
                                                                <button onClick={() => setRejectingOrderId(order.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors">
                                                                    <XCircle className="w-3 h-3" /> ปฏิเสธ/Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {order.status === 'Approved' && (
                                                            <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                                                                <Truck className="w-3 h-3" /> จัดส่งสินค้า/Ship
                                                            </button>
                                                        )}

                                                        {order.status === 'Shipped' && (
                                                            <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors">
                                                                <CheckCircle className="w-3 h-3" /> สำเร็จ/Complete
                                                            </button>
                                                        )}

                                                        {order.status === 'Rejected' && (
                                                            <div className="flex-1 flex flex-col gap-1">
                                                                <span className="text-center text-xs text-red-400 font-bold py-1 border border-red-500/20 bg-red-500/10 rounded">❌ Order Rejected</span>
                                                                {order.rejectionReason && <p className="text-[10px] text-slate-400 italic text-center">Reason: {order.rejectionReason}</p>}
                                                            </div>
                                                        )}
                                                        
                                                        <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors">Print Label</button>
                                                    </div>
                                                </div>

                                                {/* Slip Preview */}
                                                {order.slipImage ? (
                                                    <div className="w-full md:w-40 shrink-0 flex flex-col gap-2">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1"><FileText className="w-3 h-3"/> Payment Slip</p>
                                                        <a href={order.slipImage} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-lg border border-slate-700 hover:border-blue-500 transition-colors bg-black h-40">
                                                            <img src={order.slipImage} alt="Slip" className="w-full h-full object-contain" />
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ExternalLink className="w-6 h-6 text-white" />
                                                            </div>
                                                        </a>
                                                        <div className="text-[10px] text-emerald-400 text-center flex items-center justify-center gap-1 bg-emerald-900/20 py-1 rounded border border-emerald-900/50"><CheckCircle className="w-3 h-3"/> Validated</div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full md:w-40 shrink-0 flex flex-col justify-center items-center bg-slate-900/50 rounded-lg border border-dashed border-slate-700 h-40">
                                                        <ImageIcon className="w-8 h-8 text-slate-700 mb-2"/>
                                                        <span className="text-[10px] text-slate-500">No Slip Attached</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. PRODUCT MANAGEMENT */}
                        {adminSubTab === 'products' && (
                            <div className="space-y-6">
                                <div className={`p-6 rounded-2xl ${glassPanel}`}>
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        {editingProductId ? <Edit2 className="w-5 h-5 text-yellow-400"/> : <Plus className="w-5 h-5 text-emerald-400"/>} 
                                        {editingProductId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-400 ml-1">Product Name</label>
                                            <input type="text" placeholder="ชื่อสินค้า..." value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-400 ml-1">Price (ETH)</label>
                                            <input type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-400 ml-1">Category</label>
                                            <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}>
                                                {/* ✅ FIX: Use shopCategories state variable */}
                                                {shopCategories.filter(c => c !== "All").map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-400 ml-1">Stock Qty</label>
                                            <input type="number" placeholder="10" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs text-slate-400 ml-1">Image URL</label>
                                            <input type="text" placeholder="https://..." value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs text-slate-400 ml-1">Affiliate Link (Optional)</label>
                                            <input type="text" placeholder="e.g. Shopee/Lazada link..." value={newProduct.affiliateLink} onChange={(e) => setNewProduct({...newProduct, affiliateLink: e.target.value})} className={`w-full rounded-lg px-4 py-2 text-sm ${glassInput}`}/>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-6">
                                        {editingProductId && <button onClick={cancelEdit} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl font-bold transition-colors">ยกเลิก</button>}
                                        <button onClick={handleSaveProduct} className={`flex-1 text-white py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${editingProductId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                                            {editingProductId ? <><Save className="w-4 h-4"/> บันทึกการแก้ไข</> : <><Plus className="w-4 h-4"/> เพิ่มสินค้า</>}
                                        </button>
                                    </div>
                                </div>

                                <div className={`p-6 rounded-2xl ${glassPanel}`}>
                                    <h3 className="text-xl font-bold text-white mb-4"><Box className="w-5 h-5 inline mr-2 text-blue-400"/> รายการสินค้าในคลัง ({products.length})</h3>
                                    <div className="space-y-2">
                                        {products.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border bg-slate-950/50 border-slate-700/50 hover:border-slate-600 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-slate-800" alt=""/>
                                                    <div>
                                                        <p className="font-bold text-sm text-white">{p.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <span className="bg-slate-800 px-1.5 rounded">{p.category}</span>
                                                            <span>•</span>
                                                            <span className="text-emerald-400 font-mono">฿{p.priceTHB ? p.priceTHB.toLocaleString() : p.price}</span>
                                                            <span>•</span>
                                                            <span className={`${p.stock < 5 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>Stock: {p.stock}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => startEditProduct(p)} className="text-yellow-400 hover:bg-yellow-500/10 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                                                    <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. SETTINGS */}
                        {adminSubTab === 'settings' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-6 rounded-xl ${glassPanel}`}>
                                    <label className="block text-sm text-slate-400 mb-2">ค่าธรรมเนียมใหม่ (BPS)</label>
                                    <div className="flex gap-2"><input type="number" placeholder="20" value={newFee} onChange={(e) => setNewFee(e.target.value)} className={`flex-1 rounded-lg px-3 py-2 text-sm ${glassInput}`} /><button onClick={handleUpdateFee} className={`px-4 rounded-lg text-sm ${glassButton}`}>บันทึก</button></div>
                                </div>
                                <div className={`p-6 rounded-xl ${glassPanel}`}>
                                    <label className="block text-sm text-slate-400 mb-2">เปลี่ยน Treasury Wallet</label>
                                    <div className="flex gap-2"><input type="text" placeholder="0x..." value={newTreasury} onChange={(e) => setNewTreasury(e.target.value)} className={`flex-1 rounded-lg px-3 py-2 text-sm ${glassInput}`} /><button onClick={handleUpdateTreasury} className={`px-4 rounded-lg text-sm ${glassButton}`}>บันทึก</button></div>
                                </div>
                            </div>
                        )}
                        
                        {/* 5. MERCHANT REQUESTS (New Admin Feature) */}
                        {adminSubTab === 'merchants' && (
                             <div className={`p-6 rounded-xl ${glassPanel}`}>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-purple-400" /> Merchant Requests</h3>
                                <div className="space-y-3">
                                    {merchantRequests.length === 0 ? <p className="text-slate-500">ไม่มีคำขอ</p> : merchantRequests.map(req => (
                                        <div key={req.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                            <div>
                                                <h4 className="text-white font-bold">{req.shopName}</h4>
                                                <p className="text-xs text-slate-400">{req.shopDesc}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Wallet: {req.owner}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold mt-2 inline-block ${req.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{req.status}</span>
                                            </div>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateMerchantStatus(req.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs font-bold">Approve</button>
                                                    <button onClick={() => updateMerchantStatus(req.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg text-xs font-bold">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            )}
            
            {statusMsg && (<div className={`mt-6 p-4 rounded-xl border text-center animate-pulse ${statusType === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' : statusType === 'success' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' : 'bg-blue-900/20 border-blue-900/50 text-blue-400'}`}><span className="font-medium">{statusMsg}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
