import "chai";
import { ethers } from "hardhat";
import { deployContract } from "ethereum-waffle";
import { Data } from "../typechain/Data";

const { expect } = chai;

describe("Data Contract", () => {
  let dataContract: Data;

  beforeEach(async () => {
    dataContract = await deployContract(ethers.provider.getSigner(), Data, [
      "Sample Data",
      "Sample Hash",
      true
    ]);
  });

  it("should deploy the contract with the correct initial values", async () => {
    expect(await dataContract.data()).to.equal("Sample Data");
    expect(await dataContract.hash_data()).to.equal(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], ["Sample Hash"])));
    expect(await dataContract.visibility()).to.equal(true);
  });

  it("should verify the hash correctly", async () => {
    const isVerified = await dataContract.verify("Sample Hash");
    expect(isVerified).to.equal(true);
  });

  // Additional test cases can be added here
});
