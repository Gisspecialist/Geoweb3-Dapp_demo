// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────────
// GEOWToken.sol  — ERC-20 reward token
// ─────────────────────────────────────────────────────────────────────────────
// Deploy first; then pass address to ServiceNFT and RewardsEngine constructors.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GEOWToken is ERC20, Ownable {
    // Addresses authorised to mint tokens (ServiceNFT and RewardsEngine)
    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() ERC20("GeoWeb3 Token", "GEOW") Ownable(msg.sender) {
        // Mint initial supply to deployer for liquidity / DAO treasury
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "GEOWToken: caller is not a minter");
        _;
    }

    function addMinter(address account) external onlyOwner {
        minters[account] = true;
        emit MinterAdded(account);
    }

    function removeMinter(address account) external onlyOwner {
        minters[account] = false;
        emit MinterRemoved(account);
    }

    /// @notice Mint tokens — callable by authorised minter contracts only
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// ServiceNFT.sol  — ERC-721: each token represents one Esri service
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract ServiceNFT is ERC721URIStorage, Ownable {

    // ── Storage ──────────────────────────────────────────────────────────────

    uint256 private _tokenIds;

    GEOWToken public immutable geowToken;

    uint256 public constant MINT_REWARD   = 100 * 10 ** 18;  // 100 GEOW
    uint256 public constant UPDATE_REWARD =  20 * 10 ** 18;  // 20 GEOW

    struct ServiceInfo {
        string  ipfsCid;      // IPFS CID of the current metadata JSON
        string  serviceUrl;   // ArcGIS REST URL
        uint256 version;      // starts at 1, incremented on each update
        uint256 mintedAt;
        uint256 updatedAt;
    }

    mapping(uint256 => ServiceInfo)  public services;
    mapping(address => uint256[])    private _ownerTokens;

    // ── Events ────────────────────────────────────────────────────────────────

    event ServiceMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string  ipfsCid,
        string  serviceUrl
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        string  newIpfsCid,
        uint256 version,
        string  changeSummary
    );

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address _geowToken) ERC721("GeoWeb3 Service", "GSVC") Ownable(msg.sender) {
        geowToken = GEOWToken(_geowToken);
    }

    // ── Mint ──────────────────────────────────────────────────────────────────

    /**
     * @notice Mint a new Service NFT.
     * @param ipfsCid    IPFS CID pointing to the metadata JSON.
     * @param serviceUrl ArcGIS REST endpoint URL.
     * @return tokenId   The minted token ID.
     */
    function mintService(
        string calldata ipfsCid,
        string calldata serviceUrl
    ) external returns (uint256 tokenId) {
        require(bytes(ipfsCid).length > 0,    "ServiceNFT: empty CID");
        require(bytes(serviceUrl).length > 0, "ServiceNFT: empty URL");

        _tokenIds += 1;
        tokenId = _tokenIds;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string.concat("ipfs://", ipfsCid));

        services[tokenId] = ServiceInfo({
            ipfsCid:    ipfsCid,
            serviceUrl: serviceUrl,
            version:    1,
            mintedAt:   block.timestamp,
            updatedAt:  block.timestamp
        });

        _ownerTokens[msg.sender].push(tokenId);

        // Distribute mint reward
        geowToken.mint(msg.sender, MINT_REWARD);

        emit ServiceMinted(tokenId, msg.sender, ipfsCid, serviceUrl);
    }

    // ── Update Metadata ───────────────────────────────────────────────────────

    /**
     * @notice Update the IPFS metadata for an owned service.
     * @param tokenId       The token to update.
     * @param newIpfsCid    New IPFS CID.
     * @param changeSummary Human-readable description of changes (stored in event).
     */
    function updateMetadata(
        uint256        tokenId,
        string calldata newIpfsCid,
        string calldata changeSummary
    ) external {
        require(ownerOf(tokenId) == msg.sender, "ServiceNFT: not the owner");
        require(bytes(newIpfsCid).length > 0,   "ServiceNFT: empty CID");

        ServiceInfo storage svc = services[tokenId];
        svc.ipfsCid  = newIpfsCid;
        svc.version += 1;
        svc.updatedAt = block.timestamp;

        _setTokenURI(tokenId, string.concat("ipfs://", newIpfsCid));

        // Distribute update reward
        geowToken.mint(msg.sender, UPDATE_REWARD);

        emit MetadataUpdated(tokenId, newIpfsCid, svc.version, changeSummary);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    function getServiceInfo(uint256 tokenId) external view returns (
        string memory ipfsCid,
        string memory serviceUrl,
        uint256 version,
        uint256 mintedAt,
        uint256 updatedAt
    ) {
        ServiceInfo storage svc = services[tokenId];
        return (svc.ipfsCid, svc.serviceUrl, svc.version, svc.mintedAt, svc.updatedAt);
    }

    function getOwnerTokens(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    // ── Override transfer to update _ownerTokens index ────────────────────────

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            // Remove from sender's list
            uint256[] storage fromList = _ownerTokens[from];
            for (uint256 i = 0; i < fromList.length; i++) {
                if (fromList[i] == tokenId) {
                    fromList[i] = fromList[fromList.length - 1];
                    fromList.pop();
                    break;
                }
            }
            _ownerTokens[to].push(tokenId);
        }
        return from;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// RewardsEngine.sol  — periodic epoch rewards + leaderboard
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardsEngine is Ownable {

    GEOWToken public immutable geowToken;

    uint256 public constant EPOCH_DURATION   = 7 days;
    uint256 public constant API_CALL_REWARD  = 5 * 10 ** 18;  // 5 GEOW per 10 calls
    uint256 public constant QUALITY_MULTIPLIER = 2;           // 2× for score ≥ 90%

    uint256 public epochStart;
    uint256 public currentEpoch;

    struct UserStats {
        uint256 totalEarned;
        uint256 epochEarned;
        uint256 apiCallCount;
        uint256 qualityScore;   // 0–100
        uint256 claimable;
    }

    mapping(address => UserStats) public userStats;
    address[] public participants;

    // Oracle address (backend service that records API calls)
    address public oracle;

    event RewardQueued(address indexed user, uint256 amount, string reason);
    event RewardClaimed(address indexed user, uint256 amount);
    event EpochFinalized(uint256 epoch, uint256 timestamp);

    constructor(address _geowToken) Ownable(msg.sender) {
        geowToken = GEOWToken(_geowToken);
        epochStart = block.timestamp;
        currentEpoch = 1;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle || msg.sender == owner(), "RewardsEngine: not oracle");
        _;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    // ── Record API usage (called by backend oracle) ───────────────────────────

    /**
     * @notice Record API calls for a service. Rewards accumulate every 10 calls.
     * @param serviceOwner Address of the service NFT owner.
     * @param callCount    Number of calls to record.
     */
    function recordApiCalls(address serviceOwner, uint256 callCount) external onlyOracle {
        _ensureParticipant(serviceOwner);
        UserStats storage stats = userStats[serviceOwner];
        stats.apiCallCount += callCount;

        uint256 batches = stats.apiCallCount / 10;
        if (batches > 0) {
            stats.apiCallCount = stats.apiCallCount % 10;
            uint256 reward = batches * API_CALL_REWARD;
            stats.claimable  += reward;
            stats.epochEarned += reward;
            stats.totalEarned += reward;
            emit RewardQueued(serviceOwner, reward, "API calls");
        }
    }

    // ── Update quality score (called by oracle) ───────────────────────────────

    function updateQualityScore(address user, uint256 score) external onlyOracle {
        require(score <= 100, "RewardsEngine: score > 100");
        userStats[user].qualityScore = score;
    }

    // ── Claim rewards ─────────────────────────────────────────────────────────

    function claimRewards() external returns (uint256 amount) {
        UserStats storage stats = userStats[msg.sender];
        amount = stats.claimable;
        require(amount > 0, "RewardsEngine: nothing to claim");

        stats.claimable = 0;
        geowToken.mint(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    // ── Finalize epoch (owner or keeper) ─────────────────────────────────────

    function finalizeEpoch() external {
        require(block.timestamp >= epochStart + EPOCH_DURATION, "RewardsEngine: epoch not over");

        // Apply quality bonus
        for (uint256 i = 0; i < participants.length; i++) {
            address user = participants[i];
            UserStats storage stats = userStats[user];
            if (stats.qualityScore >= 90 && stats.epochEarned > 0) {
                uint256 bonus = stats.epochEarned * (QUALITY_MULTIPLIER - 1);
                stats.claimable  += bonus;
                stats.totalEarned += bonus;
                emit RewardQueued(user, bonus, "Quality bonus");
            }
            stats.epochEarned = 0;
        }

        epochStart = block.timestamp;
        currentEpoch += 1;
        emit EpochFinalized(currentEpoch - 1, block.timestamp);
    }

    // ── Leaderboard ───────────────────────────────────────────────────────────

    function getLeaderboard(uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory amounts
    ) {
        uint256 len = participants.length < limit ? participants.length : limit;
        users   = new address[](len);
        amounts = new uint256[](len);

        // Simple selection sort (acceptable for small N; use off-chain sort for large sets)
        address[] memory sorted = participants;
        for (uint256 i = 0; i < len; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < sorted.length; j++) {
                if (userStats[sorted[j]].totalEarned > userStats[sorted[maxIdx]].totalEarned) {
                    maxIdx = j;
                }
            }
            (sorted[i], sorted[maxIdx]) = (sorted[maxIdx], sorted[i]);
            users[i]   = sorted[i];
            amounts[i] = userStats[sorted[i]].totalEarned;
        }
    }

    function claimableBalance(address user) external view returns (uint256) {
        return userStats[user].claimable;
    }

    function getUserStats(address user) external view returns (
        uint256 totalEarned,
        uint256 epoch,
        uint256 rank
    ) {
        totalEarned = userStats[user].totalEarned;
        epoch       = currentEpoch;
        // Compute rank (linear scan — replace with off-chain for scale)
        rank = 1;
        for (uint256 i = 0; i < participants.length; i++) {
            if (userStats[participants[i]].totalEarned > totalEarned) rank++;
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _ensureParticipant(address user) internal {
        if (userStats[user].totalEarned == 0 && userStats[user].claimable == 0) {
            participants.push(user);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GeoWeb3DAO.sol — lightweight DAO/community verification contract
// ─────────────────────────────────────────────────────────────────────────────

contract GeoWeb3DAO is Ownable {
    GEOWToken public immutable geowToken;
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public minimumVotingPower = 1 * 10 ** 18;

    enum ProposalStatus { Open, Passed, Failed, Executed }

    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string category;
        string metadataCid;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 createdAt;
        ProposalStatus status;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, address indexed creator, string title, string category, string metadataCid);
    event VoteCast(uint256 indexed id, address indexed voter, bool support, uint256 votingPower);
    event ProposalFinalized(uint256 indexed id, ProposalStatus status);

    constructor(address _geowToken) Ownable(msg.sender) {
        geowToken = GEOWToken(_geowToken);
    }

    function setVotingPeriod(uint256 period) external onlyOwner {
        require(period >= 1 hours && period <= 30 days, "DAO: invalid period");
        votingPeriod = period;
    }

    function setMinimumVotingPower(uint256 amount) external onlyOwner {
        minimumVotingPower = amount;
    }

    function createProposal(string calldata title, string calldata category, string calldata metadataCid) external returns (uint256 id) {
        require(bytes(title).length > 0, "DAO: title required");
        proposalCount += 1;
        id = proposalCount;
        proposals[id] = Proposal({
            id: id,
            creator: msg.sender,
            title: title,
            category: category,
            metadataCid: metadataCid,
            yesVotes: 0,
            noVotes: 0,
            createdAt: block.timestamp,
            status: ProposalStatus.Open
        });
        emit ProposalCreated(id, msg.sender, title, category, metadataCid);
    }

    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(p.id != 0, "DAO: proposal not found");
        require(p.status == ProposalStatus.Open, "DAO: not open");
        require(block.timestamp <= p.createdAt + votingPeriod, "DAO: voting ended");
        require(!hasVoted[id][msg.sender], "DAO: already voted");

        uint256 votingPower = geowToken.balanceOf(msg.sender);
        require(votingPower >= minimumVotingPower, "DAO: insufficient GEOW voting power");
        hasVoted[id][msg.sender] = true;
        if (support) p.yesVotes += votingPower;
        else p.noVotes += votingPower;
        emit VoteCast(id, msg.sender, support, votingPower);
    }

    function finalize(uint256 id) external {
        Proposal storage p = proposals[id];
        require(p.id != 0, "DAO: proposal not found");
        require(p.status == ProposalStatus.Open, "DAO: already finalized");
        require(block.timestamp > p.createdAt + votingPeriod, "DAO: voting still active");
        p.status = p.yesVotes > p.noVotes ? ProposalStatus.Passed : ProposalStatus.Failed;
        emit ProposalFinalized(id, p.status);
    }
}
