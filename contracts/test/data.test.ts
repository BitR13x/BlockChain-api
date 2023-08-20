import chai from "chai";

import { ethers } from "hardhat";
//import DataJsonContract from "../../artifacts/contracts/Data.sol/Data.json";
// import { Data } from "../../types/typechain";

const { expect } = chai;

describe("Data Contract", () => {
  let dataContract;
  let userAddress: string;

  let data_string: string;
  let hash_data: string;

  beforeEach(async () => {
    userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    data_string = "Hello World!";
    hash_data = ethers.keccak256(ethers.toUtf8Bytes(data_string));

    // Get the contract factory
    const DataContract = await ethers.getContractFactory('Data');

    // get signer
    let owner = await ethers.getSigner(userAddress);

    // Deploy the contract using the user's address
    dataContract = await DataContract.connect(owner).deploy(data_string, hash_data, true);

    console.log(await dataContract.getAddress())
  });

  it("should verify the hash correctly", async () => {
    const isVerified = await dataContract.verify(hash_data);
    expect(isVerified).to.equal(true);
  });

  // Additional test cases can be added here
});
