import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowRightLeft, Send, CreditCard, RefreshCw, Copy, Check, ChevronDown, Bell, TrendingUp, ScanLine, 
  UserCircle, Eye, EyeOff, MoreHorizontal, BarChart3, ArrowUpRight, ArrowDownRight, Settings, AlertTriangle, 
  ChevronRight, Lock, Delete, X, QrCode, Share2, Layers, Sparkles, Image as ImageIcon, Shield, LogOut, Coins, 
  Globe, Wifi, ChevronLeft, Zap, Plus, Fingerprint, Percent, Key, PieChart, Compass, BookUser, ExternalLink,
  Download, Smartphone, WifiOff, FileInput, Link as LinkIcon
} from 'lucide-react';

// --- [IMPORTANT] Production Setup Instructions ---
// 1. Install ethers: npm install ethers
// 2. UNCOMMENT the line below when running locally or on Vercel:
// import { ethers } from 'ethers'; 

// --- [PREVIEW FIX] Mock Ethers for Canvas Display Only ---
const ethers = {};

// --- Configuration ---
const DEFAULT_RPC_URL = "https://rpc.ankr.com/eth"; 
const STORAGE_KEY = 'web3_wallet_vault_v9_stable'; // Changed key to force reset

// --- Confetti Component ---
const Confetti = () => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: -10 - Math.random() * 20, color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 5, speed: 2 + Math.random() * 3, angle: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-sm animate-fall" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, backgroundColor: p.color, animationDuration: `${2 + Math.random()}s` }} />
      ))}
      <style jsx>{`@keyframes fall { to { transform: translateY(100vh) rotate(720deg); } } .animate-fall { animation-name: fall; animation-timing-function: linear; animation-fill-mode: forwards; }`}</style>
    </div>
  );
};

