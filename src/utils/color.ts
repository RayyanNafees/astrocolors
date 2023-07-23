export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export interface RGBobject{
  r: number
  g: number
  b: number
}

interface HSV {
  h: number
  s: number
  v: number
}

interface HSL {
  h: number
  s:number
  l: number
}
/**
 * Converts the `rgb(0,0,0)` string to `{r,g,b}` object
 * @param {string} color The `rgb(0,0,0)` patterned string value
 * @returns {RGBobject} The {r, g, b} object
 */
function parseColor(color: string): RGBobject {
  const regexRgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
  const matchRgb = regexRgb.exec(color)
  if (matchRgb) {
    return {
      r: parseInt(matchRgb[1]),
      g: parseInt(matchRgb[2]),
      b: parseInt(matchRgb[3]),
    }
  }

  const regexHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const matchHex = regexHex.exec(color)
  if (matchHex) {
    const hex = matchHex[1]
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return {
      r,
      g,
      b,
    }
  }

  throw new Error('Invalid color value: ' + color)
}


/**
 * Returns the Luminance value of the supplied object of rgb value
 * @param {RGBobject} color rbv object for color values
 * @returns {number} Luminance value of the color
 */
function getLuminance(color: RGBobject): number {
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  const luminance =
    0.2126 * Math.pow(r, 2.2) +
    0.7152 * Math.pow(g, 2.2) +
    0.0722 * Math.pow(b, 2.2)
  return luminance
}

/**
 * Retuns the Contrast Ration bey=tween the `background:foreground`
 * @param {string} background the `rgb(0,0,0)` background value
 * @param {string} foreground the `rgb(0,0,0)` foreground color value
 * @returns {number} Contrast Ratio between `0` and `1`
 */
export function getContrastRatio(background: string, foreground:string):number {
  const bg = parseColor(background)
  const fg = parseColor(foreground)

  const l1 = getLuminance(bg)
  const l2 = getLuminance(fg)

  if (l1 > l2) {
    return (l1 + 0.05) / (l2 + 0.05)
  } else {
    return (l2 + 0.05) / (l1 + 0.05)
  }
}

/**
 * Returns the % of contrast of the supplied color
 * @param {string} color Hexadecimal or rgb(,,,) Color value to get the contrast of
 * @returns {number} Contrast numeric value between `1` to `100`
 */
export const getBrightness = (color: string): number => {
  let hex = color

  
  if (color.substring(0, 3) === 'rgb') {
    const [r, g, b] = color.match(/\d+/g)!
    hex = '#' + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1)
  }

  if (hex === '#000000') return 0
  if (hex === '#FFFFFF') return 100

  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  return (l * 100) / 255
}


function hexToHSL(hexColor: string): HSL {
  let r, g, b: number

  if (hexColor.length === 3) {
    r = parseInt(hexColor[0] + hexColor[0], 16) / 255
    g = parseInt(hexColor[1] + hexColor[1], 16) / 255
    b = parseInt(hexColor[2] + hexColor[2], 16) / 255
  } else if (hexColor.length === 6) {
    r = parseInt(hexColor.slice(0, 2), 16) / 255
    g = parseInt(hexColor.slice(2, 4), 16) / 255
    b = parseInt(hexColor.slice(4, 6), 16) / 255
  } else {
    return { h: 0, s: 0, l: 0 }
  }

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h!:number, s, l: number

  l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return { h, s, l }
}


function calculateLightness(hexColor:string): number {
  const hslColor = hexToHSL(hexColor)

  const lightness = hslColor.l

  return lightness * 100
}