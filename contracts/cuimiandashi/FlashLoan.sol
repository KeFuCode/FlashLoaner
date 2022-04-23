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
    function uniswapV2Call(address this, uint amount0Out, uint amount1Out, bytes memory data) public {
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