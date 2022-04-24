async function main() {
    const address = '0xaca81583840B1bf2dDF6CDe824ada250C1936B4D';
    const FlashLoan = await ethers.getContractFactory('FlashLoan');
    const flashloan = FlashLoan.attach(address);
    
    // 调用合约 swap 函数, 借出 1 usdt
    // usdt 精度为 6
    const tx = await flashloan.swap(1000000);
    console.log(tx);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});