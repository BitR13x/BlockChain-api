import { ethers } from 'ethers';
import fs from "fs";
import { BLOCKNETWORK } from "../config";

const getContractABI = async (name: string) => {
    //! Do not use user input
    // Load the contract ABI from the compiled artifacts
    let artifacts = JSON.parse(fs.readFileSync(`artifacts/contracts/${name}.sol/${name}.json`, 'utf-8'));
    let contractABI = artifacts.abi;    
    return contractABI
};

const getContractInfo = async (address: string) => {
  const provider = new ethers.JsonRpcProvider(BLOCKNETWORK);
  const abi = await getContractABI("Data");

  const contract = new ethers.Contract(address, abi, provider);

  const contractName = await contract.name();
  const contractSymbol = await contract.symbol();

  return { name: contractName, symbol: contractSymbol };
}


export { getContractInfo };