async function main() {
    const address = '0xaca81583840B1bf2dDF6CDe824ada250C1936B4D';
    const FlashLoan = await ethers.getContractFactory('FlashLoan');
    const flashloan = FlashLoan.attach(address);
    
    // 调用合约 deposit 函数, 像合约存入 100 eth
    const tx1 = {
        value: ethers.utils.parseEther("100")
    }
    await flashloan.deposit(tx1);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});