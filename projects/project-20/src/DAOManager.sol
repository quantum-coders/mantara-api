// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DAOManager {
    address public owner;
    mapping(address => bool) public members;
    uint public proposalCount;
    mapping(uint => Proposal) public proposals;

    struct Proposal {
        uint id;
        string description;
        address proposer;
        uint voteCount;
        bool executed;
    }

    event MemberAdded(address member);
    event MemberRemoved(address member);
    event ProposalCreated(uint id, string description);
    event Voted(uint proposalId, address voter);
    event ProposalExecuted(uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede hacer esto");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender], "No eres miembro");
        _;
    }

    constructor() {
        owner = msg.sender;
        members[msg.sender] = true;
    }

    function addMember(address newMember) public onlyOwner {
        members[newMember] = true;
        emit MemberAdded(newMember);
    }

    function removeMember(address member) public onlyOwner {
        members[member] = false;
        emit MemberRemoved(member);
    }

    function createProposal(string memory description) public onlyMember {
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, description, msg.sender, 0, false);
        emit ProposalCreated(proposalCount, description);
    }

    function vote(uint proposalId) public onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Propuesta ya ejecutada");
        proposal.voteCount++;
        emit Voted(proposalId, msg.sender);
    }

    function executeProposal(uint proposalId) public onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Propuesta ya ejecutada");
        require(proposal.voteCount > 0, "No hay votos suficientes");
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
        // Aquí puedes agregar lógica para ejecutar la propuesta
    }
}
