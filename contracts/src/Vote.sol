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
    mapping(address => mapping(bytes32 => bool)) public pollOwnerAuthorizedTokens;
    mapping(address => bytes32[]) private _pollOwnerAuthorizedTokenList;
    mapping(bytes32 => bytes) public pollName;
    mapping(bytes32 => bytes) public pollEmoji;
    mapping(bytes32 => bytes) public pollDescription;
    mapping(bytes32 => mapping(bytes32 => bool)) public pollTokens;
    mapping(bytes32 => bytes[]) private _pollOptions;
    mapping(bytes32 => uint256[]) private _pollVotes;
    mapping(bytes32 => uint256) public pollTotalVotes;
    mapping(bytes32 => bool) public pollClosed;

    ////////////////////////////////
    // ERRORS

    error Poll__PollAlreadyExists();
    error Poll__PollDoesNotExist();
    error Poll__OnlyPollOwner();
    error Poll__PollAlreadyClosed();
    error Poll__OnlyPollAuthorizedToken();
    error Poll__TokenAlreadyAuthorized();
    error Poll__TokenNotAuthorized();
    error Poll__TokenAlreadyUsed();

    ////////////////////////////////
    // EVENTS

    event PollCreated(bytes32 indexed pollId, bytes name, bytes emoji);
    event PollClosed(bytes32 indexed pollId);
    event PollVoted(bytes32 indexed pollId, uint256 indexed optionIndex, uint256 votes, uint256 totalVotes);
    event TokenAdded(address indexed pollOwner, bytes32 indexed token);
    event TokenRemoved(address indexed pollOwner, bytes32 indexed token);

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

    ////////////////////////////////
    // FUNCTIONS

    function createPoll(Poll memory poll) public {
        bytes32 pollId = getNextPollId();
        if (_pollOptions[pollId].length != 0) revert Poll__PollAlreadyExists();

        pollName[pollId] = poll.name;
        pollEmoji[pollId] = poll.emoji;
        pollDescription[pollId] = poll.description;
        _pollOptions[pollId] = poll.options;
        _pollVotes[pollId] = new uint256[](poll.options.length);
        pollOwners[pollId] = msg.sender;

        nonces[msg.sender]++;

        emit PollCreated(pollId, poll.name, poll.emoji);
    }

    function closePoll(bytes32 pollId) public onlyPollOwner(pollId) onlyOpenPoll(pollId) {
        pollClosed[pollId] = true;

        emit PollClosed(pollId);
    }

    function vote(bytes32 pollId, address voter, uint256 optionIndex) public onlyOpenPoll(pollId) {
        bytes32 token = generatePollToken(pollOwners[pollId], voter);

        address pollOwner = pollOwners[pollId];

        if (!pollOwnerAuthorizedTokens[pollOwner][token]) revert Poll__OnlyPollAuthorizedToken();
        if (pollTokens[pollId][token]) revert Poll__TokenAlreadyUsed();

        _pollVotes[pollId][optionIndex]++;
        pollTotalVotes[pollId]++;

        pollTokens[pollId][token] = true;

        emit PollVoted(pollId, optionIndex, _pollVotes[pollId][optionIndex], pollTotalVotes[pollId]);
    }

    function addToken(bytes32 token) public {
        if (isAuthorizedVoter(msg.sender, token)) revert Poll__TokenAlreadyAuthorized();
        if (_pollOwnerAuthorizedTokenList[msg.sender].length == 0) {
            _pollOwnerAuthorizedTokenList[msg.sender] = new bytes32[](0);
        }
        _pollOwnerAuthorizedTokenList[msg.sender].push(token);
        pollOwnerAuthorizedTokens[msg.sender][token] = true;

        emit TokenAdded(msg.sender, token);
    }

    function removeToken(bytes32 token) public {
        if (!isAuthorizedVoter(msg.sender, token)) revert Poll__TokenNotAuthorized();
        // Remove token from the array
        bytes32[] memory tokens = new bytes32[](_pollOwnerAuthorizedTokenList[msg.sender].length - 1);
        uint256 index = 0;
        for (uint256 i = 0; i < _pollOwnerAuthorizedTokenList[msg.sender].length; i++) {
            if (_pollOwnerAuthorizedTokenList[msg.sender][i] == token) {
                continue;
            }
            tokens[index] = _pollOwnerAuthorizedTokenList[msg.sender][i];
            index++;
        }
        _pollOwnerAuthorizedTokenList[msg.sender] = tokens;
        pollOwnerAuthorizedTokens[msg.sender][token] = false;

        emit TokenRemoved(msg.sender, token);
    }

    function isAuthorizedVoter(address pollOwner, bytes32 token) internal view returns (bool) {
        return pollOwnerAuthorizedTokens[pollOwner][token];
    }

    ////////////////////////////////
    // VIEW FUNCTIONS

    function pollOptions(bytes32 pollId) public view returns (bytes[] memory) {
        return _pollOptions[pollId];
    }

    function pollVotes(bytes32 pollId) public view returns (uint256[] memory) {
        return _pollVotes[pollId];
    }

    function pollOwnerAuthorizedTokenList(address pollOwner) public view returns (bytes32[] memory) {
        return _pollOwnerAuthorizedTokenList[pollOwner];
    }

    function getNextPollId() public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), msg.sender, nonces[msg.sender]));
    }

    function generatePollToken(address pollOwner, address voter) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), pollOwner, voter));
    }

    ////////////////////////////////
    // UPGRADE

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    ////////////////////////////////
}
