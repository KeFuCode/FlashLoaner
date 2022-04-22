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
}

// 1.借出 USDT 2.USDT -> USDC 3. USDC -> ETH 4. 还款 ETH
contract FlashLoan {
    address public router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public USDTETH = 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852;
    address public WETH = 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2;
    address public USDT = 0xdac17f958d2ee523a2206206994597c13d831ec7;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    bytes _data = bytes("FlashLoan");

    event Balance(uint amount);

    // uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
    function uniswapV2Call(address this, uint amount0Out, uint amount1Out, bytes memory data) public {
        // 从 uniswap v2 pair 合约借出 usdt
        uint balance = IERC20(USDT).balanceOf(address(this));
        emit Balance(balance);

        // 把 usdt 交换为 usdc
        address[] memory path1 = new address[](2);
        path1[0] = USDT;
        path1[1] = USDC;
        uint[] memory amounts1 = uniRouter(router).swapExactTokensForTokens(balance, uint(0), path1, address(this), block.timestamp+1800);
        
        // 把 usdc 交换为 weth
        address[] memory path2 = new address[](2);
        path2[0] = USDC;
        path2[1] = WETH;
        uint[] memory amounts2 = uniRouter(router).swapExactTokensForTokens(amounts1[1], uint(0), path2, address(this), block.timestamp+1800);

        // 把 weth 还给 uniswap v2 pair 合约
        IERC20(WETH).transfer(USDTETH, amounts2[1]);
    }

    function swap(uint _loanAmount) public {
        pair(USDTETH).swap(uint(0), _loanAmount, address(this), _data)   
    }
}