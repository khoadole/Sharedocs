// import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { simpleStorageAbi } from './abis';

// const web3 = new Web3(Web3.givenProvider);
const web3 = new Web3(window.ethereum);

// contract address is provided by Truffle migration
// const contractAddr = '0x8366fe645d6102F8E401F178631663600Be14079';
const contractAddr = '0x525F913dE9926C10F53a8DBB0542cb1992dCFaC3'; // This address is provided by Remix ETH from deploy transaction
const SimpleContract = new web3.eth.Contract(simpleStorageAbi,
  contractAddr);
console.log('Simple Contract: ', SimpleContract);

function App() {
  const [number, setNumber] = useState(0);
  const [getNumber, setGetNumber] = useState('0x00');
  const [txHistory, setTxHistory] = useState([]);

  const getPastTransactions = async () => {
    try {
      // Lấy các events từ block 0 đến block mới nhất
      const events = await SimpleContract.getPastEvents('NumberSet', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      console.log('Events: ', events);

      // Chuyển đổi events thành format hiển thị
      const history = events.map((event, index) => ({
        hash: event.transactionHash,
        gas: event.gasUsed || 'N/A',
        block: event.blockNumber,
        event: event.event,
        value: event.returnValues.newValue
      }));

      return history;
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  };

  const loadHistory = useCallback(async () => {
    const history = await getPastTransactions();
    setTxHistory(history);
  }, []);

  // Load history khi component mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleGet = async (e) => {
    e.preventDefault();
    const result = await SimpleContract.methods.get().call();
    setGetNumber(result);
    console.log(result);
  }
  const handleSet = async (e) => {
    e.preventDefault();
    // const accounts = await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    const gas = await SimpleContract.methods.set(number)
      .estimateGas();
    const result = await
      SimpleContract.methods.set(number).send({
        from: account,
        gas
      })
    setTxHistory(prevHistory => [
      ...prevHistory,
      {
        hash: result.transactionHash,
        gas: result.gasUsed,
        block: result.blockNumber,
        // Block time thường phải lấy qua một lệnh gọi Web3 khác,
        // nhưng chúng ta sẽ dùng dữ liệu có sẵn trước.
      }
    ]);
    await loadHistory();
    console.log(result);
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
        {txHistory.length > 0 && (
          <div style={{ marginTop: '30px', textAlign: 'left' }}>
            <h3>Transaction History</h3>
            <div>
              {txHistory.map((tx, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '20px',
                }}>
                  <div><strong>TX #{index + 1}</strong></div>
                  <div>Hash: {tx.hash}</div>
                  <div>Gas Used: {tx.gas}</div>
                  <div>Block: {tx.block}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
export default App;