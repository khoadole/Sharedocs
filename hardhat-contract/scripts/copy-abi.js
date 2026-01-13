import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to automatically copy ABI from deployment artifacts to client
 * Run this after deploying the contract
 */
async function copyABI() {
  try {
    // Path to the deployment artifact
    const artifactPath = path.join(
      __dirname,
      '../ignition/deployments/chain-31337/artifacts/DocumentVerificationModule#DocumentVerification.json'
    );

    // Read the artifact file
    if (!fs.existsSync(artifactPath)) {
      console.error('❌Artifact file not found. Make sure you have deployed the contract first!');
      console.log('Run: npx pnpm hardhat ignition deploy ignition/modules/DocumentVerification.ts --network localhost');
      process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Extract the ABI
    const abi = artifact.abi;
    
    // Create the ABI export for client (legacy format)
    const abiContent = `// Auto-generated from deployment artifact
// Do not edit manually - run: node scripts/copy-abi.js
export const simpleStorageAbi = ${JSON.stringify(abi, null, 2)};
`;
    
    // Write to client/src/abis.js (old client)
    const clientAbiPath = path.join(__dirname, '../../client/src/abis.js');
    if (fs.existsSync(path.dirname(clientAbiPath))) {
      fs.writeFileSync(clientAbiPath, abiContent);
      console.log('✅ ABI copied to client/src/abis.js (legacy)');
    }

    // Write to client-new/src/abis/DocumentVerification.json (new client)
    const clientNewAbiPath = path.join(__dirname, '../../client-new/src/abis/DocumentVerification.json');
    if (fs.existsSync(path.dirname(clientNewAbiPath))) {
      fs.writeFileSync(clientNewAbiPath, JSON.stringify(abi, null, 2));
      console.log('✅ ABI copied to client-new/src/abis/DocumentVerification.json');
    }
    
    console.log(`📝 Total functions: ${abi.filter(item => item.type === 'function').length}`);
    console.log(`📡 Total events: ${abi.filter(item => item.type === 'event').length}`);
    
    // Extract contract address from deployed_addresses.json
    const addressesPath = path.join(
      __dirname,
      '../ignition/deployments/chain-31337/deployed_addresses.json'
    );
    
    if (fs.existsSync(addressesPath)) {
      const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
      const contractAddress = addresses['DocumentVerificationModule#DocumentVerification'];
      
      if (contractAddress) {
        console.log('\n📍 Contract Address:', contractAddress);
        console.log('📝 Update this address in:');
        console.log('   - client/src/App.js (line 7)');
        console.log('   - client-new/.env (VITE_CONTRACT_ADDRESS)');
      }
    }
    
  } catch (error) {
    console.error('Error copying ABI:', error.message);
    process.exit(1);
  }
}

copyABI();
