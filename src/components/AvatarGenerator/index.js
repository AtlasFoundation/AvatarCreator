import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from "react";
import "./style.scss";
import { Button, Typography } from "@mui/material";
import { useGlobalState } from "../GlobalProvider";
import CharacterEditor from "../CharacterEditor";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../../library/contract";
function AvatarGenerator() {
    const [step, setStep] = React.useState(0);
    const { setTotalMinted, mintPrice, mintPricePublic, template, setTemplate, } = useGlobalState();
    const [editAvatar, setEditAvatar] = React.useState(0);
    const { ethereum } = window;
    useEffect(() => {
        //getMintedToken();
    });
    const getMintedToken = async () => {
        // const signer = new ethers.providers.Web3Provider(ethereum).getSigner("0xB565D3A7Bcf568f231726585e0b84f9E2a3722dB");
        // const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []); // <- this promps user to connect metamask
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const MintedToken = await contract.totalSupply();
        setTotalMinted(parseInt(MintedToken));
    };
    if (editAvatar) {
        return _jsx(CharacterEditor, {});
    }
    else {
        return (_jsx("header", { className: "avatar-generator-wrap", children: _jsxs("div", { className: "vh-centered wizard-wrap", children: [_jsx(Typography, { variant: "h5", align: "center", mb: 1, children: "MINT YOUR METAVERSE AVATAR" }), _jsx(Typography, { align: "center", children: "Customise your own avatar." }), _jsxs(Typography, { align: "center", mb: 2, children: ["Public Mint Price: ", mintPricePublic, " ETH | WL Mint Price:", " ", mintPrice, " ETH"] }), _jsx(Typography, { align: "center", variant: "h6", mb: 2, children: "Select a Template To Start" }), _jsx("div", { className: "step-content", children: _jsx(Button, { className: "button", variant: "contained", onClick: () => setEditAvatar(1), disabled: !template && true, children: "Start" }) })] }) }));
    }
}
export default AvatarGenerator;
