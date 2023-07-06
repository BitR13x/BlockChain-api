// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./openzeppelin/contracts/utils/Base64.sol";

contract Data {
    address payable public owner;
    bool private visibility;
    string data;

    constructor(string memory _data, bool _visibility) payable {
        require(bytes(data).length > 0, "Invalid data.");

        data = _data;
        visibility = _visibility;

        if (visibility != false && visibility != true) {
            visibility = false;
        }

        owner = payable(msg.sender);
    }

    function encrypt(string memory _pass) public {}

    function verify(string memory _file_string) public view {}
}
