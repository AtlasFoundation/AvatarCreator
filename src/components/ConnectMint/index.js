import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import "./style.scss";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GavelIcon from "@mui/icons-material/Gavel";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../../library/contract";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useGlobalState } from "../GlobalProvider";
import { apiService } from "../../services/api";
import { Modal, Typography } from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { TemplateModel } from "../Scene/models";
import { Box } from "@mui/system";
import "./style.scss";
import { threeService } from "../../services";
import { PlugWallet } from '../PlugWallet';
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};
// const API_URL = "http://localhost:8081";
const API_URL = "http://34.214.42.55:8081";
export default function ConnectMint() {
    console.log("import.meta.env.VITE_APP_USE_ETHEREUM is", import.meta.env.VITE_APP_USE_ETHEREUM);
    const { ethereum } = window;
    const { activate, deactivate, library, account } = useWeb3React();
    const { modelNodes, mintPopup, setMintPopup, scene, mintPrice, mintPricePublic, totalMinted, setTotalMinted, totalToBeMinted, hair, face, tops, arms, shoes, legs, } = useGlobalState();
    const injected = new InjectedConnector({
        supportedChainIds: [1, 3, 4, 5, 42, 97],
    });
    const [connected, setConnected] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [mintLoading, setMintLoading] = useState(false);
    const [principalId, setPrincipalId] = useState(false);
    const [glb, setGLB] = useState(null);
    const [screenshot, setScreenshot] = useState(null);
    const connectWallet = async () => {
        try {
            await activate(injected);
        }
        catch (ex) {
            console.log(ex);
        }
    };
    useEffect(() => {
        account ? setConnected(true) : setConnected(false);
    }, [account]);
    useEffect(() => {
        if (glb && screenshot) {
            if (import.meta.env.VITE_APP_USE_IC) {
                mintAvatarToIC();
            }
            else {
                mintAvatarToEthereum();
            }
        }
    }, [glb, screenshot]);
    const disConnectWallet = async () => {
        try {
            deactivate();
            setConnected(false);
        }
        catch (ex) {
            console.log(ex);
            alertModal(ex.message);
        }
    };
    const alertModal = async (msg) => {
        setAlertTitle(msg);
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 4000);
    };
    const generateMintFiles = async () => {
        setMintLoading(true);
        threeService
            .getScreenShotByElementId("mint-screenshot-canvas-wrap")
            .then((screenshot) => {
            if (screenshot) {
                setScreenshot(screenshot);
                threeService.getModelFromScene(scene, "gltf/glb").then((glb) => {
                    setGLB(glb);
                    console.log(glb);
                    console.log(screenshot);
                });
            }
        });
    };
    const mintAvatarToIC = async () => {
        try {
            await window.ic.plug.requestConnect();
        }
        catch {
            console.error("Failed to connect to Plug");
        }
        //////////////////////////// upload part //////////////////////
        /// ---------- glb -------------- ////////////////
        const formData = new FormData();
        formData.append("profile", glb);
        // TODO: Upload static static assets to canister
        const glburl = null; // = await apiService.saveFileToPinata(formData);
        const jpgformData = new FormData();
        jpgformData.append("profile", screenshot);
        const jpgurl = null; // = await apiService.saveFileToPinata(jpgformData);
        const imageUrl = null;
        const animationUrl = null;
        const metadata = {
            name: import.meta.env.VITE_ASSET_NAME ?? "Avatars",
            description: import.meta.env.VITE_ASSET_DESCRIPTION ?? "Custom avatars.",
            image: imageUrl,
            animation_url: animationUrl,
            attributes: [
                {
                    trait_type: "Hair",
                    value: hair?.traitInfo ? hair?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Face",
                    value: face?.traitInfo ? face?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Tops",
                    value: tops?.traitInfo ? tops?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Arms",
                    value: arms?.traitInfo ? arms?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Legs",
                    value: legs?.traitInfo ? legs?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Shoes",
                    value: shoes?.traitInfo ? shoes?.traitInfo?.name : "None"
                }
            ]
        };
        // TODO: mint with metadata
        setMintLoading(false);
        handleCloseMintPopup();
        alertModal("Public Mint Success");
    };
    const mintAvatarToEthereum = async () => {
        //////////////////////////// upload part //////////////////////
        /// ---------- glb -------------- ////////////////
        const formData = new FormData();
        formData.append("profile", glb);
        const glburl = await apiService.saveFileToPinata(formData);
        /// ---------- .jpg (screenshot) -------------- ////////////////
        const jpgformData = new FormData();
        jpgformData.append("profile", screenshot);
        const jpgurl = await apiService.saveFileToPinata(jpgformData);
        console.log("UPLOADED TO PINATA, Upload Result", jpgurl);
        /// ---------- metadata ------------- /////////////////
        const metadata = {
            name: import.meta.env.VITE_ASSET_NAME ?? "Avatars",
            description: import.meta.env.VITE_ASSET_DESCRIPTION ?? "Custom avatars.",
            image: "https://gateway.pinata.cloud/ipfs/" + jpgurl.IpfsHash,
            animation_url: "https://gateway.pinata.cloud/ipfs/" + glburl.IpfsHash,
            attributes: [
                {
                    trait_type: "Hair",
                    value: hair?.traitInfo ? hair?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Face",
                    value: face?.traitInfo ? face?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Tops",
                    value: tops?.traitInfo ? tops?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Arms",
                    value: arms?.traitInfo ? arms?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Legs",
                    value: legs?.traitInfo ? legs?.traitInfo?.name : "None"
                },
                {
                    trait_type: "Shoes",
                    value: shoes?.traitInfo ? shoes?.traitInfo?.name : "None"
                }
            ]
        };
        const MetaDataUrl = await apiService.saveMetaDataToPinata(metadata);
        console.log(MetaDataUrl);
        let amountInEther = mintPricePublic;
        try {
            console.log("public");
            const options = {
                value: ethers.utils.parseEther(amountInEther),
                from: account,
            };
            await contract.mintNormal("ipfs://" + MetaDataUrl.data.IpfsHash, options); // tokenuri
            setMintLoading(false);
            handleCloseMintPopup();
            alertModal("Public Mint Success");
        }
        catch (error) {
            console.log(error);
            handleCloseMintPopup();
            // alertModal(error.message);
            alertModal("Public Mint Failed");
        }
        return false;
    };
    const handleOpenMintPopup = async () => {
        setMintPopup(true);
        // ethereum
        if (account) {
            const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const MintedToken = await contract.totalSupply();
            setTotalMinted(parseInt(MintedToken));
        }
    };
    const handleCloseMintPopup = () => {
        setMintPopup(false);
    };
    const handleConnect = (principalId) => {
        console.log("Logged in with principalId", principalId);
        setPrincipalId(principalId);
        setConnected(true);
    };
    const handleFail = (error) => {
        console.log("Failed to login with Plug", error);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "connect-mint-wrap", children: [import.meta.env.VITE_APP_USE_IC === "true" && (_jsx(PlugWallet, { onConnect: handleConnect, onFail: handleFail })), import.meta.env.VITE_APP_USE_ETHEREUM === "true" && !connected &&
                        _jsx(Button, { variant: "contained", startIcon: _jsx(AccountBalanceWalletIcon, {}), onClick: connectWallet, children: "Connect" }), connected &&
                        _jsx(React.Fragment, { children: _jsx(Button, { variant: "contained", startIcon: _jsx(GavelIcon, {}), onClick: handleOpenMintPopup, children: "Mint" }) }), _jsx(Modal, { open: mintPopup, onClose: handleCloseMintPopup, "aria-labelledby": "child-modal-title", "aria-describedby": "child-modal-description", children: _jsxs(Box, { sx: { ...style, border: 0 }, children: [mintLoading && (_jsx(Box, { className: "mint-loading", children: _jsx(Typography, { className: "vh-centered", children: "Minting Model" }) })), _jsx(Button, { onClick: handleCloseMintPopup, className: "close-popup", children: _jsx(CloseIcon, {}) }), _jsxs(Typography, { variant: "h6", style: { marginTop: "-4px" }, children: [_jsx(GavelIcon, { className: "title-icon" }), " Mint Avatar"] }), _jsx("div", { id: "mint-screenshot-canvas-wrap", className: `canvas-wrap`, style: {
                                        height: 2080,
                                        width: 2080,
                                        zoom: 0.2,
                                        background: "#111111",
                                    }, children: _jsxs(Canvas, { className: "canvas", id: "screenshot-scene", gl: { preserveDrawingBuffer: true }, children: [_jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 1, position: [0, 3.5, 2], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 0.2, position: [-5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 0.2, position: [5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { 
                                                // ref={ref}
                                                intensity: 0.3, position: [0, -2, -8], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx(OrbitControls, { minDistance: 1, maxDistance: 1, minPolarAngle: 0, maxPolarAngle: Math.PI / 2 - 0.1, enablePan: false, target: [0, 1.5, 0] }), _jsx(PerspectiveCamera, { near: 0.0001, fov: 25, children: mintPopup && (_jsx(TemplateModel, { nodes: modelNodes, scene: scene })) })] }) }), _jsx(Button, { variant: "contained", className: "mint-model-button", onClick: generateMintFiles, children: _jsx(React.Fragment, { children: "MINT" }) })] }) })] }), showAlert && (_jsx(Alert, { id: "alertTitle", variant: "filled", severity: "success", action: _jsx(IconButton, { "aria-label": "close", color: "inherit", size: "small", onClick: () => {
                        setShowAlert(false);
                    }, children: _jsx(CloseIcon, { fontSize: "inherit" }) }), sx: { mb: 2 }, children: alertTitle }))] }));
}
