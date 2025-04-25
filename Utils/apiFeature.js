import { ethers, toNumber } from "ethers";
import Web3Modal from "web3modal";
import { ChatAppAddress, ChatAppABI } from "../Context/constants";
import  BrowserProvider  from "ethers";
export const CheckIfWalletConnected = async () => {
    try {
        if (!window.ethereum) return console.log("Install Metamask");

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });

        return accounts[0]; // Return the first account
    } catch (error) {
        console.log(error);
    }
};

export const connectWallet = async () => {
    try {
        if (!window.ethereum) return console.log("Install Metamask");

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        return accounts[0]; // Return the first account
    } catch (error) {
        console.log(error);
    }
};

const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ChatAppAddress, ChatAppABI, signerOrProvider);

export const connectingWithContract = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.BrowserProvider(connection); // FIXED
        const signer = await provider.getSigner();
        const contract = fetchContract(signer);

        return contract;
    } catch (error) {
        console.log(error);
    }
};

export const convertTime = (time) => {
    const newTime = new Date(toNumber(time)); 

    const realTime =
        newTime.getHours() +
        ":" +
        newTime.getMinutes() +
        ":" +
        newTime.getSeconds() +
        "  Date: " +
        newTime.getDate() +
        "/" +
        (newTime.getMonth() + 1) +
        "/" +
        newTime.getFullYear();

    return realTime;
};