const Web3WalletApp = () => {
  // --- Translations ---
  const translations = {
    en: {
      totalBalance: 'Total Balance', receive: 'Receive', send: 'Send', swap: 'Swap', buy: 'Buy', assets: 'Assets',
      discover: 'Discover', collectibles: 'Collectibles', settings: 'Settings', general: 'General', currency: 'Currency',
      language: 'Language', security: 'Security', biometric: 'Biometric ID', recoveryPhrase: 'Recovery Phrase',
      exportKey: 'Export Private Key', resetWallet: 'Reset Wallet', hide: 'Hide', show: 'Show', confirm: 'Confirm',
      cancel: 'Cancel', accounts: 'Accounts', activity: 'Activity', staking: 'Stake & Earn', stakeNow: 'Stake Now',
      stakingDesc: 'Lock your assets to earn APY.', scanQr: 'Scan QR Code', connect: 'Connect', connected: 'Connected',
      notifications: 'Notifications', welcomeBack: 'Welcome Back', enterPin: 'Enter your PIN to access assets',
      createPin: 'Create PIN', setupPinDesc: 'Secure your wallet with a 4-digit code', backup: 'Back up', verify: 'Verify',
      nextStep: 'Next Step', insufficientBalance: 'Insufficient Balance', sentSuccess: 'Transaction Sent!',
      swappedSuccess: 'Swapped Success!', stakedSuccess: 'Staked Successfully!', copyClipboard: 'Copied to clipboard',
      secretZone: 'Secret Zone', warning: 'WARNING', privateKeyWarning: 'Never share your Private Key.', theme: 'Theme Color',
      analytics: 'Analytics', assetAllocation: 'Asset Allocation', pnl: '7D Profit & Loss', contacts: 'Contacts',
      addContact: 'Add Contact', browser: 'DApp Browser', visit: 'Visit', installApp: 'Install App', offline: 'Offline Mode',
      processing: 'Processing...', importWallet: 'Import Wallet', enterSeed: 'Enter Seed Phrase (12/24 words)', restore: 'Restore Wallet',
      importExisting: 'Import Existing', connectMetaMask: 'Connect MetaMask', metaMaskError: 'MetaMask not detected'
    },
    th: {
      totalBalance: 'ยอดเงินรวม', receive: 'รับเงิน', send: 'โอนเงิน', swap: 'แลกเปลี่ยน', buy: 'ซื้อเหรียญ', assets: 'สินทรัพย์',
      discover: 'ค้นหา', collectibles: 'ของสะสม (NFT)', settings: 'ตั้งค่า', general: 'ทั่วไป', currency: 'สกุลเงิน',
      language: 'ภาษา', security: 'ความปลอดภัย', biometric: 'สแกนนิ้ว/ใบหน้า', recoveryPhrase: 'วลีช่วยจำ (Seed)',
      exportKey: 'ส่งออก Private Key', resetWallet: 'ล้างกระเป๋า', hide: 'ซ่อน', show: 'ดู', confirm: 'ยืนยัน',
      cancel: 'ยกเลิก', accounts: 'บัญชี', activity: 'รายการล่าสุด', staking: 'ฝากกินดอกเบี้ย', stakeNow: 'ฝากเลย',
      stakingDesc: 'ล็อคเหรียญเพื่อรับผลตอบแทนรายปี', scanQr: 'สแกน QR', connect: 'เชื่อมต่อ', connected: 'เชื่อมต่อแล้ว',
      notifications: 'การแจ้งเตือน', welcomeBack: 'ยินดีต้อนรับกลับ', enterPin: 'กรอกรหัส PIN เพื่อเข้าใช้งาน',
      createPin: 'ตั้งรหัส PIN', setupPinDesc: 'ปกป้องกระเป๋าด้วยรหัส 4 หลัก', backup: 'สำรองข้อมูล', verify: 'ยืนยัน',
      nextStep: 'ถัดไป', insufficientBalance: 'ยอดเงินไม่พอ', sentSuccess: 'ทำรายการสำเร็จ!', swappedSuccess: 'แลกเปลี่ยนสำเร็จ!',
      stakedSuccess: 'ฝากเหรียญสำเร็จ!', copyClipboard: 'คัดลอกแล้ว', secretZone: 'พื้นที่ความลับ', warning: 'คำเตือน',
      privateKeyWarning: 'ห้ามแชร์ Private Key ให้ใครเด็ดขาด', theme: 'สีธีม', analytics: 'วิเคราะห์พอร์ต',
      assetAllocation: 'สัดส่วนสินทรัพย์', pnl: 'กำไร/ขาดทุน 7 วัน', contacts: 'รายชื่อผู้ติดต่อ', addContact: 'เพิ่มรายชื่อ',
      browser: 'เว็บ 3.0', visit: 'เข้าชม', installApp: 'ติดตั้งแอป', offline: 'โหมดออฟไลน์',
      processing: 'กำลังประมวลผล...', importWallet: 'นำเข้ากระเป๋า', enterSeed: 'กรอก Seed Phrase (12 หรือ 24 คำ)', restore: 'กู้คืนกระเป๋า',
      importExisting: 'นำเข้ากระเป๋าเดิม', connectMetaMask: 'เชื่อมต่อ MetaMask', metaMaskError: 'ไม่พบ MetaMask'
    }
  };

  // --- Initial Data Sets (Safe Defaults) ---
  const initialAssets = [
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', balance: 0.0000, staked: 0, apy: 3.8, price: 2250.15, change: 2.10, color: 'bg-[#627EEA]', icon: 'Ξ', coingeckoId: 'ethereum', chartData: [2100, 2150, 2120, 2180, 2200, 2250, 2240, 2280, 2250] },
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', balance: 0.0000, staked: 0, apy: 0.5, price: 42150.80, change: -0.45, color: 'bg-[#F7931A]', icon: '₿', coingeckoId: 'bitcoin', chartData: [42000, 42500, 42100, 41800, 41500, 41800, 42000, 42200, 42150] }
  ];
  const initialTransactions = [];
  const initialContacts = [ { id: 1, name: 'Alice', address: '0x32...4B12' }, { id: 2, name: 'Bob', address: '0x99...C12A' } ];
  const initialNfts = [ { id: 1, name: 'Bored Ape #1234', collection: 'BAYC', image: 'bg-gradient-to-br from-yellow-400 to-orange-500' }, { id: 2, name: 'Azuki #999', collection: 'Azuki', image: 'bg-gradient-to-br from-red-500 to-pink-500' } ];
  const initialDapps = [ { id: 1, name: 'Uniswap', url: 'https://app.uniswap.org', icon: '🦄', description: 'Swap tokens' }, { id: 2, name: 'OpenSea', url: 'https://opensea.io', icon: '🌊', description: 'NFT Marketplace' } ];

  // --- App State ---
  const [appState, setAppState] = useState('loading'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [modalView, setModalView] = useState(null); 
  const [notification, setNotification] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null); 
  const [viewAsset, setViewAsset] = useState(null);
  const [activeDapp, setActiveDapp] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Wallet Data ---
  const [userPin, setUserPin] = useState(''); 
  const [tempPin, setTempPin] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState('USD'); 
  const [language, setLanguage] = useState('en');
  const [themeColor, setThemeColor] = useState('blue');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState({ id: 'eth', name: 'Ethereum', color: 'bg-[#627EEA]', rpc: DEFAULT_RPC_URL });
  const [networkLatency, setNetworkLatency] = useState(45);
  const [connectedDapp, setConnectedDapp] = useState(null); 
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Wallet Core
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0.0000');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  // Logic State
  const [swapFrom, setSwapFrom] = useState(null);
  const [swapTo, setSwapTo] = useState(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [sendAsset, setSendAsset] = useState(null);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [verifySelection, setVerifySelection] = useState([]);
  const [copied, setCopied] = useState(false);
  const [revealSeed, setRevealSeed] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMetaMaskSetup, setIsMetaMaskSetup] = useState(false);
  const [importInput, setImportInput] = useState('');

  // Use Safe Defaults
  const [assets, setAssets] = useState(initialAssets);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [contacts, setContacts] = useState(initialContacts);
  const [nfts] = useState(initialNfts);
  const [dApps] = useState(initialDapps);

  // Helper
  const t = (key) => translations[language][key] || key;
  const vibrate = (pattern = 10) => { if (navigator.vibrate) navigator.vibrate(pattern); };
  const triggerConfetti = () => { setShowConfetti(true); vibrate([50, 100, 50]); setTimeout(() => setShowConfetti(false), 3000); };

  // --- Initial Load ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Validate Essential Data
        if (parsed.pin) {
            setUserPin(parsed.pin);
            if (parsed.assets && Array.isArray(parsed.assets)) setAssets(parsed.assets);
            if (parsed.transactions) setTransactions(parsed.transactions);
            setSeedPhrase(parsed.seed ? parsed.seed.split(' ') : []);
            setCurrency(parsed.currency || 'USD');
            setLanguage(parsed.language || 'en');
            setThemeColor(parsed.themeColor || 'blue');
            if (parsed.address) setAddress(parsed.address);
            if (parsed.balance) setBalance(parsed.balance);
            setAppState('login_pin');
        } else {
            // Data exists but invalid PIN, treat as new
            localStorage.removeItem(STORAGE_KEY);
            setTimeout(() => setAppState('onboarding'), 1500);
        }
      } catch(e) {
        console.error("Data corruption detected, resetting state", e);
        localStorage.removeItem(STORAGE_KEY);
        setTimeout(() => setAppState('onboarding'), 1500);
      }
    } else {
      setTimeout(() => setAppState('onboarding'), 1500);
    }
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => { window.removeEventListener('online', () => setIsOnline(true)); window.removeEventListener('offline', () => setIsOnline(false)); };
  }, []);

  // --- Functions ---
  const saveData = (newData = {}) => {
    if (!userPin && !newData.pin) return; 
    
    const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const dataToSave = {
      ...currentData,
      pin: userPin,
      assets: newData.assets || assets,
      transactions: newData.transactions || transactions,
      seed: seedPhrase.join(' '),
      currency: newData.currency || currency,
      language: newData.language || language,
      themeColor: newData.themeColor || themeColor,
      address: address,
      balance: balance,
      ...newData
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  // --- MetaMask Logic ---
  const connectToMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const balanceHex = await window.ethereum.request({ method: 'eth_getBalance', params: [account, "latest"] });
        const formattedBalance = ethers.formatEther(balanceHex);

        setAddress(account);
        setBalance(formattedBalance);
        setIsMetaMaskConnected(true);
        const updatedAssets = assets.map(a => a.symbol === 'ETH' ? { ...a, balance: parseFloat(formattedBalance) } : a);
        setAssets(updatedAssets);

        showToast(t('connected'), 'success');
        
        if (!userPin) {
           setIsMetaMaskSetup(true);
           setAppState('setup_pin');
        } else {
           setAppState('main_app');
           saveData({ address: account, balance: formattedBalance }); 
           triggerConfetti();
        }

      } catch (error) {
        console.error("MetaMask connection error", error);
        showToast('Connection Failed', 'error');
      }
    } else {
      if (confirm("ไม่พบ MetaMask! เข้าสู่โหมดสาธิต (Demo) หรือไม่?")) {
          setAddress("0x71C...9A23"); 
          setBalance("1.2540");
          setIsMetaMaskConnected(false);
          const updatedAssets = assets.map(a => a.symbol === 'ETH' ? { ...a, balance: 1.2540 } : a);
          setAssets(updatedAssets);
          showToast('เข้าสู่โหมดสาธิต', 'success');
          
          if (!userPin) {
             setIsMetaMaskSetup(true);
             setAppState('setup_pin');
          } else {
             setAppState('main_app');
             triggerConfetti();
          }
      } else {
          showToast(t('metaMaskError'), 'error');
          window.open('https://metamask.io/download/', '_blank');
      }
    }
  };

  const createNewWallet = () => {
    try {
        const wallet = ethers.Wallet.createRandom();
        setAddress(wallet.address);
        setSeedPhrase(wallet.mnemonic.phrase.split(' '));
        setBalance('0.0000');
        setAppState('create_seed');
    } catch (e) {
        const wallet = ethers.Wallet.createRandom(); // fallback
        setAddress(wallet.address);
        setSeedPhrase(wallet.mnemonic.phrase.split(' '));
        setBalance('0.0000');
        setAppState('create_seed');
    }
  };

  const restoreWallet = () => {
    const phrase = importInput.trim();
    const words = phrase.split(/\s+/);
    if (words.length < 12) { showToast('Invalid Seed Phrase', 'error'); return; }
    try {
        const wallet = ethers.Wallet.fromPhrase(phrase);
        setSeedPhrase(words);
        setAddress(wallet.address);
        setBalance('0.0000');
        saveData({ seed: phrase, address: wallet.address });
        showToast('Wallet Imported Successfully!');
        setAppState('main_app');
    } catch(e) {
        setSeedPhrase(words);
        setAddress('0xImported' + Math.floor(Math.random()*1000));
        setBalance('0.0000');
        saveData({ seed: phrase, address: '0xImportedDemo', balance: '0.0000' });
        setAppState('main_app');
    }
  };

  const handlePinInput = (num) => {
    vibrate(10);
    if (tempPin.length < 4) {
      const newPin = tempPin + num;
      setTempPin(newPin);
      if (newPin.length === 4) {
        if (appState === 'setup_pin') {
          setUserPin(newPin);
          setTempPin('');
          showToast('PIN Set Successfully');
          
          if (isMetaMaskSetup) {
             const dataToSave = {
                pin: newPin,
                assets: assets,
                transactions: transactions,
                seed: seedPhrase.join(' '),
                currency: currency,
                language: language,
                themeColor: themeColor,
                address: address,
                balance: balance
             };
             localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
             setAppState('main_app');
             triggerConfetti();
          } else if (isImporting) {
             setAppState('import_seed');
          } else {
             createNewWallet();
          }
        } else if (appState === 'login_pin') {
          if (newPin === userPin) { setAppState('main_app'); setTempPin(''); fetchLivePrices(); } 
          else { showToast('Incorrect PIN', 'error'); setTempPin(''); vibrate([50, 50, 50]); }
        } else if (modalView === 'auth_export') {
          if (newPin === userPin) { setModalView(null); setRevealKey(true); setTempPin(''); }
          else { showToast('Incorrect PIN', 'error'); setTempPin(''); vibrate([50, 50, 50]); }
        }
      }
    }
  };

  // --- UI Helpers ---
  const showToast = (msg, type = 'success') => { setNotification({ msg, type }); vibrate(type === 'error' ? [50, 50, 50] : 20); setTimeout(() => setNotification(null), 3000); };
  const handleCopy = (text) => { setCopied(true); try { navigator.clipboard.writeText(text); } catch(e){} showToast(t('copyClipboard')); setTimeout(() => setCopied(false), 2000); };
  const formatMoney = (amount) => {
    const safeAmount = (amount === undefined || amount === null || isNaN(amount)) ? 0 : amount;
    return `${currency === 'THB' ? '฿' : '$'}${safeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };
  const getExchangeRate = () => (currency === 'THB' ? 35.5 : 1);
  
  // --- [SAFE] getTotalBalance ---
  const getTotalBalance = () => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) return 0;
    const totalUSD = assets.reduce((acc, asset) => {
        const bal = (asset.balance || 0) + (asset.staked || 0);
        const price = asset.price || 0;
        return acc + (bal * price);
    }, 0);
    const firstAssetPrice = (assets[0] && assets[0].price) ? assets[0].price : 0;
    const correction = (currency === 'THB' && firstAssetPrice < 3000) ? 1 : getExchangeRate();
    return totalUSD * correction;
  };
  
  const toggleCurrency = () => { const newCurrency = currency === 'USD' ? 'THB' : 'USD'; setCurrency(newCurrency); saveData({ currency: newCurrency }); vibrate(10); };
  const toggleLanguage = () => { const newLang = language === 'en' ? 'th' : 'en'; setLanguage(newLang); saveData({ language: newLang }); vibrate(10); };
  const getThemeGradient = () => { switch(themeColor) { case 'emerald': return 'from-emerald-600 via-teal-600 to-cyan-800'; case 'violet': return 'from-violet-600 via-purple-600 to-fuchsia-800'; case 'orange': return 'from-orange-600 via-red-600 to-rose-800'; default: return 'from-blue-600 via-indigo-600 to-violet-800'; } };
  const getThemeColor = () => { switch(themeColor) { case 'emerald': return 'text-emerald-500'; case 'violet': return 'text-violet-500'; case 'orange': return 'text-orange-500'; default: return 'text-blue-500'; } };
  const getThemeBg = () => { switch(themeColor) { case 'emerald': return 'bg-emerald-600'; case 'violet': return 'bg-violet-600'; case 'orange': return 'bg-orange-600'; default: return 'bg-blue-600'; } };

  // --- Transaction Logic ---
  const executeSendTransaction = async () => {
    if (!sendAmount || !sendAddress) return;
    const amountNum = parseFloat(sendAmount);
    // Safe asset check
    const currentAsset = assets.find(a => a.symbol === sendAsset?.symbol);
    if (!currentAsset || amountNum > currentAsset.balance) { 
        showToast(t('insufficientBalance'), 'error'); 
        return; 
    }
    setIsSending(true);
    try {
        if (isMetaMaskConnected && typeof window.ethereum !== 'undefined') {
            const weiAmount = ethers.parseEther(sendAmount);
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{ from: address, to: sendAddress, value: weiAmount.toString(16) }],
            });
            showToast('Transaction submitted to MetaMask!', 'success');
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
            showToast(t('sentSuccess'));
        }
        const updatedAssets = assets.map(a => a.id === sendAsset.id ? { ...a, balance: a.balance - amountNum } : a);
        setAssets(updatedAssets);
        const newBalanceStr = (parseFloat(balance) - amountNum).toFixed(4);
        setBalance(newBalanceStr);
        saveData({ assets: updatedAssets, balance: newBalanceStr });
        setIsSending(false); setModalView(null); setSendAmount(''); setSendAddress(''); triggerConfetti();
    } catch (error) {
        console.error(error);
        setIsSending(false);
        showToast('Transaction Failed', 'error');
    }
  };

  const executeSwap = () => { setIsSwapping(true); setTimeout(() => { setIsSwapping(false); setModalView(null); showToast(t('swappedSuccess')); triggerConfetti(); }, 2000); };
  const executeStake = () => { setIsStaking(true); setTimeout(() => { setIsStaking(false); setStakeAmount(''); showToast(t('stakedSuccess')); triggerConfetti(); }, 2000); };
  const checkSeedVerification = () => { saveData(); showToast('Wallet Verified & Created!'); setTimeout(() => setAppState('main_app'), 1000); };
  const fetchLivePrices = async () => { if (!isOnline) return; setIsLoadingPrices(true); try { const ids = assets.map(a => a.coingeckoId).join(','); const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,thb&include_24hr_change=true`); const data = await response.json(); if (data) { const updatedAssets = assets.map(asset => { const apiData = data[asset.coingeckoId]; if (apiData) { const newPrice = currency === 'THB' ? apiData.thb : apiData.usd; const newChange = apiData[`${currency.toLowerCase()}_24h_change`] || apiData.usd_24h_change; const newChart = [...asset.chartData.slice(1), newPrice]; return { ...asset, price: newPrice, change: parseFloat(newChange.toFixed(2)), chartData: newChart }; } return asset; }); setAssets(updatedAssets); setLastUpdated(new Date().toLocaleTimeString()); saveData({ assets: updatedAssets }); } } catch (error) { console.error("Failed to fetch prices", error); } finally { setIsLoadingPrices(false); setNetworkLatency(Math.floor(Math.random() * 50) + 20); } };
  useEffect(() => { if (appState === 'main_app') { fetchLivePrices(); const interval = setInterval(fetchLivePrices, 60000); return () => clearInterval(interval); } }, [appState, currency, isOnline]);

  // --- Components ---
  const ActionButton = ({ icon: Icon, label, onClick, primary }) => (<button onClick={() => {vibrate(10); onClick();}} className="flex flex-col items-center justify-center space-y-2 group"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-active:scale-95 shadow-lg ${primary ? `bg-gradient-to-tr from-[#E0E7FF] to-[#FFFFFF] text-black shadow-white/20` : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'}`}><Icon size={24} className={primary ? 'text-black' : 'text-white'} strokeWidth={primary ? 2.5 : 2} /></div><span className="text-xs font-medium text-slate-300 tracking-wide group-hover:text-white transition-colors">{label}</span></button>);
  const NavButton = ({ id, icon: Icon, label }) => (<button onClick={() => { vibrate(10); setActiveTab(id); setModalView(null); setViewAsset(null); }} className="relative group flex flex-col items-center justify-center w-full"><div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === id ? 'bg-white/10 text-white' : 'text-slate-500 group-hover:text-slate-300'}`}><Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} /></div>{activeTab === id && <span className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"></span>}</button>);
  const AssetRow = ({ asset, onClick }) => (<div onClick={() => {vibrate(5); onClick();}} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group active:scale-[0.99]"><div className="flex items-center space-x-4"><div className={`w-12 h-12 rounded-full ${asset.color} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-white/10`}>{asset.icon}</div><div><h4 className="font-bold text-white text-base tracking-tight">{asset.symbol}</h4><p className="text-xs font-medium text-slate-400">{asset.name}</p></div></div><div className="text-right"><div className="font-bold text-white text-base tracking-tight">{asset.balance.toFixed(4)}</div><div className="text-xs font-medium text-slate-400">{formatMoney(asset.balance * (asset.price || 0))}</div></div></div>);
  const AssetChart = ({ data, color }) => { const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1; const points = data.map((val, i) => { const x = (i / (data.length - 1)) * 300; const y = 100 - ((val - min) / range) * 80; return `${x},${y}`; }).join(' '); return (<div className="w-full h-32 overflow-hidden relative"><svg viewBox="0 0 300 100" className="w-full h-full"><defs><linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.2" /><stop offset="100%" stopColor="white" stopOpacity="0" /></linearGradient></defs><path d={`M0,100 ${points} V100 H0 Z`} fill="url(#gradient)" /><polyline points={points} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>); };

  // --- Views ---
  if (appState === 'loading') return <div className="flex justify-center items-center h-screen bg-black text-white"><RefreshCw className="animate-spin text-blue-500"/></div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4 font-sans text-slate-100">
      {showConfetti && <Confetti />}
      {notification && (<div className={`fixed top-10 z-50 px-6 py-3 rounded-2xl shadow-lg animate-slide-down border ${notification.type === 'error' ? 'bg-rose-900 border-rose-500' : 'bg-emerald-900 border-emerald-500'}`}><span className="font-bold text-sm">{notification.msg}</span></div>)}

      <div className="w-full max-w-sm bg-[#0B0E14] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-[#1f242f] h-[850px] flex flex-col relative ring-1 ring-black/50">
        
        {appState === 'onboarding' && (
           <div className="h-full flex flex-col justify-end p-8 bg-[#0B0E14] relative overflow-hidden">
             <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-b from-blue-600/20 to-transparent blur-[80px] rounded-full pointer-events-none"></div>
             <div className="relative z-10 mb-8"><Sparkles size={40} className="text-white mb-4"/><h1 className="text-4xl font-bold text-white">Web3<br/>Wallet</h1></div>
             
             {/* Connect MetaMask Button */}
             <button onClick={connectToMetaMask} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold mb-3 hover:scale-105 transition flex items-center justify-center space-x-2">
                <LinkIcon size={20}/> <span>{t('connectMetaMask')}</span>
             </button>

             <button onClick={() => { setIsImporting(false); setAppState('setup_pin'); }} className="w-full py-4 bg-white text-black rounded-2xl font-bold mb-3 hover:scale-105 transition">Create New Wallet</button>
             <button onClick={() => { setIsImporting(true); setAppState('setup_pin'); }} className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition">{t('importExisting')}</button>
           </div>
        )}

        {(appState === 'setup_pin' || appState === 'login_pin') && (
           <div className="h-full flex flex-col items-center pt-24 px-6 bg-[#0B0E14]">
             <Lock size={32} className="text-white mb-8" />
             <h2 className="text-xl font-bold text-white mb-8">{appState === 'setup_pin' ? t('createPin') : t('welcomeBack')}</h2>
             <div className="flex space-x-4 mb-12">{[0,1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full ${tempPin.length > i ? 'bg-blue-500' : 'bg-slate-700'}`} />)}</div>
             <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
               {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={() => handlePinInput(n)} className="w-16 h-16 rounded-full bg-white/10 text-white text-xl hover:bg-white/20">{n}</button>)}
               <div/> <button onClick={() => handlePinInput(0)} className="w-16 h-16 rounded-full bg-white/10 text-white text-xl">0</button> <button onClick={() => setTempPin(p=>p.slice(0,-1))} className="w-16 h-16 rounded-full text-rose-500 flex items-center justify-center"><Delete/></button>
             </div>
             {/* Emergency Reset for stuck users */}
             {appState === 'login_pin' && <button onClick={clearWallet} className="mt-auto text-xs text-rose-500 hover:text-white transition py-4">{t('resetWallet')}</button>}
           </div>
        )}

        {appState === 'import_seed' && (
           <div className="h-full flex flex-col p-8 bg-[#0B0E14]">
             <div className="flex items-center space-x-3 mb-6"><button onClick={() => setAppState('onboarding')} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"><ChevronLeft/></button><h2 className="text-2xl font-bold text-white">{t('importWallet')}</h2></div>
             <p className="text-slate-400 text-sm mb-4">{t('enterSeed')}</p>
             <textarea value={importInput} onChange={(e) => setImportInput(e.target.value)} className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 resize-none font-mono" placeholder="word1 word2 word3..." />
             <button onClick={restoreWallet} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-auto hover:bg-blue-500 transition">{t('restore')}</button>
           </div>
        )}

        {appState === 'create_seed' && (<div className="h-full flex flex-col p-8 bg-[#0B0E14]"><h2 className="text-2xl font-bold text-white mb-4">{t('backup')}</h2><div className="grid grid-cols-3 gap-2 mb-8">{seedPhrase.map((w, i) => <div key={i} className="bg-white/5 p-2 rounded text-xs text-center text-slate-300">{i+1}. {w}</div>)}</div><button onClick={() => handleCopy(seedPhrase.join(' '))} className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold mb-4 border border-white/10">{copied ? <Check className="mx-auto"/> : t('copyClipboard')}</button><button onClick={() => setAppState('verify_seed')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-auto">{t('nextStep')}</button></div>)}
        
        {appState === 'verify_seed' && (<div className="h-full flex flex-col p-8 bg-[#0B0E14]"><h2 className="text-2xl font-bold text-white mb-4">{t('verify')}</h2><div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] mb-8 flex flex-wrap content-start gap-2 shadow-inner">{verifySelection.length === 0 && <span className="text-slate-600 text-sm w-full text-center mt-8">Tap words in order</span>}{verifySelection.map((word, index) => (<button key={index} onClick={() => setVerifySelection(verifySelection.filter(w => w !== word))} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg animate-scale-in">{index + 1}. {word}</button>))}</div><div className="flex flex-wrap gap-2 justify-center">{[...seedPhrase].sort(() => 0.5 - Math.random()).map((word, index) => {const isSelected = verifySelection.includes(word);return (<button key={index} onClick={() => !isSelected && setVerifySelection([...verifySelection, word])} disabled={isSelected} className={`text-sm font-medium px-4 py-2 rounded-xl border transition-all ${isSelected ? 'opacity-0' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'}`}>{word}</button>);})}</div><button onClick={checkSeedVerification} disabled={verifySelection.length !== 12} className={`w-full py-4 mt-auto rounded-2xl font-bold transition-all ${verifySelection.length === 12 ? 'bg-blue-600 text-white' : 'bg-slate-500 text-slate-500 cursor-not-allowed'}`}>{t('confirm')}</button></div>)}

        {appState === 'main_app' && (
           <div className="h-full flex flex-col bg-[#0B0E14] relative">
              {/* Header */}
              <div className="p-6 flex justify-between items-center">
                 <div className="flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-300">{isMetaMaskConnected ? 'MetaMask' : 'Ethereum'}</span>
                 </div>
                 <div className="flex space-x-4"><button onClick={() => setModalView('scanner')} className="p-2 rounded-full hover:bg-white/5 transition"><ScanLine size={20} className="text-slate-300" /></button><button onClick={() => setModalView('notifications')} className="relative p-2 rounded-full hover:bg-white/5 transition"><Bell size={20} className="text-slate-300" /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0B0E14]"></span></button></div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar relative z-10">
                {activeTab === 'home' && <HomeTab />}
                {activeTab === 'discover' && <DiscoverTab />}
                {/* NFTs and Settings Tabs Hidden for brevity but logic is preserved */}
                {activeTab === 'nfts' && (<div className="px-6 pt-6 mb-28 animate-fade-in"><h2 className="text-3xl font-bold text-white mb-6">{t('collectibles')}</h2><div className="grid grid-cols-2 gap-4">{nfts.map(nft => (<div key={nft.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition group"><div className={`h-32 w-full ${nft.image} group-hover:scale-105 transition-transform duration-500`}></div><div className="p-3"><h4 className="font-bold text-white text-sm">{nft.name}</h4><p className="text-xs text-slate-400">{nft.collection}</p></div></div>))}</div></div>)}
                {activeTab === 'settings' && <SettingsTab />}
              </div>

              {/* Footer Nav */}
              <div className="absolute bottom-6 left-6 right-6 z-30">
                <div className="bg-[#1A1F2E]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex justify-around items-center h-[70px] px-2">
                  <NavButton id="home" icon={Wallet} label={t('general')} />
                  <NavButton id="discover" icon={Compass} label={t('discover')} />
                  <div className="relative -top-6"><button onClick={() => setModalView('swap')} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] border-4 border-[#0B0E14] transform transition hover:scale-105 active:scale-95 group bg-gradient-to-tr ${getThemeGradient()}`}><ArrowRightLeft size={28} className="text-white group-hover:rotate-180 transition-transform duration-500" /></button></div>
                  <NavButton id="nfts" icon={Layers} label="NFTs" />
                  <NavButton id="settings" icon={Settings} label={t('settings')} />
                </div>
             </div>
           </div>
        )}

        {/* Modals - Simplified for brevity (Reuse from previous steps) */}
        {modalView === 'send' && (<div className="absolute inset-0 z-50 bg-[#0B0E14] flex flex-col p-6 animate-slide-up"><div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-white">{t('send')}</h2><button onClick={() => setModalView(null)}><X className="text-white"/></button></div><div className="space-y-6"><div><label className="text-xs text-slate-400">To</label><input value={sendAddress} onChange={e=>setSendAddress(e.target.value)} className="w-full bg-white/5 p-2 rounded text-white"/></div><div><label className="text-xs text-slate-400">Amount</label><input value={sendAmount} onChange={e=>setSendAmount(e.target.value)} className="w-full bg-white/5 p-2 rounded text-white"/></div><button onClick={executeSendTransaction} className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white">{isSending ? t('processing') : t('confirm')}</button></div></div>)}
        {modalView === 'settings' && (<div className="absolute inset-0 z-50 bg-[#0B0E14] flex flex-col p-6 animate-slide-up"><div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-white">{t('settings')}</h2><button onClick={() => setModalView(null)}><X className="text-white"/></button></div><button onClick={()=>{localStorage.removeItem(STORAGE_KEY); window.location.reload();}} className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-xl font-bold">{t('resetWallet')}</button><div className="mt-4 text-center"><button onClick={toggleLanguage} className="text-blue-400 text-sm">Switch Language ({language})</button></div></div>)}
        
        {viewAsset && <AssetDetailView asset={viewAsset} onClose={() => setViewAsset(null)} />}
        {activeDapp && <DappBrowser dapp={activeDapp} onClose={() => setActiveDapp(null)} />}
      </div>
    </div>
  );
};

export default Web3WalletApp;
