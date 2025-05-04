// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/DAOGovernance.sol";

contract DeployDAOGovernance is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        DAOGovernance instance = new DAOGovernance();
        
        vm.stopBroadcast();
    }
}