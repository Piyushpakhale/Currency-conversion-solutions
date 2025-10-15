import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import CryptoDebitCard from '../contracts/CryptoDebitCard.json';

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isBank, setIsBank] = useState(false);
    const [userBalance, setUserBalance] = useState({ fiat: 0, crypto: 0 });
    const [bankBalance, setBankBalance] = useState({ fiat: 0, crypto: 0 });
    const [error, setError] = useState('');

    const loadBalances = useCallback(async () => {
        if (contract && account) {
            try {
                console.log("Fetching user details...");
                const [fiatBalance, cryptoBalance] = await contract.getUserDetails();
                console.log("User balances:", { fiat: fiatBalance.toString(), crypto: cryptoBalance.toString() });
                setUserBalance({
                    fiat: ethers.utils.formatUnits(fiatBalance, 0),
                    crypto: ethers.utils.formatEther(cryptoBalance)
                });

                console.log("Fetching bank details...");
                const [bankFiat, bankCrypto] = await contract.getBankDetails();
                console.log("Bank balances:", { fiat: bankFiat.toString(), crypto: bankCrypto.toString() });
                setBankBalance({
                    fiat: ethers.utils.formatUnits(bankFiat, 0),
                    crypto: ethers.utils.formatEther(bankCrypto)
                });
            } catch (error) {
                console.error("Error loading balances:", error);
                setError("Failed to load balances: " + error.message);
            }
        }
    }, [contract, account]);

    const connectWallet = useCallback(async () => {
        console.log("Attempting to connect wallet...");
        try {
            if (!window.ethereum) {
                console.log("MetaMask not found!");
                setError("MetaMask not found! Please install MetaMask extension.");
                return;
            }

            console.log("MetaMask found, requesting accounts...");
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            console.log("Accounts received:", accounts);
            if (accounts.length === 0) {
                setError("No accounts found. Please connect your MetaMask account.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log("Web3Provider created");
            
            const network = await provider.getNetwork();
            console.log("Connected to network:", network);

            const signer = provider.getSigner();
            const address = await signer.getAddress();
            console.log("Connected address:", address);
            
            setProvider(provider);
            setAccount(address);
            setError('');

            // Initialize contract
            const contractAddress = CryptoDebitCard.address;
            console.log("Contract address:", contractAddress);
            
            if (contractAddress === "0x0000000000000000000000000000000000000000") {
                setError("Contract address not set. Please update the contract address in CryptoDebitCard.json");
                return;
            }

            console.log("Creating contract instance...");
            const contract = new ethers.Contract(
                contractAddress,
                CryptoDebitCard.abi,
                signer
            );
            setContract(contract);

            // Check if the connected account is the bank
            console.log("Checking if account is bank...");
            const bankAddress = await contract.bank();
            console.log("Bank address:", bankAddress);
            const isBankAccount = address.toLowerCase() === bankAddress.toLowerCase();
            console.log("Is bank account:", isBankAccount);
            setIsBank(isBankAccount);

            // Load initial balances
            console.log("Loading balances...");
            await loadBalances();
            console.log("Wallet connection complete!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError(error.message || "Failed to connect wallet");
            // Reset states on error
            setAccount('');
            setContract(null);
            setProvider(null);
            setIsBank(false);
        }
    }, [loadBalances]);

    const deposit = useCallback(async (amount) => {
        try {
            console.log("Initiating deposit of", amount, "ETH");
            const tx = await contract.deposit({
                value: ethers.utils.parseEther(amount)
            });
            console.log("Deposit transaction:", tx.hash);
            await tx.wait();
            console.log("Deposit confirmed");
            await loadBalances();
        } catch (error) {
            console.error("Error depositing:", error);
            throw error;
        }
    }, [contract, loadBalances]);

    const withdraw = useCallback(async (amount) => {
        try {
            console.log("Initiating withdrawal of", amount, "USD");
            
            // Get bank details first
            const [bankFiatReserve, bankEthBalance] = await contract.getBankDetails();
            console.log("Bank ETH Balance:", ethers.utils.formatEther(bankEthBalance), "ETH");
            
            // Calculate required ETH amount using ethers.utils
            const amountBN = ethers.utils.parseUnits(amount.toString(), 0);
            const ethAmount = amountBN.mul(ethers.utils.parseEther("1")).div(3000); // ETH_USD_PRICE = 3000
            console.log("Required ETH amount:", ethers.utils.formatEther(ethAmount), "ETH");
            
            // Check if bank has enough ETH
            if (bankEthBalance.lt(ethAmount)) {
                throw new Error(`Bank has insufficient ETH. Required: ${ethers.utils.formatEther(ethAmount)} ETH, Available: ${ethers.utils.formatEther(bankEthBalance)} ETH`);
            }
            
            // Get gas estimate first
            const gasEstimate = await contract.estimateGas.withdraw(amount);
            console.log("Estimated gas:", gasEstimate.toString());
            
            // Add 50% buffer to gas estimate for safety
            const gasLimit = gasEstimate.mul(150).div(100);
            console.log("Gas limit with buffer:", gasLimit.toString());
            
            const tx = await contract.withdraw(amount, {
                gasLimit: gasLimit
            });
            console.log("Withdrawal transaction:", tx.hash);
            await tx.wait();
            console.log("Withdrawal confirmed");
            await loadBalances();
        } catch (error) {
            console.error("Error withdrawing:", error);
            throw error;
        }
    }, [contract, loadBalances]);

    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            console.log("Accounts changed:", accounts);
            if (accounts.length > 0) {
                connectWallet();
            } else {
                // Reset states when all accounts are disconnected
                setAccount('');
                setContract(null);
                setProvider(null);
                setIsBank(false);
            }
        };

        const handleChainChanged = (chainId) => {
            console.log("Network changed:", chainId);
            window.location.reload();
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [connectWallet]);

    return (
        <BlockchainContext.Provider value={{
            account,
            contract,
            provider,
            isBank,
            userBalance,
            bankBalance,
            error,
            connectWallet,
            deposit,
            withdraw,
            loadBalances
        }}>
            {children}
        </BlockchainContext.Provider>
    );
};

export const useBlockchain = () => useContext(BlockchainContext); 