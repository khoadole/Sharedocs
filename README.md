# Project Structure
`/client/` : thư mục chứa code của app web \
`/hardhat-contract/` : thư mục chính để sử build smart contract và deploy lên blockchain

# Usage
## Setup Hardhat
```bash
mkdir hardhat-contract
cd hardhat-contract
pnpm dlx hardhat --init
```
```
Using hardhat-3 
Absolute path : . 
Minimal Hardhat project
```

## Build Smart Contract
```bash
pnpm add --save-dev @nomicfoundation/hardhat-toolbox-viem @nomicfoundation/hardhat-ignition viem
```

### Deploy
- **Note**: 
    - Đảm bảo `ignition/modules/<tên_contract>.ts` và `contracts/<tên_contract>.sol` đã có
- First terminal : `pnpm hardhat node` 
    - **Example output :** 
```bash
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.

Account #0:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

- Second terminal : `pnpm hardhat ignition deploy ignition/modules/<tên_contract>.ts --network localhost` 
    - **Example output :** 
```bash
Hardhat Ignition starting for [ SimpleStorageModule ]
Hardhat Ignition 🚀

Deploying [ SimpleStorageModule ]

Batch #1
  Executed SimpleStorageModule#SimpleStorage

[ SimpleStorageModule ] successfully deployed 🚀

Deployed Addresses

SimpleStorageModule#SimpleStorage - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

# Setup Metamask
- Tạo tài khoản Metamask : https://metamask.io/
- Setup : 
    - Add wallet 
    - Import an account
    - Nhập private key bất kì ví nào trong terminal 1
    - Add network: 
        - Network Name: Local Hardhat
        - RPC URL: http://127.0.0.1:8545/
        - Chain ID: 31337
        - Currency Symbol: ETH
- Output : 
![alt text](assets/1.1.metamask_result.png)

# Interact with Contract
- Copy địa chỉ Contract bên vừa tạo ở Terminal 2 :  `0x5FbDB2315678afecb367f032d93F642f64180aa3`
    - Paste vào `App.js` : `const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';`
- Copy `abi` trong `ignition/deployments/artifacts/<tên_contract>.json` và paste vào `abis.js`
- Pinata : https://pinata.cloud/ 
    - Lấy ra `JWT` và `Gateway` 
    - Paste vào `.env` 

``` bash
cd ../client/
npm start
```
- Output: 
![alt text](assets/1.2.transaction.png)
![alt text](assets/1.3.test_result.png)

# Todo
- [ ] Verify logic smart contract
- [ ] Build better UI 
- [ ] Build test case
- [ ] Test access with multi computers
- [ ] Build access control (owner, user,...) (Optional)
- [ ] Deploy contract to testnet - Sepolia (Optional - cost real gas)