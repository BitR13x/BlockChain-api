import { ethers } from 'ethers';
import { BLOCKNETWORK } from "../config";

const provider = new ethers.JsonRpcProvider(BLOCKNETWORK);

const contractABI = ["..."]
const contractAddress = ''; // Address of the deployed contract
const contract = new ethers.Contract(contractAddress, contractABI, provider);

contract.printOutData().then(result => {
    console.log(result);
  }).catch(error => {
    console.error(error);
  });
  