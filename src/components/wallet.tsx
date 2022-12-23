import React from "react";
import CloseIcon from '@mui/icons-material/Close';
import MintIcon from "@mui/icons-material/Wallet";
import { Modal } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { Box } from "@mui/system";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { Canvas } from "@react-three/fiber";
import { sceneService } from "../services";
import { TemplateModel } from "./Models";
import { id } from "ethers/lib/utils";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };
  
  const closePopup = {
    position: "absolute",
    right: 0,
    top: 8,
    background: "none",
    color: "#999999"
  }
  
  export default function WalletConnect({ scene, templateInfo, model, walletPopup, setWalletPopup }) {
    const saveScreenshot = async (id:string) => {
      sceneService.saveScreenShotByElementId(id).then(() => {});
    };
    const mintModel = async (id:string) => {
      sceneService.mintScreenShotByElementID(id).then(() => {});
    };
    const handleOpen = () => {
      setWalletPopup(true);
    };
    const handleClose = () => {
      setWalletPopup(false);
    };
  
    return (
      <div style={{
        position: "absolute",
        top: "20px",
        right: "154px",
        zIndex: 10
      }}>
        <Button
          id="wallet-button"
          aria-controls="wallet-menu"
          aria-haspopup="true"
          aria-expanded={walletPopup ? "true" : undefined}
          onClick={handleOpen}
        >
          <Avatar>
            <MintIcon />
          </Avatar>
        </Button>
        <Modal
          open={walletPopup}
          onClose={handleClose}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-description"
        >
          <Box sx={{ ...style, border: 0 }}>
          <Button onClick={handleClose} sx={closePopup}><CloseIcon /></Button>
          <Button onClick={() => mintModel('vrm')}>Mint VRM</Button> 
          <Button onClick={() => mintModel('gltf/glb')}>Download GLB</Button>
         <Button onClick={() => saveScreenshot('screenshot-canvas-wrap')}>Screenshot</Button>
          <div
          id="screenshot-canvas-wrap"
          style={{ height: 2080, width: 2080, zoom: 0.2, background: "#111111" }}
        >
          <Canvas
            id="screenshot-scene"
            gl={{ preserveDrawingBuffer: true }}
          >
            <spotLight
              // ref={ref}
              intensity={1}
              position={[0, 3.5, 2]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              castShadow
            />
            <spotLight
              // ref={ref}
              intensity={0.2}
              position={[-5, 2.5, 4]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              // castShadow
            />
            <spotLight
              // ref={ref}
              intensity={0.2}
              position={[5, 2.5, 4]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              // castShadow
            />
            <spotLight
              // ref={ref}
              intensity={0.3}
              position={[0, -2, -8]}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              castShadow
            />
            <OrbitControls
              minDistance={1}
              maxDistance={2}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2 - 0.1}
              enablePan={false}
              target={[0, 1, 0]}
            />
            <PerspectiveCamera>
              {walletPopup && (
              <TemplateModel scene={scene} />
              )}
            </PerspectiveCamera>
          </Canvas>
        </div>
          </Box>
        </Modal>
      </div>
    );
  };