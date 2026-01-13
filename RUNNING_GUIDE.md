# 🚀 ShareDocs - Complete Running Guide

**Date:** December 29, 2025  
**Package Manager:** pnpm (via npx)

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ **Node.js** (v16 or higher)
- ✅ **pnpm** installed globally OR use `npx pnpm`
- ✅ **MetaMask** browser extension
- ✅ **Pinata account** (https://pinata.cloud/) - Free tier works!

---

## 🎯 Quick Start (5 Minutes)

### 1️⃣ Install All Dependencies

```bash
# Root dependencies
npx pnpm install

# Hardhat contract dependencies
cd hardhat-contract
npx pnpm install

# Client dependencies (uses npm)
cd ../client
npm install

# Return to root
cd ..
```

---

### 2️⃣ Start Local Blockchain

**Terminal 1** - Keep this running:
```bash
cd hardhat-contract
npx pnpm hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

**📝 IMPORTANT:** Copy **Account #0's Private Key** for MetaMask setup.

---

### 3️⃣ Deploy Smart Contract

**Terminal 2:**
```bash
cd hardhat-contract
npx pnpm hardhat ignition deploy ignition/modules/DocumentVerification.ts --network localhost
```

**Expected Output:**
```
Hardhat Ignition 🚀

Deploying [ DocumentVerificationModule ]

Batch #1
  Executed DocumentVerificationModule#DocumentVerification

[ DocumentVerificationModule ] successfully deployed 🚀

Deployed Addresses

DocumentVerificationModule#DocumentVerification - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**📝 IMPORTANT:** Copy the **contract address** (e.g., `0x5FbDB2315678afecb367f032d93F642f64180aa3`)

---

### 4️⃣ Auto-Copy ABI to Client (Automated!)

Instead of manually copying the ABI, run this script:

```bash
# Still in hardhat-contract directory
node scripts/copy-abi.js
```

**Expected Output:**
```
✅ ABI successfully copied to client/src/abis.js
📝 Total functions: 10
📡 Total events: 2

📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📝 Update this address in client/src/App.js (line 7)
```

**What this does:**
- ✅ Automatically extracts ABI from deployment artifacts
- ✅ Writes it to `client/src/abis.js`
- ✅ Shows you the contract address to update

---

### 5️⃣ Update Contract Address in Frontend

Edit `client/src/App.js` (line 7):

```javascript
const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // ← Paste your address here
```

**💡 Tip:** The `copy-abi.js` script shows you the exact address to use!

---

### 6️⃣ Configure Pinata (IPFS Storage)

1. **Get Pinata Credentials:**
   - Go to https://pinata.cloud/
   - Sign up / Login
   - Navigate to **API Keys** section
   - Create new key → Copy **JWT** and **Gateway URL**

2. **Create `.env` file:**
   ```bash
   # In client directory
   cd client
   touch .env  # Or create manually on Windows
   ```

3. **Add your credentials:**
   ```env
   REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_jwt_token_here
   REACT_APP_PINATA_GATEWAY=https://your-gateway.mypinata.cloud
   ```

**⚠️ Security:** Never commit `.env` to git!

---

### 7️⃣ Setup MetaMask Wallet

#### A. Add Local Hardhat Network

1. Open **MetaMask** extension
2. Click network dropdown (top)
3. Click **"Add Network"** → **"Add network manually"**
4. Enter these details:

   | Field | Value |
   |-------|-------|
   | **Network Name** | Local Hardhat |
   | **RPC URL** | `http://127.0.0.1:8545/` |
   | **Chain ID** | `31337` |
   | **Currency Symbol** | `ETH` |

5. Click **Save**

#### B. Import Test Account

1. MetaMask → Click account icon → **Import Account**
2. Paste the **Private Key** from Step 2 (Account #0):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. You should now see **10,000 ETH** balance

#### C. Switch Network

Make sure MetaMask is set to **"Local Hardhat"** network before using the app.

---

### 8️⃣ Start React Frontend

**Terminal 3:**
```bash
cd client
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

**🎉 App opens at:** http://localhost:3000

---

## 📱 Using the Application

### ✅ Upload a Document

1. **Choose a file:**
   - Click "Choose File" button
   - Select any file (PDF, TXT, DOCX, image, etc.)

2. **Upload to blockchain:**
   - Click "Upload to Blockchain"
   - MetaMask popup appears → Click **"Confirm"**
   - Wait 5-10 seconds for confirmation

3. **View results:**
   ```
   ✅ Upload thành công!
   Hash: 0x1234abcd...
   IPFS CID: QmXyz...
   TX Hash: 0x5678efgh...
   ```

---

### ✅ Verify a Document

#### Method 1: Verify by File (Recommended)

1. Under **"Verify bằng File"** section
2. Click "Choose File"
3. Select the **same file** you uploaded
4. Click **"Verify File"**

**✅ Success:**
```
File HỢP LỆ! Chưa bị chỉnh sửa.
Hash: 0x1234abcd...
Uploader: 0xf39f...
Thời gian: 12/29/2025, 10:30:00 AM
```

**❌ File Modified:**
```
File này CHƯA ĐƯỢC ĐĂNG KÝ hoặc ĐÃ BỊ CHỈNH SỬA
```

#### Method 2: Verify by Hash

1. Copy the hash from your upload result
2. Paste into **"Nhập Hash File"** input box
3. Click **"Verify Hash"**
4. View document details

---

### 🧪 Test Document Integrity

**Prove that even 1 byte change is detected:**

1. **Create test file:**
   ```bash
   echo "This is my important document" > test.txt
   ```

2. **Upload `test.txt`** → Note the hash

3. **Modify the file:**
   ```bash
   echo "This is my important document!" > test.txt  # Added exclamation mark
   ```

4. **Try to verify modified file** → ❌ Fails!

5. **Verify original file** → ✅ Success!

This proves the **SHA-256 avalanche effect** - even 1 character change completely changes the hash.

---

## 🔄 Development Workflow

### After Making Contract Changes

```bash
# 1. Stop hardhat node (Terminal 1) - Ctrl+C

# 2. Restart node
cd hardhat-contract
npx pnpm hardhat node

# 3. Redeploy contract (Terminal 2)
npx pnpm hardhat ignition deploy ignition/modules/DocumentVerification.ts --network localhost

# 4. Auto-copy ABI
node scripts/copy-abi.js

# 5. Update contract address in App.js

# 6. Restart frontend (Terminal 3)
cd client
npm start
```

---

## 🛠️ Common Commands

### Hardhat (Smart Contract)

```bash
cd hardhat-contract

# Start local blockchain
npx pnpm hardhat node

# Deploy contract
npx pnpm hardhat ignition deploy ignition/modules/DocumentVerification.ts --network localhost

# Compile contracts
npx pnpm hardhat compile

# Run tests (if you add them)
npx pnpm hardhat test

# Auto-copy ABI to frontend
node scripts/copy-abi.js
```

### Client (Frontend)

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## ❌ Troubleshooting

### 🔴 MetaMask Issues

**Problem:** MetaMask not connecting / No popup

**Solutions:**
1. Check MetaMask is on **"Local Hardhat"** network (Chain ID: 31337)
2. Check Hardhat node is running (Terminal 1)
3. Refresh the page
4. Try disconnecting/reconnecting MetaMask

---

### 🔴 "Contract not found" Error

**Problem:** App can't find the smart contract

**Solutions:**
1. ✅ Check contract address in `App.js` matches deployment output
2. ✅ Ensure Hardhat node is running
3. ✅ Check MetaMask is on correct network (31337)
4. ✅ Redeploy if needed

---

### 🔴 IPFS Upload Fails

**Problem:** "Pinata upload error"

**Solutions:**
1. ✅ Check `.env` file exists in `client/` directory
2. ✅ Verify `REACT_APP_PINATA_JWT` is correct
3. ✅ Verify `REACT_APP_PINATA_GATEWAY` is correct
4. ✅ Restart React app after changing `.env`

---

### 🔴 "Document already exists" Error

**Problem:** Can't upload same file twice

**Explanation:** This is by design! Each unique file can only be registered once on the blockchain (immutability).

**Solutions:**
- ✅ Modify the file slightly to create a different hash
- ✅ This is actually a feature, not a bug (prevents duplicates)

---

### 🔴 Transaction Reverted

**Problem:** MetaMask transaction fails

**Solutions:**
1. ✅ Check Hardhat node is running (Terminal 1)
2. ✅ Check you have enough ETH (should have 10,000 ETH on test account)
3. ✅ Check contract address is correct
4. ✅ Try resetting MetaMask account (Settings → Advanced → Reset Account)

---

### 🔴 Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::8545`

**Solutions:**
```bash
# Windows - Kill process on port 8545
netstat -ano | findstr :8545
taskkill /PID <process_id> /F

# Then restart hardhat node
npx pnpm hardhat node
```

---

### 🔴 ABI Mismatch Error

**Problem:** Frontend can't call contract functions

**Solutions:**
```bash
# 1. Run the auto-copy script
cd hardhat-contract
node scripts/copy-abi.js

# 2. Restart frontend
cd ../client
npm start
```

---

## 📊 Project Structure

```
Sharedocs/
├── hardhat-contract/              # Smart contract project
│   ├── contracts/
│   │   ├── DocumentVerification.sol    # Main contract
│   │   └── SimpleStorage.sol          # Example contract
│   ├── ignition/
│   │   ├── modules/
│   │   │   └── DocumentVerification.ts # Deployment config
│   │   └── deployments/
│   │       └── chain-31337/           # Local deployment artifacts
│   │           ├── deployed_addresses.json
│   │           └── artifacts/
│   │               └── DocumentVerificationModule#DocumentVerification.json
│   ├── scripts/
│   │   └── copy-abi.js               # 🆕 Auto-copy ABI script
│   ├── hardhat.config.ts
│   └── package.json
│
├── client/                           # React frontend
│   ├── src/
│   │   ├── App.js                   # Main application
│   │   ├── App.css                  # Styles
│   │   ├── abis.js                  # Contract ABI (auto-generated)
│   │   └── updateToPinata.js        # IPFS upload & hash functions
│   ├── .env                          # Pinata credentials (create this!)
│   └── package.json
│
├── docs/
│   ├── Nhom09 - SmartContract.docx   # Design document
│   └── Implementation_Analysis.md    # Implementation analysis
│
├── README.md
└── RUNNING_GUIDE.md                  # 👈 This file!
```

---

## 🎯 Complete Startup Sequence

### First Time Setup

```bash
# 1. Install dependencies
npx pnpm install
cd hardhat-contract && npx pnpm install
cd ../client && npm install
cd ..

# 2. Configure Pinata
# - Create client/.env
# - Add REACT_APP_PINATA_JWT and REACT_APP_PINATA_GATEWAY

# 3. Setup MetaMask
# - Add Local Hardhat network
# - Import test account with private key

# 4. Start blockchain (Terminal 1)
cd hardhat-contract
npx pnpm hardhat node

# 5. Deploy contract (Terminal 2)
npx pnpm hardhat ignition deploy ignition/modules/DocumentVerification.ts --network localhost

# 6. Auto-copy ABI
node scripts/copy-abi.js

# 7. Update App.js with contract address

# 8. Start frontend (Terminal 3)
cd ../client
npm start
```

### Daily Development

```bash
# Terminal 1 - Hardhat
cd hardhat-contract
npx pnpm hardhat node

# Terminal 2 - Deploy
npx pnpm hardhat ignition deploy ignition/modules/DocumentVerification.ts --network localhost
node scripts/copy-abi.js

# Terminal 3 - Frontend
cd client
npm start
```

---

## 🔐 Security Notes

### For Local Development
- ✅ Private keys in terminal output are **ONLY for local testing**
- ✅ Never use these keys on mainnet or testnet
- ✅ Never commit `.env` file to git

### For Production
- ⚠️ Use proper key management (hardware wallets, env variables)
- ⚠️ Deploy to testnet (Sepolia) before mainnet
- ⚠️ Audit smart contracts before mainnet deployment

---

## 📚 Additional Resources

- **Hardhat Documentation:** https://hardhat.org/docs
- **Ethers.js v6:** https://docs.ethers.org/v6/
- **Pinata IPFS:** https://docs.pinata.cloud/
- **MetaMask Guide:** https://metamask.io/faqs/
- **Solidity Docs:** https://docs.soliditylang.org/

---

## 🎉 Success Checklist

After following this guide, you should have:

- ✅ Local Hardhat node running on port 8545
- ✅ DocumentVerification contract deployed
- ✅ ABI automatically copied to frontend
- ✅ Pinata IPFS configured
- ✅ MetaMask connected to local network
- ✅ React app running on http://localhost:3000
- ✅ Able to upload documents
- ✅ Able to verify documents
- ✅ See "File HỢP LỆ!" for valid files
- ✅ See "CHƯA ĐƯỢC ĐĂNG KÝ" for modified files

---

**🚀 You're ready to verify documents on the blockchain!**

**Need help?** Check the troubleshooting section or review the setup steps.

**Happy coding! 🎊**
