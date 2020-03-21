import stc from "./web_modules/string-to-color.js";

export const stringToHex = stc;

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

export function stringToRGB(str) {
  return hexToRgb(stc(str));
}
