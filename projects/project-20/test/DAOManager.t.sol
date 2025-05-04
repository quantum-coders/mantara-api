// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/DAOManager.sol";

contract DAOManagerTest is Test {
    DAOManager public instance;

    function setUp() public {
        instance = new DAOManager();
    }

    function testExample() public {
        assertTrue(true);
    }
}