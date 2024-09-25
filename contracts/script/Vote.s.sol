// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import {Create2} from "../src/Create2.sol";
import {Vote} from "../src/Vote.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract VoteDeploy is Script {
    function deploy() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the implementation contract
        Vote implementation = new Vote();

        // Prepare initialization data
        bytes memory initData = abi.encodeCall(Vote.initialize, (owner));

        // Prepare the creation code for the proxy
        bytes memory proxyBytecode =
            abi.encodePacked(type(ERC1967Proxy).creationCode, abi.encode(address(implementation), initData));

        bytes32 salt = keccak256(abi.encodePacked("DINTERFACE_CONTRACT_VOTE_1"));

        // Deploy the proxy using Create2
        address proxyAddress = Create2(vm.envAddress("CREATE2_FACTORY_ADDRESS")).deploy(salt, proxyBytecode);

        if (proxyAddress == address(0)) {
            console.log("Vote proxy deployment failed");
            vm.stopBroadcast();
            return;
        }

        console.log("Vote implementation created at: ", address(implementation));
        console.log("Vote proxy created at: ", proxyAddress);

        vm.stopBroadcast();
    }
}
