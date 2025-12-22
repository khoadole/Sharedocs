import './App.css';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { simpleStorageAbi } from './abis';
import { uploadToPinata, hashFile } from './updateToPinata';

const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  const [verifyHash, setVerifyHash] = useState('');
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('');

  const [totalDocs, setTotalDocs] = useState(0);

  const getContract = async (needSigner = false) => {
    if (!window.ethereum) {
      throw new Error('Metamask chưa được cài đặt!');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (needSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddr, simpleStorageAbi, signer);
    }
    return new ethers.Contract(contractAddr, simpleStorageAbi, provider);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus('');
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Vui lòng chọn file trước!');
      return;
    }

    try {
      setUploadStatus('Đang tạo hash file...');
      const documentHash = await hashFile(file);

      setUploadStatus('Đang upload lên IPFS...');
      const { cid, url } = await uploadToPinata(file);

      setUploadStatus('Đang ghi lên blockchain...');
      const contract = await getContract(true);

      const metadata = JSON.stringify({
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      });

      const tx = await contract.uploadDocument(documentHash, cid, metadata);

      setUploadStatus('Đang chờ xác nhận transaction...');
      await tx.wait();

      setUploadStatus('Upload thành công!');
      setUploadResult({
        hash: documentHash,
        cid: cid,
        url: url,
        txHash: tx.hash
      });

      await fetchTotalDocs();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Lỗi: ${error.message}`);
    }
  };

  const handleVerify = async () => {
    if (!verifyHash) {
      setVerifyStatus('Vui lòng nhập hash!');
      return;
    }

    try {
      setVerifyStatus('Đang kiểm tra...');
      const contract = await getContract(false);
      const exists = await contract.documentExists(verifyHash);

      if (!exists) {
        setVerifyStatus('Document không tồn tại!');
        setVerifyResult(null);
        return;
      }

      const [ipfsCID, uploader, timestamp, metadata] = await contract.getDocument(verifyHash);

      setVerifyStatus('Document hợp lệ!');
      setVerifyResult({
        hash: verifyHash,
        ipfsCID: ipfsCID,
        uploader: uploader,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        metadata: JSON.parse(metadata)
      });

    } catch (error) {
      console.error('Verify error:', error);
      setVerifyStatus(`Lỗi: ${error.message}`);
    }
  };

  const handleVerifyByFile = async () => {
    if (!verifyFile) {
      setVerifyStatus('Vui lòng chọn file cần verify!');
      return;
    }

    try {
      setVerifyStatus('Đang hash file tại máy local...');
      const fileHash = await hashFile(verifyFile);
      setVerifyHash(fileHash);

      setVerifyStatus('Đang kiểm tra trên blockchain...');
      const contract = await getContract(false);
      const exists = await contract.documentExists(fileHash);

      if (!exists) {
        setVerifyStatus('File này CHƯA ĐƯỢC ĐĂNG KÝ hoặc ĐÃ BỊ CHỈNH SỬA');
        setVerifyResult(null);
        return;
      }

      const [ipfsCID, uploader, timestamp, metadata] = await contract.getDocument(fileHash);

      setVerifyStatus('File HỢP LỆ! Chưa bị chỉnh sửa.');
      setVerifyResult({
        hash: fileHash,
        ipfsCID: ipfsCID,
        uploader: uploader,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        metadata: JSON.parse(metadata)
      });

    } catch (error) {
      console.error('Verify by file error:', error);
      setVerifyStatus(`Lỗi: ${error.message}`);
    }
  };

  const fetchTotalDocs = async () => {
    try {
      const contract = await getContract(false);
      const total = await contract.getTotalDocuments();
      setTotalDocs(Number(total));
    } catch (error) {
      console.error('Error fetching total:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    fetchTotalDocs();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Verification</h1>
        <p>Tổng số documents: <strong>{totalDocs}</strong></p>

        <div className="section">
          <h2>Upload Document</h2>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ marginBottom: '10px' }}
          />
          {file && (
            <p>File: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          )}
          <button onClick={handleUpload} disabled={!file}>
            Upload to Blockchain
          </button>
          {uploadStatus && <p>{uploadStatus}</p>}
          {uploadResult && (
            <div className="result">
              <h3>Kết quả Upload</h3>
              <p><strong>Hash:</strong> <code>{uploadResult.hash}</code></p>
              <p><strong>IPFS CID:</strong> {uploadResult.cid}</p>
              <p><strong>TX Hash:</strong> <code>{uploadResult.txHash}</code></p>
              <a href={uploadResult.url} target="_blank" rel="noopener noreferrer">
                Xem file trên IPFS
              </a>
            </div>
          )}
        </div>

        <div className="section">
          <h4>Verify Document</h4>

          <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 10px 0' }}>Verify bằng File</p>
            <input
              type="file"
              onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
              style={{ marginBottom: '10px' }}
            />
            {verifyFile && (
              <p style={{ fontSize: '12px' }}>{verifyFile.name}</p>
            )}
            <button onClick={handleVerifyByFile} disabled={!verifyFile}>
              Verify File
            </button>
          </div>

          <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', opacity: 0.7 }}>Nhập Hash File</h4>
            <input
              type="text"
              placeholder="Nhập document hash (0x...)"
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <button onClick={handleVerify} disabled={!verifyHash}>
              Verify Hash
            </button>
          </div>

          {verifyStatus && <p>{verifyStatus}</p>}

          {verifyResult && (
            <div className="result">
              <h3>Thông tin Document</h3>
              <p><strong>Hash:</strong> <code>{verifyResult.hash}</code></p>
              <p><strong>IPFS CID:</strong> {verifyResult.ipfsCID}</p>
              <p><strong>Uploader:</strong> {verifyResult.uploader}</p>
              <p><strong>Thời gian:</strong> {verifyResult.timestamp}</p>
              <p><strong>Tên file:</strong> {verifyResult.metadata?.filename}</p>
              <p><strong>Kích thước:</strong> {(verifyResult.metadata?.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;