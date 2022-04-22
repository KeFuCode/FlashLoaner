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

    bytes _data = bytes("FlashLoan");

    event Balance(uint amount);

    // uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
    function uniswapV2Call(address this, uint amount0Out, uint amount1Out, bytes memory data) public {
        uint balance = IERC20(USDT).balanceOf(address(this));
        emit Balance(balance);
    }

    function swap(uint _loanAmount) public {
        pair(USDTETH).swap(uint(0), _loanAmount, address(this), _data)   
    }
}