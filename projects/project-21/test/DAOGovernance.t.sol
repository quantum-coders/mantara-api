// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/DAOGovernance.sol";

contract DAOGovernanceTest is Test {
    DAOGovernance public instance;

    function setUp() public {
        instance = new DAOGovernance();
    }

    function testExample() public {
        assertTrue(true);
    }
}