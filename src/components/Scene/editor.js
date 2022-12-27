import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable */
import { Avatar } from "@mui/material";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import legsIcon from '../../assets/media/legs.png';
import shoesIcon from '../../assets/media/shoes.png';
import armsIcon from '../../assets/media/arms.png';
import shirtIcon from '../../assets/media/shirt.png';
import faceIcon from '../../assets/media/face.png';
import hairIcon from '../../assets/media/hair.png';
import colorIcon from '../../assets/media/color.png';
export default function Editor(props) {
    const { editor, wrapClass } = props;
    const { category, setCategory } = useGlobalState();
    const { modelNodes, scene, downloadPopup, mintPopup, template, setTemplate } = useGlobalState();
    return (_jsx("div", { className: "editor-wrap", children: _jsxs(Stack, { direction: "row", divider: _jsx(Divider, { orientation: "vertical", flexItem: true }), spacing: 2, justifyContent: "center", alignItems: "center", children: [_jsxs("div", { onClick: () => setCategory('color'), className: category && category === "color" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: colorIcon }), _jsx("br", {}), "Skin Tone"] }), _jsxs("div", { onClick: () => setCategory('body'), className: category && category === "body" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: faceIcon }), _jsx("br", {}), "Body"] }), _jsxs("div", { onClick: () => setCategory('hair'), className: category && category === "hair" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: hairIcon }), _jsx("br", {}), "Hair"] }), _jsxs("div", { onClick: () => setCategory('face'), className: category && category === "face" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: faceIcon }), _jsx("br", {}), "Face"] }), _jsxs("div", { onClick: () => setCategory('tops'), className: category && category === "tops" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: shirtIcon }), _jsx("br", {}), "Tops"] }), _jsxs("div", { onClick: () => setCategory('arms'), className: category && category === "arms" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: armsIcon }), _jsx("br", {}), "Arms"] }), _jsxs("div", { onClick: () => setCategory('shoes'), className: category && category === "shoes" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: shoesIcon }), _jsx("br", {}), "Shoes"] }), _jsxs("div", { onClick: () => setCategory('legs'), className: category && category === "legs" ? "selector-button active" : "selector-button", children: [_jsx(Avatar, { className: "icon", src: legsIcon }), _jsx("br", {}), "Legs"] })] }) }));
}
