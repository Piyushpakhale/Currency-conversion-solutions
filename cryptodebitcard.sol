// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


contract CryptoDebitCard is Ownable, ReentrancyGuard, Pausable {
    uint256 public constant ETH_USD_PRICE = 3000; // Mock rate: 1 ETH = 3000 USD
    uint256 public constant GAS_LIMIT = 100000; // Increased gas limit for ETH transfers

    address public bank;
    uint256 public bankFiatReserve;

    struct User {
        uint256 fiatBalance;
    }

    mapping(address => User) public users;

    event CryptoDeposited(address indexed user, uint256 ethAmount, uint256 fiatAmount);
    event CryptoWithdrawn(address indexed user, uint256 ethAmount, uint256 fiatAmount);
    event BalanceUpdated(address indexed user, uint256 fiatBalance, uint256 cryptoBalance);

    constructor(address _bank, uint256 _initialFiatReserve) Ownable(msg.sender) {
        require(_bank != address(0), "Bank address is zero");
        bank = _bank;
        bankFiatReserve = _initialFiatReserve;
    }

    // Get user account details
    function getUserDetails() external view returns (uint256 fiatBalance, uint256 cryptoBalance) {
        return (
            users[msg.sender].fiatBalance,
            msg.sender.balance
        );
    }

    // Get bank balances
    function getBankDetails() external view returns (uint256 fiatReserve, uint256 cryptoBalance) {
        return (
            bankFiatReserve,
            address(this).balance
        );
    }

    // Deposit ETH to receive equivalent fiat balance
    function deposit() external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Send ETH");

        uint256 fiatAmount = (msg.value * ETH_USD_PRICE) / 1 ether;
        require(bankFiatReserve >= fiatAmount, "Bank has insufficient fiat");

        // Update balances
        users[msg.sender].fiatBalance += fiatAmount;
        bankFiatReserve -= fiatAmount;

        emit CryptoDeposited(msg.sender, msg.value, fiatAmount);
        emit BalanceUpdated(msg.sender, users[msg.sender].fiatBalance, msg.sender.balance);
    }

    // Withdraw fiat to get ETH back
    function withdraw(uint256 fiatAmount) external whenNotPaused nonReentrant {
        require(fiatAmount > 0, "Fiat amount must be > 0");
        require(users[msg.sender].fiatBalance >= fiatAmount, "Insufficient fiat balance");

        uint256 ethAmount = (fiatAmount * 1 ether) / ETH_USD_PRICE;
        require(ethAmount > 0, "ETH amount too small");

        // Check contract balance
        require(address(this).balance >= ethAmount, "Contract has insufficient ETH");
        
        // Update balances before transfer to prevent reentrancy
        users[msg.sender].fiatBalance -= fiatAmount;
        bankFiatReserve += fiatAmount;

        // Send ETH to user
        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer to user failed");

        emit CryptoWithdrawn(msg.sender, ethAmount, fiatAmount);
        emit BalanceUpdated(msg.sender, users[msg.sender].fiatBalance, msg.sender.balance);
    }

    // Admin can pause the contract
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Admin can add fiat reserve
    function fundBankFiat(uint256 amount) external onlyOwner {
        bankFiatReserve += amount;
    }

    receive() external payable {}
}
