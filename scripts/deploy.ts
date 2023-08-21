import { ethers } from "hardhat";


const main = async (data: string, hash: string, userAddress: string) => {
  const lockedAmount = ethers.parseEther("0.001");

  // Get the contract factory
  const DataContract = await ethers.getContractFactory('Data');

  // get signer
  let owner = await ethers.getSigner(userAddress);

  // Deploy the contract using the user's address
  let dataContract = await DataContract.connect(owner).deploy(data, hash, true);

  console.log(await dataContract.getAddress());
/*   console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH deployed to ${dataContract.target}`
  );
   */
  //const accounts = await ethers.getSigners();
  //console.log(accounts)
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors
let data_string = "Hello World!"
let hash = ethers.keccak256(ethers.toUtf8Bytes(data_string));
main(data_string, hash, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
