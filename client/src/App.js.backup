import './App.css';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { simpleStorageAbi } from './abis';

const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function App() {
  const [number, setNumber] = useState(0);
  const [getNumber, setGetNumber] = useState('0x00');

  const handleGet = async (e) => {
    e.preventDefault();
    if (window.ethereum) {
      // 1. Create a Provider (Read-only access to the blockchain)
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 2. Create the Contract instance attached to the Provider
      const SimpleContract = new ethers.Contract(contractAddr, simpleStorageAbi, provider);

      try {
        // 3. Call the function directly (no .methods or .call)
        const result = await SimpleContract.get();
        
        // Ethers returns BigInt, convert to string for React state
        setGetNumber(result.toString());
        console.log(result.toString());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }

  const handleSet = async (e) => {
    e.preventDefault();
    if (window.ethereum) {
      // 1. Create a Provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 2. Get the Signer 
      const signer = await provider.getSigner();

      // 3. Create the Contract instance attached to the Signer (Write access)
      const SimpleContract = new ethers.Contract(contractAddr, simpleStorageAbi, signer);

      try {
        // 4. Send the transaction directly
        // Gas estimation is handled automatically by ethers, though you can override it if needed
        const tx = await SimpleContract.set(number);
        console.log("Transaction sent:", tx.hash);

        // 5. Optional: Wait for the transaction to be mined
        await tx.wait();
        console.log("Transaction confirmed");
      } catch (error) {
        console.error("Error sending transaction:", error);
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSet}>
          <label>
            Set Number:
            <input
              type="text"
              name="name"
              value={number}
              onChange={e => setNumber(e.target.value)} />
          </label>
          <input type="submit" value="Set Number" />
        </form>
        <br />
        <button
          onClick={handleGet}
          type="button" >
          Get Number
        </button>
        {getNumber}
      </header>
    </div>
  );
}

export default App;