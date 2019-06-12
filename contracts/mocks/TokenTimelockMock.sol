pragma solidity ^0.5.0;

import "../token/ERC20/TokenTimelock.sol";

// mock class using ERC20
contract TokenTimelockMock is TokenTimelock {
    constructor (IERC20 token, address beneficiary, uint256 releaseTime) TokenTimelock(token, beneficiary, releaseTime) public {
    }

    function setImmediateReleaseForTest() public {
        _releaseTime = block.timestamp - 3600;
    }

    function setBeforeReleaseTimeForTest() public {
        _releaseTime = block.timestamp + 10;
    }
}
