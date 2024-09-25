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
        assertEq(voteContract.pollOptions(pollId, 0), "Option 1");
        assertEq(voteContract.pollOptions(pollId, 1), "Option 2");
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

        // Authorize voter
        voteContract.addVoter(voter);

        vm.prank(voter);
        voteContract.vote(pollId, 0);

        assertEq(voteContract.pollVotes(pollId, 0), 1);
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
        voteContract.vote(pollId, 0);
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
        voteContract.pollOwnerAuthorizedVoters(owner, voter);

        vm.prank(voter);
        voteContract.vote(pollId, 0);
    }

    function testAddVoter() public {
        address newVoter = address(0x2);

        assertFalse(voteContract.pollOwnerAuthorizedVoters(owner, newVoter));

        voteContract.addVoter(newVoter);

        assertTrue(voteContract.pollOwnerAuthorizedVoters(owner, newVoter));
        assertEq(voteContract.pollOwnerAuthorizedVoterList(owner, 0), newVoter);
    }

    function testFailAddExistingVoter() public {
        address newVoter = address(0x2);

        voteContract.addVoter(newVoter);

        // This should fail
        voteContract.addVoter(newVoter);
    }

    function testRemoveVoter() public {
        address newVoter = address(0x2);

        voteContract.addVoter(newVoter);
        assertTrue(voteContract.pollOwnerAuthorizedVoters(owner, newVoter));

        voteContract.removeVoter(newVoter);

        assertFalse(voteContract.pollOwnerAuthorizedVoters(owner, newVoter));

        // Check if the voter is removed from the list
        vm.expectRevert(); // This will catch the out-of-bounds revert
        voteContract.pollOwnerAuthorizedVoterList(owner, 0);
    }

    function testFailRemoveNonExistentVoter() public {
        address nonExistentVoter = address(0x3);

        // This should fail
        voteContract.removeVoter(nonExistentVoter);
    }

    function testAddAndRemoveMultipleVoters() public {
        address voter1 = address(0x2);
        address voter2 = address(0x3);
        address voter3 = address(0x4);

        voteContract.addVoter(voter1);
        voteContract.addVoter(voter2);
        voteContract.addVoter(voter3);

        assertEq(voteContract.pollOwnerAuthorizedVoterList(owner, 0), voter1);
        assertEq(voteContract.pollOwnerAuthorizedVoterList(owner, 1), voter2);
        assertEq(voteContract.pollOwnerAuthorizedVoterList(owner, 2), voter3);

        voteContract.removeVoter(voter2);

        assertEq(voteContract.pollOwnerAuthorizedVoterList(owner, 0), voter1);
        assertEq(voteContract.pollOwnerAuthorizedVoterList(owner, 1), voter3);

        vm.expectRevert(); // This will catch the out-of-bounds revert
        voteContract.pollOwnerAuthorizedVoterList(owner, 2);
    }
}
