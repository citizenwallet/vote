// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract Vote is Initializable, OwnableUpgradeable, UUPSUpgradeable, AccessControlUpgradeable {
    ////////////////////////////////
    // STRUCTS

    struct Poll {
        bytes name;
        bytes emoji;
        bytes description;
        bytes[] options;
    }

    ////////////////////////////////
    // VARIABLES
    mapping(address => uint256) public nonces;
    mapping(bytes32 => address) public pollOwners;
    mapping(address => mapping(address => bool)) public pollOwnerAuthorizedVoters;
    mapping(address => address[]) public pollOwnerAuthorizedVoterList;
    mapping(bytes32 => bytes) public pollName;
    mapping(bytes32 => bytes) public pollEmoji;
    mapping(bytes32 => bytes) public pollDescription;
    mapping(bytes32 => mapping(address => bool)) public pollVoters;
    mapping(bytes32 => bytes[]) public pollOptions;
    mapping(bytes32 => uint256[]) public pollVotes;
    mapping(bytes32 => uint256) public pollTotalVotes;
    mapping(bytes32 => bool) public pollClosed;

    ////////////////////////////////
    // ERRORS

    error Poll__PollAlreadyExists();
    error Poll__PollDoesNotExist();
    error Poll__OnlyPollOwner();
    error Poll__PollAlreadyClosed();
    error Poll__OnlyPollAuthorizedVoter();
    error Poll__VoterAlreadyAuthorized();
    error Poll__VoterNotAuthorized();

    ////////////////////////////////
    // EVENTS

    event PollCreated(bytes32 indexed pollId, bytes name, bytes emoji);
    event PollClosed(bytes32 indexed pollId);
    event PollVoted(bytes32 indexed pollId, uint256 indexed optionIndex, uint256 votes, uint256 totalVotes);
    event VoterAdded(address indexed pollOwner, address indexed voter);
    event VoterRemoved(address indexed pollOwner, address indexed voter);

    ////////////////////////////////
    // CONSTRUCTOR
    function initialize(address _owner) public initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    ////////////////////////////////
    // MODIFIERS

    modifier onlyPollOwner(bytes32 pollId) {
        if (pollOwners[pollId] != msg.sender) revert Poll__OnlyPollOwner();
        _;
    }

    modifier onlyOpenPoll(bytes32 pollId) {
        if (pollClosed[pollId]) revert Poll__PollAlreadyClosed();
        _;
    }

    modifier onlyPollAuthorizedVoter(address pollOwner, address voter) {
        if (!pollOwnerAuthorizedVoters[pollOwner][voter]) revert Poll__OnlyPollAuthorizedVoter();
        _;
    }

    ////////////////////////////////
    // FUNCTIONS

    function createPoll(Poll memory poll) public {
        bytes32 pollId = getNextPollId();
        if (pollOptions[pollId].length != 0) revert Poll__PollAlreadyExists();

        pollName[pollId] = poll.name;
        pollEmoji[pollId] = poll.emoji;
        pollDescription[pollId] = poll.description;
        pollOptions[pollId] = poll.options;
        pollVotes[pollId] = new uint256[](poll.options.length);
        pollOwners[pollId] = msg.sender;

        nonces[msg.sender]++;

        emit PollCreated(pollId, poll.name, poll.emoji);
    }

    function closePoll(bytes32 pollId) public onlyPollOwner(pollId) onlyOpenPoll(pollId) {
        pollClosed[pollId] = true;

        emit PollClosed(pollId);
    }

    function vote(bytes32 pollId, uint256 optionIndex)
        public
        onlyPollAuthorizedVoter(pollOwners[pollId], msg.sender)
        onlyOpenPoll(pollId)
    {
        if (pollClosed[pollId]) revert Poll__PollAlreadyClosed();

        pollVotes[pollId][optionIndex]++;
        pollTotalVotes[pollId]++;

        emit PollVoted(pollId, optionIndex, pollVotes[pollId][optionIndex], pollTotalVotes[pollId]);
    }

    function addVoter(address voter) public {
        if (isAuthorizedVoter(msg.sender, voter)) revert Poll__VoterAlreadyAuthorized();
        if (pollOwnerAuthorizedVoterList[msg.sender].length == 0) {
            pollOwnerAuthorizedVoterList[msg.sender] = new address[](0);
        }
        pollOwnerAuthorizedVoterList[msg.sender].push(voter);
        pollOwnerAuthorizedVoters[msg.sender][voter] = true;

        emit VoterAdded(msg.sender, voter);
    }

    function removeVoter(address voter) public {
        if (!isAuthorizedVoter(msg.sender, voter)) revert Poll__VoterNotAuthorized();
        // Remove voter from the array
        address[] memory voters = new address[](pollOwnerAuthorizedVoterList[msg.sender].length - 1);
        uint256 index = 0;
        for (uint256 i = 0; i < pollOwnerAuthorizedVoterList[msg.sender].length; i++) {
            if (pollOwnerAuthorizedVoterList[msg.sender][i] == voter) {
                continue;
            }
            voters[index] = pollOwnerAuthorizedVoterList[msg.sender][i];
            index++;
        }
        pollOwnerAuthorizedVoterList[msg.sender] = voters;
        pollOwnerAuthorizedVoters[msg.sender][voter] = false;

        emit VoterRemoved(msg.sender, voter);
    }

    function isAuthorizedVoter(address pollOwner, address voter) internal view returns (bool) {
        return pollOwnerAuthorizedVoters[pollOwner][voter];
    }

    ////////////////////////////////
    // VIEW FUNCTIONS

    function getNextPollId() public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), msg.sender, nonces[msg.sender]));
    }

    ////////////////////////////////
    // UPGRADE

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    ////////////////////////////////
}
