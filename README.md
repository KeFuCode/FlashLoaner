# FlashLoan开发思路  
借助 uniswap 提供的闪电贷功能，从 uniswap v2 借出USDT，USDT->USDC，USDC->ETH，把ETH 还给 uniswap v2。  
  
uniswap：前端调用router合约（能够找到调用哪个pair合约），router合约调用pair合约，pari合约执行swap接口。    
  
`UniswapV2Pair.sol` ：`swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data)`接口中，data字段`length>0`，就会执行to地址的`uniswapV2Call(address to, uint256 amount0Out, uint256 amount1Out, bytes calldata data)`方法。
  
闪电贷核心，编写方法：`uniswapV2Call(address to, uint256 amount0Out, uint256 amount1Out, bytes calldata data)`。
  
## 一、环境配置  
使用Hardhat 分叉以太坊主网，作为本地合约运行环境。（truffle + ganache 也可实现类似操作）  

```bash
# 启动本地节点，并 fork 以太坊主网
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/<--your api key-->
```
```bash
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

...

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.
```
  
## 二、前期准备

1. UniswapV2Pair.sol
在uniswap官网找到 USDT-ETH 交易对合约地址，在etherscan查询[完整代码](https://etherscan.io/address/0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852#code)并复制，本地创建`UniswapV2Pair.sol`  
编译器版本：`v0.5.16`  
```solidity
/**
 *Submitted for verification at Etherscan.io on 2020-05-05
*/

// File: contracts/interfaces/IUniswapV2Pair.sol

pragma solidity >=0.5.0;

interface IUniswapV2Pair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    ...
}

...

```
2. UniswapV2Router02.sol
token路由合约，会自动选择最优swap路径。在[etherscan](https://etherscan.io/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D#code)获取源码、合约地址、编译器版本信息。  
编译器版本：`v0.6.6`
```solidity
/**
 *Submitted for verification at Etherscan.io on 2020-06-05
*/

pragma solidity =0.6.6;

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

...
```  
3. IERC20.sol  
所有遵循ERC20协议的 token，授权、转账、余额查询等操作都会使用该接口。
```solidity
pragma solidity >=0.5.0;

interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}
```
4. 记录合约地址
``` solidity
// 路由合约地址
address public router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
// USDT-ETH 交易对合约地址
address public USDTETH = 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852;
// WETH 合约地址
address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
// USDT 合约地址
address public USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
// USDC 合约地址
address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
```
## 三、闪电贷合约  
1. 创建FlashLoan.sol
```solidity
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.5.0;

import "./IERC20.sol";

// 1.借出 USDT 2.USDT -> USDC 3. USDC -> ETH 4. 还款 ETH
contract FlashLoan {
    address public router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public USDTETH = 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852;
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
}
```
2. 向Uniswap V2借出USDT  
    1. pair合约中的`swap`接口，需要输入借出token的数量。
  `function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;`
    2. 在etherscan查询`token0`和`token1`的合约地址，查明`token1`指的是`WETH`，`token2`指的是`USDT`。
    3. 实现借款功能
  `bytes.length>0`才会调用uniswap v2提供的闪电贷功能。
  `bytes.length=0`只调用`swap`。
```solidity
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.5.0;

import "./IERC20.sol";

interface pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}

// 1.借出 USDT 2.USDT -> USDC 3. USDC -> ETH 4. 还款 ETH
contract FlashLoan {
    address public router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public USDTETH = 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852;
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    
    uint public loanAmount; // 借款数量
    
    bytes _data = bytes("FlashLoan"); // bytes.length > 0
    
    // 向 uniswap v2 借出 usdt
    function swap(uint _loanAmount) public {
        loanAmount = _loanAmount;
        pair(USDTETH).swap(uint(0), _loanAmount, address(this), _data);   
    }
}
```
3. 进行闪电贷
    1. 闪电贷核心逻辑  
完成swap()和uniswapV2Call()这两个函数，就完成了闪电贷的核心功能。  

```solidity
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.5.0;

import "./IERC20.sol";

interface pair {
    // token swap / flashloan
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}

interface uniRouter {
    // 输入确定数量token，swap尽可能多的其他token
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    // 输入 usdt 借款数量，计算需要还款 weth 的数量
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

// 1.借出 USDT 2.USDT -> USDC 3. USDC -> ETH 4. 还款 ETH
contract FlashLoan {
    address public router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public USDTETH = 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852;
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    
    uint public loanAmount; // 借款数量
    uint public ETHAmount; // 记录合约内 eth 数量
    
    bytes _data = bytes("FlashLoan"); // bytes.length > 0
    
    event Balance(uint amount); // 记录 token balance
    
    // 向 uniswap v2 借出 usdt
    function swap(uint _loanAmount) public {
        loanAmount = _loanAmount;
        pair(USDTETH).swap(uint(0), _loanAmount, address(this), _data);   
    }
    
    // uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
    function uniswapV2Call(address account, uint amount0Out, uint amount1Out, bytes memory data) public {
        // 查询合约内 usdt 余额
        uint balance = IERC20(USDT).balanceOf(address(this));
        emit Balance(balance);

        // 把 usdt 交换为 usdc
        address[] memory path1 = new address[](2);
        path1[0] = USDT;
        path1[1] = USDC;
        uint[] memory amounts1 = uniRouter(router).swapExactTokensForTokens(balance, uint(0), path1, address(this), block.timestamp+1800);
        emit Balance(amounts1[1]);

        // 把 usdc 交换为 weth
        address[] memory path2 = new address[](2);
        path2[0] = USDC;
        path2[1] = WETH;
        uint[] memory amounts2 = uniRouter(router).swapExactTokensForTokens(amounts1[1], uint(0), path2, address(this), block.timestamp+1800);
        emit Balance(amounts2[1]);

        // 计算借出一些 usdt, 需要还给合约多少 weth (自动包括gas)
        address[] memory path3 = new address[](2);
        path3[0] = WETH;
        path3[1] = USDT;
        uint[] memory amounts3 = uniRouter(router).getAmountsIn(loanAmount, path3); 
        emit Balance(amounts3[0]);

        // 把 weth 还给 uniswap v2 pair 合约
        IERC20(WETH).transfer(USDTETH, amounts3[0]);
        emit Balance(ETHAmount - amounts3[0]);
    }
}
```
      2. 完善合约  
由于演示的demo只是进行多次swap操作。要让合约运行起来，还需要向合约内提前存入足够的eth。  
除此之外，还需要给router授予token的使用权限。完善后的合约，就可以编译，部署并测试了。  
  
```solidity
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.5.0;

import "../interfaces/IERC20.sol";

interface pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}

interface uniRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);

}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}   

// 1.借出 USDT 2.USDT -> USDC 3. USDC -> ETH 4. 还款 ETH
contract FlashLoan {
    address public router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public USDTETH = 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852;
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    uint public loanAmount;
    uint public ETHAmount;

    bytes _data = bytes("FlashLoan");

    event Balance(uint amount);

    constructor() public {
        // 授权
        safeApprove(WETH, router, uint(-1));
        safeApprove(USDT, router, uint(-1));
        safeApprove(USDC, router, uint(-1));
    }

    // 向合约转入 weth
    function deposit() public payable {
        ETHAmount = msg.value;
        IWETH(WETH).deposit{value: ETHAmount}();
        emit Balance(IERC20(WETH).balanceOf(address(this)));
    }

    // uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
    function uniswapV2Call(address account, uint amount0Out, uint amount1Out, bytes memory data) public {
        // 查询合约内 usdt 余额
        uint balance = IERC20(USDT).balanceOf(address(this));
        emit Balance(balance);

        // 把 usdt 交换为 usdc
        address[] memory path1 = new address[](2);
        path1[0] = USDT;
        path1[1] = USDC;
        uint[] memory amounts1 = uniRouter(router).swapExactTokensForTokens(balance, uint(0), path1, address(this), block.timestamp+1800);
        emit Balance(amounts1[1]);

        // 把 usdc 交换为 weth
        address[] memory path2 = new address[](2);
        path2[0] = USDC;
        path2[1] = WETH;
        uint[] memory amounts2 = uniRouter(router).swapExactTokensForTokens(amounts1[1], uint(0), path2, address(this), block.timestamp+1800);
        emit Balance(amounts2[1]);

        // 计算借出一些 usdt, 需要还给合约多少 weth (自动包括gas)
        address[] memory path3 = new address[](2);
        path3[0] = WETH;
        path3[1] = USDT;
        uint[] memory amounts3 = uniRouter(router).getAmountsIn(loanAmount, path3); 
        emit Balance(amounts3[0]);

        // 把 weth 还给 uniswap v2 pair 合约
        IERC20(WETH).transfer(USDTETH, amounts3[0]);
        emit Balance(ETHAmount - amounts3[0]);
    }

    // 向 uniswap v2 借出 usdt
    function swap(uint _loanAmount) public {
        loanAmount = _loanAmount;
        pair(USDTETH).swap(uint(0), _loanAmount, address(this), _data);   
    }

    // 批准 router 合约使用 token
    function safeApprove(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

}
```
## 四、编译、部署  
1. 配置`hardhat.config.js`
```javascript
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()
require('@nomiclabs/hardhat-ethers');
require("hardhat-tracer");

module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/<--your api key-->",
      }
    },
    rinkeby: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
    ],
    settings: {

    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}
```
2. 编译  
```bash
npx hardhat compile
```
3. 部署  
编写`run.js`，部署合约。  
```javascript
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
```
```bash
npx hardhat run .\scripts\run.js --network localhost
# Contract address: 0xaca81583840b1bf2ddf6cde824ada250c1936b4d
# Transaction: 0xc9687272e0ec68d9cd5a9bbd491b1a8fbca97701a66c6b2503d6a4c942be8ef9
```
## 五、测试  
1. 执行deposit操作  
在进行闪电贷之前，为了保证合约成功运行，先向合约中存入一些eth。  
编写`test1.js`，存入eth。  
```javascript
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
```
```bash
npx hardhat run .\scripts\test1.js --network localhost
# Transaction: 0xf7e357961fca73f698df2e789ab779065ec6f2c0e16fe404c2edb329af150255
# From: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
# To: 0xaca81583840b1bf2ddf6cde824ada250c1936b4d
# Value: 100 ETH
```
2. 执行swap操作  
编写`test2.js`，执行闪电贷。
```javascript
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
```
```bash
npx hardhat run .\scripts\test2.js --network localhost
# Transaction: 0xc83ecdd6e4886d5ab553147802d36cee848a929d0d2df2955237ef7843be5342
# From: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
# To: 0xaca81583840b1bf2ddf6cde824ada250c1936b4d
```
## 六、追踪交易信息  
借助hardhat插件 trace，获取交易的详细信息，更直观呈现合约交易过程。  
1. 安装包  
```bash
 npm i hardhat-tracer 
```
2. 配置`hardhat.config.js`  
```javascript
require("hardhat-tracer");
```
### Deploy
```bash
npx hardhat trace --hash 0xc9687272e0ec68d9cd5a9bbd491b1a8fbca97701a66c6b2503d6a4c942be8ef9 --network localhost
```
```bash
CREATE FlashLoan.constructor() => (0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
   CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
      EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.Approval(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
   CALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
      EVENT <UnknownContract 0xdac17f958d2ee523a2206206994597c13d831ec7>.Approval(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
   CALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
      DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.approve(spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
         EVENT <UnknownContract 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48>.Approval(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, spender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, value=115792089237316195423570985008687907853269984665640564039457584007913129639935)
```
### Deposit
```bash
npx hardhat trace --hash 0xf7e357961fca73f698df2e789ab779065ec6f2c0e16fe404c2edb329af150255 --network localhost
```
```bash
CALL FlashLoan.deposit{value: 100000000000000000000}()
   CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.deposit{value: 100000000000000000000}()    
      EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.undefined
   STATICCALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.balanceOf(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D) => (100000000000000000000)
   EVENT FlashLoan.Balance(amount=100000000000000000000)
```
### Swap
```bash
npx hardhat trace --hash 0xc83ecdd6e4886d5ab553147802d36cee848a929d0d2df2955237ef7843be5342 --network localhost
```
```bash
CALL FlashLoan.swap(_loanAmount=1000000)
   CALL <UnknownContract 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852>.swap(amount0Out=0, amount1Out=1000000, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, data=0x466c6173684c6f616e)
      CALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=1000000)
         EVENT <UnknownContract 0xdac17f958d2ee523a2206206994597c13d831ec7>.Transfer(from=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=1000000)
      CALL FlashLoan.uniswapV2Call(account=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, amount0Out=0, amount1Out=1000000, data=0x466c6173684c6f616e)
         STATICCALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.balanceOf(owner=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D) => (1000000)
         EVENT FlashLoan.Balance(amount=1000000)
         CALL <UnknownContract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D>.swapExactTokensForTokens(amountIn=1000000, amountOutMin=0, path=[0xdAC17F958D2ee523a2206206994597C13D831ec7, 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48], to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, deadline=1650722916)
            STATICCALL <UnknownContract 0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f>.getReserves() => (reserve0=16896893027228, reserve1=16931496767191, blockTimestampLast=1650715474)
            CALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.transferFrom(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f, value=1000000)
               EVENT <UnknownContract 0xdac17f958d2ee523a2206206994597c13d831ec7>.Transfer(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f, value=1000000)
            CALL <UnknownContract 0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f>.swap(amount0Out=994962, amount1Out=0, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, data=0x)
               CALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=994962)
                  DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=994962)
                     EVENT <UnknownContract 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48>.Transfer(from=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=994962)
               STATICCALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.balanceOf(owner=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f) => (16896892032266)
                  DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.balanceOf(owner=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f)
               STATICCALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.balanceOf(owner=0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f) => (16931497767191)
               EVENT <UnknownContract 0x3041cbd36888becc7bbcbc0045e3b1f144466f5f>.Sync(reserve0=16896892032266, 
reserve1=16931497767191)
               EVENT <UnknownContract 0x3041cbd36888becc7bbcbc0045e3b1f144466f5f>.Swap(sender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, amount0In=0, amount1In=1000000, amount0Out=994962, amount1Out=0, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
         EVENT FlashLoan.Balance(amount=994962)
         CALL <UnknownContract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D>.swapExactTokensForTokens(amountIn=994962, amountOutMin=0, path=[0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2], to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, deadline=1650722916)
            STATICCALL <UnknownContract 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc>.getReserves() => (reserve0=137496852999803, reserve1=46453077843798118105217, blockTimestampLast=1650715546)
            CALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.transferFrom(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, value=994962)
               DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.transferFrom(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, value=994962)
                  EVENT <UnknownContract 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48>.Transfer(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, value=994962)
            CALL <UnknownContract 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc>.swap(amount0Out=0, amount1Out=335137777760813, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, data=0x)
               CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.transfer(to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=335137777760813)
                  EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.Transfer(from=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, value=335137777760813)
               STATICCALL <UnknownContract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48>.balanceOf(owner=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) => (137496853994765)
                  DELEGATECALL <UnknownContract 0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF>.balanceOf(owner=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc)
               STATICCALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.balanceOf(owner=0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc) => (46453077508660340344404)
               EVENT <UnknownContract 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc>.Sync(reserve0=137496853994765, reserve1=46453077508660340344404)
               EVENT <UnknownContract 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc>.Swap(sender=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, amount0In=994962, amount1In=0, amount0Out=0, amount1Out=335137777760813, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
         EVENT FlashLoan.Balance(amount=335137777760813)
         STATICCALL <UnknownContract 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D>.getAmountsIn(amountOut=1000000, path=[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 0xdAC17F958D2ee523a2206206994597C13D831ec7])
            STATICCALL <UnknownContract 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852>.getReserves() => (reserve0=23611228084448076437453, reserve1=69920078625506, blockTimestampLast=1650715564)
         EVENT FlashLoan.Balance(amount=338704928733326)
         CALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.transfer(to=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852, value=338704928733326) => (true)
            EVENT <UnknownContract 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2>.Transfer(from=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, to=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852, value=338704928733326)
         EVENT FlashLoan.Balance(amount=99999661295071266674)
      STATICCALL <UnknownContract 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2>.balanceOf(owner=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852) => (23611228423153005170779)
      STATICCALL <UnknownContract 0xdAC17F958D2ee523a2206206994597C13D831ec7>.balanceOf(owner=0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852) => (69920077625506)
      EVENT <UnknownContract 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852>.Sync(reserve0=23611228423153005170779, 
reserve1=69920077625506)
      EVENT <UnknownContract 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852>.Swap(sender=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D, amount0In=338704928733326, amount1In=0, amount0Out=0, amount1Out=1000000, to=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D)
```
