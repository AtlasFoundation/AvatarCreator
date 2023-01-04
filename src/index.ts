import CharacterEditor from "./components";
import {sceneService} from "./services";
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"

import { createTheme } from "@mui/material";

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#b240e0",
    },
  },
});

export {
  CharacterEditor,
  sceneService,
  defaultTheme,
  LoadingOverlayCircularStatic,
}