// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./openzeppelin/contracts/access/Ownable.sol";

contract Data is Ownable {
    //address payable public owner;
    bool private visibility;

    // data
    string private data;
    bytes32 private hash_data;

    constructor(
        string memory _data,
        string memory _hash_data,
        bool _visibility
    ) payable {
        require(bytes(data).length > 0, "Invalid data.");

        data = _data;
        hash_data = keccak256(abi.encodePacked(_hash_data));
        visibility = _visibility;

        if (visibility != false && visibility != true) {
            visibility = false;
        }

        //owner = payable(msg.sender);
    }

    function verify(string memory _hash) external view returns (bool) {
        return hash_data == keccak256(abi.encodePacked(_hash));
    }
}
