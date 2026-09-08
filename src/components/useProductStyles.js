import React from "react";
import { T as staffTheme } from "../data/theme.js";
import { card as staffCard, btn as staffButton } from "../utils/styles.js";
import { KioskFlowContext } from "./KioskFlowContext.jsx";

export function useProductStyles() {
  const kiosk = React.useContext(KioskFlowContext);
  if (!kiosk) return { T: staffTheme, card: staffCard, btn: staffButton };
  const T = {
    ...staffTheme,
    kiosk: true,
    primary: "#65358b",
    primaryD: "#65358b",
    primaryL: "#f4e4b9",
    bg: "#f7f2e8",
    bgCard: "#fffdf8",
    txt: "#28222a",
    txtSub: "#756c70",
    brd: "#ded5c7",
    ok: "#65358b",
    no: "#65358b",
    sh: "none",
    shSoft: "none",
  };
  return {
    T,
    card: (extra = {}) => ({
      background: T.bgCard,
      border: "1px solid " + T.brd,
      borderRadius: 5,
      boxShadow: "none",
      ...extra,
    }),
    btn: (background, color, extra = {}) => ({
      ...staffButton(background, color, extra),
      minHeight: 56,
      fontSize: 20,
      borderRadius: 5,
    }),
  };
}
