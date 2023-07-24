


function isValidHex(hex: string) {
  const regex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i
  return regex.test(hex)
}


function rgbToHsl(r: number, g: number, b: number): number[] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l

  if (max === min) {
    h = 0
  } else if (max === r) {
    h = ((g - b) / (max - min)) % 6
  } else if (max === g) {
    h = (b - r) / (max - min) + 2
  } else {
    h = (r - g) / (max - min) + 4
  }

  h = Math.round(h * 60)
  if (h < 0) {
    h += 360
  }

  l = (max + min) / 2

  if (max === min) {
    s = 0
  } else if (l <= 0.5) {
    s = (max - min) / (max + min)
  } else {
    s = (max - min) / (2 - max - min)
  }

  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return [h, s, l]
}

function hexToHue(hex: string) {
  let color = hex
  if (color.startsWith('#')) {
    color = color.slice(1)
  }
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const rgb = parseInt(color, 16)
  const r = (rgb >> 16) & 255
  const g = (rgb >> 8) & 255
  const b = rgb & 255
  const hsl = rgbToHsl(r, g, b)
  return Math.round(hsl[0])
}

const isDarkMode: boolean = false // true

export const colorSchemes = [
  {
    name: 'Monochromatic',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,       // text
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,     // bg
        `hsl(${baseHue}, ${baseSaturation}%, ${primbuttnLightness}%)`, // primary
        `hsl(${baseHue}, ${baseSaturation}%, ${secbuttnLightness}%)`, //secondary
        `hsl(${baseHue}, ${baseSaturation}%, ${accentLightness}%)`,  // accent
      ]

      return colors
    },
  },
  {
    name: 'Analogous',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const analogousHue1 = (baseHue + 30) % 360
      const analogousHue2 = (baseHue + 60) % 360
      const analogousHue3 = (baseHue + 60) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${analogousHue1}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${analogousHue2}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${analogousHue3}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Complementary',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const complementaryHue = (baseHue + 180) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${complementaryHue}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${complementaryHue}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Triadic',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const triadicHue1 = (baseHue + 120) % 360
      const triadicHue2 = (baseHue + 240) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${triadicHue1}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${triadicHue2}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Split Complementary',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const complementaryHue = (baseHue + 180) % 360
      const splitComplementaryHue1 = (complementaryHue + 30) % 360
      const splitComplementaryHue2 = (complementaryHue + 330) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${complementaryHue}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${splitComplementaryHue1}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${splitComplementaryHue2}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Double Split Complementary',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const complementaryHue = (baseHue + 180) % 360
      const splitComplementaryHue1 = (complementaryHue + 30) % 360
      const splitComplementaryHue2 = (complementaryHue + 330) % 360
      const doubleSplitComplementaryHue1 = (splitComplementaryHue1 + 30) % 360
      const doubleSplitComplementaryHue2 = (splitComplementaryHue2 + 30) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${complementaryHue}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${doubleSplitComplementaryHue1}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${doubleSplitComplementaryHue2}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Square',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const squareHue1 = (baseHue + 90) % 360
      const squareHue2 = (baseHue + 180) % 360
      const squareHue3 = (baseHue + 270) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${squareHue1}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${squareHue2}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${squareHue3}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Compound',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)
      const compoundHue1 = (baseHue + 30) % 360
      const compoundHue2 = (baseHue + 180) % 360
      const compoundHue3 = (baseHue + 210) % 360

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${compoundHue1}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${compoundHue2}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${compoundHue3}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
  {
    name: 'Shades',
    baseHue: null,
    generateColors: function () {
      let baseHue
      if (typeof this.baseHue !== 'undefined' && isValidHex(this.baseHue! as string)) {
        baseHue = hexToHue(this.baseHue! as string)
      } else {
        baseHue = Math.floor(Math.random() * 360)
      }
      const baseSaturation = Math.floor(Math.random() * 100)

      const firstLightness = isDarkMode
        ? Math.floor(Math.random() * 11) + 90
        : Math.floor(Math.random() * 11)
      const secondLightness = isDarkMode
        ? Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 11) + 90

      let secbuttnLightness

      if (isDarkMode) {
        secbuttnLightness = Math.floor(Math.random() * 11) + 5
      } else {
        secbuttnLightness = Math.floor(Math.random() * 11) + 80
      }

      const primbuttnLightness =
        secondLightness <= 20
          ? Math.floor(Math.random() * 61) + 20
          : Math.floor(Math.random() * 61) + 20
      const accentLightness = isDarkMode
        ? secbuttnLightness + 40
        : secbuttnLightness - 40

      const colors = [
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${accentLightness}%)`,
      ]

      return colors
    },
  },
]
