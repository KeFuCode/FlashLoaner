const { ethers } = require("hardhat");

async function main() {
    // const accounts = await ethers.provider.listAccounts();
    // console.log(accounts);
    // [
    //     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    //     '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    //     '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    //     '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    //     '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    //     '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    //     '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    //     '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    //     '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    //     '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    //     '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
    //     '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
    //     '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
    //     '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
    //     '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
    //     '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
    //     '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    //     '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    //     '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    //     '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
    // ]

    // 获得合约实例
    const address = '0xaca81583840B1bf2dDF6CDe824ada250C1936B4D';
    const FlashLoan = await ethers.getContractFactory('FlashLoan');
    const flashloan = FlashLoan.attach(address);
     
    console.log(await web3.eth.getBalance();

    // 调用合约 deposit 函数, 像合约存入 100 eth
    // const tx1 = {
    //     value: ethers.utils.parseEther("100")
    // }
    // await flashloan.deposit(tx1);

    // 调用合约 swap 函数, 借出 1 usdt
    // usdt 精度为 6
    // const tx = await flashloan.swap(1000000);
    // console.log(tx);

    // 获取 hash 对应交易的详细信息
    // const txHash = "0xc83ecdd6e4886d5ab553147802d36cee848a929d0d2df2955237ef7843be5342";
    // const txMessage = await ethers.provider.getTransactionReceipt(txHash);
    // console.log(txMessage.logs);
 
    // 获取 hash 对应交易的 logs
    // const txHash = "0xc83ecdd6e4886d5ab553147802d36cee848a929d0d2df2955237ef7843be5342";
    // const logs = await ethers.provider.getLogs(txHash);
    // console.log(logs);

    deployTxHash = "0xc9687272e0ec68d9cd5a9bbd491b1a8fbca97701a66c6b2503d6a4c942be8ef9";
    // npx hardhat trace --hash 0xc9687272e0ec68d9cd5a9bbd491b1a8fbca97701a66c6b2503d6a4c942be8ef9 --network localhost
// CREATE FlashLoan.constructor() => (0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
//    CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
//       EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.Approval(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
//    CALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
//       EVENT <UnknownContract 0xdac17f958d2ee523a2206206994597c13d831ec7>.Approval(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
//    CALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
//       DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
//          EVENT <UnknownContract 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48>.Approval(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
    
    depositTxHash = "0xf7e357961fca73f698df2e789ab779065ec6f2c0e16fe404c2edb329af150255";
    // npx hardhat trace --hash 0xf7e357961fca73f698df2e789ab779065ec6f2c0e16fe404c2edb329af150255 --network localhost
// CALL FlashLoan.deposit{value: 100000000000000000000}()
//    CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.deposit{value: 100000000000000000000}()    
//       EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.undefined
//    STATICCALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.balanceOf(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D) => (100000000000000000000)
//    EVENT FlashLoan.Balance(amount=100000000000000000000)
   
    
    swapTxHash = "0xc83ecdd6e4886d5ab553147802d36cee848a929d0d2df2955237ef7843be5342";
    // npx hardhat trace --hash 0xc83ecdd6e4886d5ab553147802d36cee848a929d0d2df2955237ef7843be5342 --network localhost
// CALL FlashLoan.swap(_loanAmount=1000000)
//    CALL <UnknownContract 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852>.swap(amount0Out=0, amount1Out=1000000, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, data=0x466c6173684c6f616e)
//       CALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=1000000)
//          EVENT <UnknownContract 0xdac17f958d2ee523a2206206994597c13d831ec7>.Transfer(from=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=1000000)
//       CALL FlashLoan.uniswapV2Call(account=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, amount0Out=0, amount1Out=1000000, data=0x466c6173684c6f616e)
//          STATICCALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.balanceOf(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D) => (1000000)
//          EVENT FlashLoan.Balance(amount=1000000)
//          CALL <UnknownContract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D>.swapExactTokensForTokens(amountIn=1000000, amountOutMin=0, path=[0xdAC17F958D2ee523a2206206994597C13D831ec7, 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48], to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, deadline=1650722916)
//             STATICCALL <UnknownContract 0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f>.getReserves() => (reserve0=16896893027228, reserve1=16931496767191, blockTimestampLast=1650715474)
//             CALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.transferFrom(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f, value=1000000)
//                EVENT <UnknownContract 0xdac17f958d2ee523a2206206994597c13d831ec7>.Transfer(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f, value=1000000)
//             CALL <UnknownContract 0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f>.swap(amount0Out=994962, amount1Out=0, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, data=0x)
//                CALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=994962)
//                   DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=994962)
//                      EVENT <UnknownContract 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48>.Transfer(from=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=994962)
//                STATICCALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.balanceOf(owner=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f) => (16896892032266)
//                   DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.balanceOf(owner=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f)
//                STATICCALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.balanceOf(owner=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f) => (16931497767191)
//                EVENT <UnknownContract 0x3041cbd36888becc7bbcbc0045e3b1f144466f5f>.Sync(reserve0=16896892032266, 
// reserve1=16931497767191)
//                EVENT <UnknownContract 0x3041cbd36888becc7bbcbc0045e3b1f144466f5f>.Swap(sender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, amount0In=0, amount1In=1000000, amount0Out=994962, amount1Out=0, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
//          EVENT FlashLoan.Balance(amount=994962)
//          CALL <UnknownContract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D>.swapExactTokensForTokens(amountIn=994962, amountOutMin=0, path=[0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2], to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, deadline=1650722916)
//             STATICCALL <UnknownContract 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc>.getReserves() => (reserve0=137496852999803, reserve1=46453077843798118105217, blockTimestampLast=1650715546)
//             CALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.transferFrom(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, value=994962)
//                DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.transferFrom(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, value=994962)
//                   EVENT <UnknownContract 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48>.Transfer(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, value=994962)
//             CALL <UnknownContract 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc>.swap(amount0Out=0, amount1Out=335137777760813, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, data=0x)
//                CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=335137777760813)
//                   EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.Transfer(from=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=335137777760813)
//                STATICCALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.balanceOf(owner=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) => (137496853994765)
//                   DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.balanceOf(owner=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc)
//                STATICCALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.balanceOf(owner=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) => (46453077508660340344404)
//                EVENT <UnknownContract 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc>.Sync(reserve0=137496853994765, reserve1=46453077508660340344404)
//                EVENT <UnknownContract 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc>.Swap(sender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, amount0In=994962, amount1In=0, amount0Out=0, amount1Out=335137777760813, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
//          EVENT FlashLoan.Balance(amount=335137777760813)
//          STATICCALL <UnknownContract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D>.getAmountsIn(amountOut=1000000, path=[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 0xdAC17F958D2ee523a2206206994597C13D831ec7])
//             STATICCALL <UnknownContract 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852>.getReserves() => (reserve0=23611228084448076437453, reserve1=69920078625506, blockTimestampLast=1650715564)
//          EVENT FlashLoan.Balance(amount=338704928733326)
//          CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.transfer(to=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852, value=338704928733326) => (true)
//             EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.Transfer(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852, value=338704928733326)
//          EVENT FlashLoan.Balance(amount=99999661295071266674)
//       STATICCALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.balanceOf(owner=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852) => (23611228423153005170779)
//       STATICCALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.balanceOf(owner=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852) => (69920077625506)
//       EVENT <UnknownContract 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852>.Sync(reserve0=23611228423153005170779, 
// reserve1=69920077625506)
//       EVENT <UnknownContract 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852>.Swap(sender=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, amount0In=338704928733326, amount1In=0, amount0Out=0, amount1Out=1000000, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)

}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});