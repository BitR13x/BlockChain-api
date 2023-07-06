// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./openzeppelin/contracts/utils/Base64.sol";

contract Data {
    address payable public owner;
    bool private visibility;
    string private data;

    // keccak256 hash
    bytes32 private my_hash;

    constructor(string memory _data, bool _visibility) payable {
        require(bytes(data).length > 0, "Invalid data.");

        data = _data;
        visibility = _visibility;

        if (visibility != false && visibility != true) {
            visibility = false;
        }

        owner = payable(msg.sender);
    }

    function encrypt() public {
        my_hash = keccak256(abi.encodePacked(data));
    }

    function verify_by_data(string memory _data) external view returns (bool) {
        return keccak256(abi.encodePacked(_data)) == my_hash;
    }

    function verify_by_hash(bytes32 _hash) external view returns (bool) {
        return my_hash == _hash;
    }
}
