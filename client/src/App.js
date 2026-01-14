import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  ShieldCheck, UploadCloud, FileText, Activity, Lock, Cpu, 
  CheckCircle2, ExternalLink, Wallet, Search, Hash 
} from 'lucide-react';
import { simpleStorageAbi } from './abis';
import { uploadToPinata, hashFile } from './updateToPinata';

const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {
  // State chung
  const [account, setAccount] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);

  // State Upload
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // State Verify
  const [verifyTab, setVerifyTab] = useState('file'); // 'file' hoặc 'hash'
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyHashInput, setVerifyHashInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (e) { console.error("User denied account access"); }
    } else {
      alert("Vui lòng cài đặt Metamask!");
    }
  };

  const getContract = async (needSigner = false) => {
    if (!window.ethereum) throw new Error('Metamask chưa được cài đặt!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    return needSigner
      ? new ethers.Contract(contractAddr, simpleStorageAbi, await provider.getSigner())
      : new ethers.Contract(contractAddr, simpleStorageAbi, provider);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadResult(null);
    try {
      setUploadStatus('Hashing file...');
      const documentHash = await hashFile(file);

      setUploadStatus('IPFS Uploading...');
      const { cid, url } = await uploadToPinata(file);

      setUploadStatus('Confirming Transaction...');
      const contract = await getContract(true);
      const metadata = JSON.stringify({ filename: file.name, size: file.size, type: file.type });

      const tx = await contract.uploadDocument(documentHash, cid, metadata);
      await tx.wait();

      setUploadResult({ hash: documentHash, cid, url, txHash: tx.hash });
      setUploadStatus('Successfully Anchored!');
      fetchTotalDocs();
    } catch (e) {
      setUploadStatus(`Error: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    setVerifyStatus('');

    try {
      let targetHash = "";
      if (verifyTab === 'file') {
        if (!verifyFile) throw new Error('Vui lòng chọn file!');
        targetHash = await hashFile(verifyFile);
      } else {
        if (!verifyHashInput) throw new Error('Vui lòng nhập mã Hash!');
        targetHash = verifyHashInput.trim();
      }

      const contract = await getContract(false);
      const exists = await contract.documentExists(targetHash);
      
      if (!exists) {
        setVerifyStatus('Not Found: This document is not registered on-chain.');
        return;
      }

      const [ipfsCID, uploader, timestamp, metadata] = await contract.getDocument(targetHash);
      setVerifyResult({
        hash: targetHash,
        ipfsCID,
        uploader,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        metadata: JSON.parse(metadata)
      });
      setVerifyStatus('Identity Verified!');
    } catch (e) {
      setVerifyStatus(`Error: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchTotalDocs = async () => {
    try {
      if (!window.ethereum) return;
      const contract = await getContract(false);
      const total = await contract.getTotalDocuments();
      setTotalDocs(Number(total));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTotalDocs(); }, []);

  return (
    <div className="app-container">
      {/* Background FX */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="grid-overlay"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <ShieldCheck className="text-blue-500 icon-glow" size={32} />
          <span>SHARE<span className="text-blue-500">DOC</span></span>
        </div>
        <button onClick={connectWallet} className="connect-wallet">
          <Wallet size={18} />
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </nav>

      <main className="main-content">
        {/* Hero Section */}
        <header className="hero animate-in">
          <h1>Secure Your Digital <span className="gradient-text">Legacy</span></h1>
          <p className="hero-subtitle">Bảo mật tuyệt đối, xác minh tức thì trên nền tảng Blockchain & IPFS.</p>
          
          <div className="stats-bar">
            <div className="stat-item">
              <Activity size={20} className="text-green-400" />
              <span>Total Secured: <strong>{totalDocs}</strong></span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <Cpu size={20} className="text-purple-400" />
              <span>Network: <strong>Hardhat Node</strong></span>
            </div>
          </div>
        </header>

        <div className="grid-container">
          {/* UPLOAD CARD */}
          <div className="glass-card upload-section animate-delay-1">
            <div className="card-header">
              <div className="icon-wrapper blue"><UploadCloud size={24} /></div>
              <h2>Anchor New Asset</h2>
            </div>
            
            <div className="file-dropzone">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} id="file-upload" />
              <label htmlFor="file-upload">
                <FileText size={48} className="mb-2 opacity-20" />
                <p>{file ? file.name : "Kéo thả file hoặc nhấn để chọn"}</p>
                {file && <span className="file-size">{(file.size/1024).toFixed(1)} KB</span>}
              </label>
            </div>

            <button onClick={handleUpload} disabled={isUploading || !file} className={`action-btn ${isUploading ? 'loading' : ''}`}>
              {isUploading ? <span className="loader-text">{uploadStatus}</span> : 'Register to Blockchain'}
            </button>

            {uploadResult && (
              <div className="result-box success animate-in">
                <div className="flex-center gap-2 text-green-400 mb-2">
                  <CheckCircle2 size={16} /> <span>Transaction Confirmed</span>
                </div>
                <p className="truncate-text">Hash: {uploadResult.hash}</p>
                <a href={uploadResult.url} target="_blank" rel="noreferrer" className="link-btn">
                  View on IPFS <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          {/* VERIFY CARD */}
          <div className="glass-card verify-section animate-delay-2">
            <div className="card-header">
              <div className="icon-wrapper purple"><Search size={24} /></div>
              <h2>Verify Authenticity</h2>
            </div>

            <div className="tab-container">
              <button className={`tab-btn ${verifyTab === 'file' ? 'active' : ''}`} onClick={() => setVerifyTab('file')}>
                <FileText size={16} /> By File
              </button>
              <button className={`tab-btn ${verifyTab === 'hash' ? 'active' : ''}`} onClick={() => setVerifyTab('hash')}>
                <Hash size={16} /> By Hash
              </button>
            </div>

            <div className="tab-content">
              {verifyTab === 'file' ? (
                <div className="file-dropzone verify-zone animate-in">
                  <input type="file" onChange={(e) => setVerifyFile(e.target.files[0])} id="file-verify" />
                  <label htmlFor="file-verify">
                    <p>{verifyFile ? verifyFile.name : "Chọn file gốc để đối chiếu"}</p>
                  </label>
                </div>
              ) : (
                <div className="hash-input-wrapper animate-in">
                  <input 
                    type="text" 
                    placeholder="Dán mã Hash (0x...) vào đây" 
                    className="cyber-input"
                    value={verifyHashInput}
                    onChange={(e) => setVerifyHashInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button onClick={handleVerify} disabled={isVerifying} className="action-btn secondary">
              {isVerifying ? 'Scanning Ledger...' : 'Verify Identity'}
            </button>

            {verifyStatus && !verifyResult && <div className="status-msg animate-in">{verifyStatus}</div>}

            {verifyResult && (
              <div className="result-box verified animate-in">
                <h3 className="verified-title"><Lock size={18} /> Valid Integrity</h3>
                <div className="verify-details">
                  <div className="detail"><label>Uploader:</label> <span className="truncate-text">{verifyResult.uploader}</span></div>
                  <div className="detail"><label>Timestamp:</label> <span>{verifyResult.timestamp}</span></div>
                  <div className="detail"><label>File Name:</label> <span>{verifyResult.metadata.filename}</span></div>
                  <div className="detail"><label>Storage:</label> <a href={`https://gateway.pinata.cloud/ipfs/${verifyResult.ipfsCID}`} target="_blank" rel="noreferrer" className="link">IPFS Link</a></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;