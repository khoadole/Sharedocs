// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract SimpleStorage {
    uint storedData;

    event NumberSet(address indexed setter, uint256 newValue, uint256 timestamp);
    
    function set(uint x) public {
        storedData = x;
        emit NumberSet(msg.sender, x, block.timestamp);
    }
    function get() public view returns (uint) {
        return storedData;
    }
}