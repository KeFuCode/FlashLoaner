const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const FlashLoan = await hre.ethers.getContractFactory("FlashLoan");
  const flashloan = await FlashLoan.deploy();

  await flashloan.deployed();

  console.log("FlashLoan deployed to:", flashloan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
