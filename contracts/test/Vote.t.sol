// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {Vote} from "../src/Vote.sol";

contract VoteTest is Test {
    Vote public voteContract;
    address public owner;
    address public voter;

    function setUp() public {
        owner = address(this);
        voter = address(0x1);
        voteContract = new Vote();
        voteContract.initialize(owner);
    }

    function testCreatePoll() public {
        Vote.Poll memory newPoll = Vote.Poll({
            name: "Test Poll",
            emoji: unicode"🔥",
            description: "This is a test poll",
            options: new bytes[](2)
        });
        newPoll.options[0] = "Option 1";
        newPoll.options[1] = "Option 2";

        bytes32 pollId = voteContract.getNextPollId();

        voteContract.createPoll(newPoll);

        assertEq(voteContract.pollName(pollId), "Test Poll");
        assertEq(voteContract.pollEmoji(pollId), unicode"🔥");
        assertEq(voteContract.pollDescription(pollId), "This is a test poll");
        assertEq(voteContract.pollOptions(pollId)[0], "Option 1");
        assertEq(voteContract.pollOptions(pollId)[1], "Option 2");
    }

    function testClosePoll() public {
        Vote.Poll memory newPoll = Vote.Poll({
            name: "Test Poll",
            emoji: unicode"🔥",
            description: "This is a test poll",
            options: new bytes[](2)
        });
        newPoll.options[0] = "Option 1";
        newPoll.options[1] = "Option 2";

        bytes32 pollId = voteContract.getNextPollId();
        voteContract.createPoll(newPoll);

        voteContract.closePoll(pollId);
        assertTrue(voteContract.pollClosed(pollId));
    }

    function testVote() public {
        Vote.Poll memory newPoll = Vote.Poll({
            name: "Test Poll",
            emoji: unicode"🔥",
            description: "This is a test poll",
            options: new bytes[](2)
        });
        newPoll.options[0] = "Option 1";
        newPoll.options[1] = "Option 2";

        bytes32 pollId = voteContract.getNextPollId();

        voteContract.createPoll(newPoll);

        bytes32 token = voteContract.generatePollToken(owner, voter);

        // Authorize token
        voteContract.addToken(token);

        vm.prank(voter);
        voteContract.vote(pollId, voter, 0);

        assertEq(voteContract.pollVotes(pollId)[0], 1);
        assertEq(voteContract.pollTotalVotes(pollId), 1);
    }

    function testFailVoteUnauthorized() public {
        Vote.Poll memory newPoll = Vote.Poll({
            name: "Test Poll",
            emoji: unicode"🔥",
            description: "This is a test poll",
            options: new bytes[](2)
        });
        newPoll.options[0] = "Option 1";
        newPoll.options[1] = "Option 2";

        bytes32 pollId = voteContract.getNextPollId();

        voteContract.createPoll(newPoll);

        vm.prank(voter);

        voteContract.vote(pollId, voter, 0);
    }

    function testFailVoteClosedPoll() public {
        Vote.Poll memory newPoll = Vote.Poll({
            name: "Test Poll",
            emoji: unicode"🔥",
            description: "This is a test poll",
            options: new bytes[](2)
        });
        newPoll.options[0] = "Option 1";
        newPoll.options[1] = "Option 2";

        bytes32 pollId = voteContract.getNextPollId();

        voteContract.createPoll(newPoll);

        voteContract.closePoll(pollId);

        // Authorize voter
        bytes32 token = voteContract.generatePollToken(owner, voter);
        voteContract.addToken(token);

        vm.prank(voter);

        vm.expectRevert(Vote.Poll__PollAlreadyExists.selector);
        voteContract.vote(pollId, voter, 0);
    }

    function testAddVoter() public {
        address newVoter = address(0x2);

        bytes32 token = voteContract.generatePollToken(owner, newVoter);

        assertFalse(voteContract.pollOwnerAuthorizedTokens(owner, token));

        voteContract.addToken(token);

        assertTrue(voteContract.pollOwnerAuthorizedTokens(owner, token));
        assertEq(voteContract.pollOwnerAuthorizedTokenList(owner)[0], token);
    }

    function testFailAddExistingVoter() public {
        address newVoter = address(0x2);

        bytes32 token = voteContract.generatePollToken(owner, newVoter);

        voteContract.addToken(token);

        // This should fail
        vm.expectRevert(Vote.Poll__TokenAlreadyAuthorized.selector);
        voteContract.addToken(token);
    }

    function testRemoveVoter() public {
        address newVoter = address(0x2);

        bytes32 token = voteContract.generatePollToken(owner, newVoter);

        voteContract.addToken(token);
        assertTrue(voteContract.pollOwnerAuthorizedTokens(owner, token));

        voteContract.removeToken(token);

        assertFalse(voteContract.pollOwnerAuthorizedTokens(owner, token));
    }

    function testFailRemoveNonExistentVoter() public {
        address nonExistentVoter = address(0x3);

        bytes32 token = voteContract.generatePollToken(owner, nonExistentVoter);

        // This should fail
        voteContract.removeToken(token);
    }

    function testAddAndRemoveMultipleVoters() public {
        address voter1 = address(0x2);
        address voter2 = address(0x3);
        address voter3 = address(0x4);

        bytes32 token1 = voteContract.generatePollToken(owner, voter1);
        bytes32 token2 = voteContract.generatePollToken(owner, voter2);
        bytes32 token3 = voteContract.generatePollToken(owner, voter3);

        voteContract.addToken(token1);
        voteContract.addToken(token2);
        voteContract.addToken(token3);

        assertEq(voteContract.pollOwnerAuthorizedTokenList(owner)[0], token1);
        assertEq(voteContract.pollOwnerAuthorizedTokenList(owner)[1], token2);
        assertEq(voteContract.pollOwnerAuthorizedTokenList(owner)[2], token3);

        voteContract.removeToken(token2);

        assertEq(voteContract.pollOwnerAuthorizedTokenList(owner)[0], token1);
        assertEq(voteContract.pollOwnerAuthorizedTokenList(owner)[1], token3);
    }
}
