import QRcode from 'qrcode'
import JSZip from 'jszip'
// import {} from 'FileSaver'
import { saveAs } from 'file-saver'
import { faqQuestions } from './misc'

const primaryButtons = document.querySelectorAll<HTMLElement>('.primary-button')
const secondaryButtons =
  document.querySelectorAll<HTMLElement>('.secondary-button')
const partTwo = document.querySelectorAll<HTMLElement>('.part2')
const primbuttnColorClass = document.querySelector<HTMLElement>(
  '.primbuttn'
) as HTMLElement
const secbuttnColorClass = document.querySelector<HTMLElement>(
  '.secbuttn'
) as HTMLElement
const accentColorClass = document.querySelector<HTMLElement>(
  '.accent'
) as HTMLElement
const primColorClass = document.querySelector<HTMLElement>('.prim') as HTMLElement
const secColorClass = document.querySelector<HTMLElement>('.sec') as HTMLElement
const primaryColor = <HTMLInputElement>document.getElementById('prim')
const secondaryColor = <HTMLInputElement>document.getElementById('sec')
const primbuttnColor = <HTMLInputElement>document.getElementById('primbuttn')
const secbuttnColor = <HTMLInputElement>document.getElementById('secbuttn')
const accentColor = <HTMLInputElement>document.getElementById('accent')
const randomizeButton = document.getElementById('randomize')
const colorPickers = document.querySelectorAll<HTMLInputElement>('.colorpicker')
const hexInputs = document.querySelectorAll<HTMLInputElement>('.hex-input')
const hueRotationInputs =
  document.querySelectorAll<HTMLInputElement>('.hue-rotation')
const hueUnderlays = document.querySelectorAll<HTMLElement>('.color-underlay')

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const hsvToRgb = (h: number, s: number, v: number): number[] => {
  let r!: number, g!: number, b!: number

  let i = Math.floor(h * 6)
  let f = h * 6 - i
  let p = v * (1 - s)
  let q = v * (1 - f * s)
  let t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      ;(r = v), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = v), (b = p)
      break
    case 2:
      ;(r = p), (g = v), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = v)
      break
    case 4:
      ;(r = t), (g = p), (b = v)
      break
    case 5:
      ;(r = v), (g = p), (b = q)
      break
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]
}
interface RGB {
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
  s: number
  l: number
}

function hexToRgb2(hex: string): RGB {
  const bigint = parseInt(hex.substring(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number = 0, // Added =0 yourself, can cause issues
    s: number,
    v: number = max

  const d = max - min
  s = max === 0 ? 0 : d / max

  if (max === min) {
    h = 0
  } else {
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

  return {
    h: h,
    s: s,
    v: v,
  }
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

window.addEventListener('load', () => {
  attachColorPickerListeners(colorPickers, hexInputs)
})

//console.clear();

function updateLinks() {
  const slug = currentSlug
  const links = document.querySelectorAll<HTMLElement>('a:not([href^="#"])')
  links.forEach((link) => {
    const href = link.getAttribute('href')!
    const classes = link.getAttribute('class')

    if (classes && classes.includes('inbound')) {
      return
    }

    if (href.startsWith('https://realtimecolors.com')) {
      const url = new URL(href)
      url.searchParams.set('colors', slug)
      link.setAttribute('href', url.toString())
    } else if (!href.startsWith('https://') && !href.startsWith('mailto:')) {
      const url = new URL(href, window.location.origin)
      url.searchParams.set('colors', slug)
      link.setAttribute('href', url.toString())
    }
  })
}

let currentSlug = ''
const checkForUpdates = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const newSlug = urlParams.get('colors')
  if (newSlug && newSlug !== currentSlug) {
    currentSlug = newSlug
    updateLinks()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    checkForUpdates()
    updateLinks()
    setInterval(checkForUpdates, 100)
  }, 1000)
})

updateLinks()

const PICKER_HEIGHT = 200
const PICKER_WIDTH = 200
let currentHue: number[] = []
let currentSaturation: number[] = []
let currentValue: number[] = []

const getCurrentColor = (index: number): number[] => {
  return hsvToRgb(
    currentHue[index],
    currentSaturation[index],
    currentValue[index]
  )
}

function attachColorPickerListeners(
  colorPickers: NodeListOf<HTMLInputElement>,
  hexInputs: NodeListOf<HTMLInputElement>
) {
  const updateColorPickers = () => {
    for (let i = 0; i < colorPickers.length; i++) {
      const hexValue = hexInputs[i].value
      const rgbValue = hexToRgb2(hexValue)
      const hsvValue = rgbToHsv(rgbValue.r, rgbValue.g, rgbValue.b)
      const hue = hsvValue.h
      const saturation = hsvValue.s
      const value = hsvValue.v

      currentHue[i] = hue
      currentSaturation[i] = saturation
      currentValue[i] = value

      hueRotationInputs[i].value = String(hue * 360)
      hueUnderlays[i].style.background = `hsl(${hue * 360}, 100%, 50%)`

      const selectedColor =
        document.querySelectorAll<HTMLElement>('.selected-color')[i]
      selectedColor.style.backgroundColor = hexValue

      const slHandle = document.querySelectorAll<HTMLElement>('.sl-handle')[i]
      const pickerRect = document
        .querySelectorAll<HTMLElement>('.sat-lightness-picker')
        [i].getBoundingClientRect()
      const xPos = saturation * PICKER_WIDTH
      const yPos = (1 - value) * PICKER_HEIGHT
      slHandle.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`
      const inputEvent = new Event('input', { bubbles: true })
      slHandle.dispatchEvent(inputEvent)

      const slInput = document.querySelectorAll<HTMLElement>('.sl-handle')[i]
      slInput.style.backgroundColor = `rgb(${getCurrentColor(i)})`
    }
  }

  for (let i = 0; i < colorPickers.length; i++) {
    colorPickers[i].addEventListener('change', function () {
      const index = Array.prototype.indexOf.call(colorPickers, this)
      const colorValue = hexInputs[index].value
      updateUrlParams()
    })

    hexInputs[i].addEventListener('change', function () {
      let hexValue = this.value.trim().substring(0, 7)
      if (hexValue.length > 0) {
        if (hexValue[0] !== '#') {
          hexValue = '#' + hexValue
        }
        hexValue = hexValue.substring(0, 7)

        const isValidHex =
          /^#([0-9A-Fa-f]{6})$/.test(hexValue) ||
          /^#([0-9A-Fa-f]{3})$/.test(hexValue) ||
          /^[0-9A-Fa-f]{6}$/.test(hexValue) ||
          /^[0-9A-Fa-f]{3}$/.test(hexValue)

        if (isValidHex) {
          if (/^#([0-9A-Fa-f]{3})$/.test(hexValue)) {
            hexValue =
              '#' +
              hexValue[1] +
              hexValue[1] +
              hexValue[2] +
              hexValue[2] +
              hexValue[3] +
              hexValue[3]
          }
          const index = Array.prototype.indexOf.call(hexInputs, this)
          colorPickers[index].value = hexValue
          this.dataset.previousValue = hexValue
          const colorValue = hexInputs[index].value
          updateUrlParams()
        } else {
          this.value = this.dataset.previousValue!
        }
      } else {
        this.value = this.dataset.previousValue!
      }
    })

    hexInputs[i].addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        this.dispatchEvent(new Event('change'))
      }
    })

    hexInputs[i].addEventListener('focus', function () {
      this.dataset.previousValue = this.value
    })
  }

  checkForUpdates()
  updateLinks()
  updateColorPickers()

  fillDivsWithShades()
}

attachColorPickerListeners(colorPickers, hexInputs)

function updateUrlParams() {
  const primaryColorValue = primaryColor.value.replace('#', '')
  const secondaryColorValue = secondaryColor.value.replace('#', '')
  const primbuttnColorValue = primbuttnColor.value.replace('#', '')
  const secbuttnColorValue = secbuttnColor.value.replace('#', '')
  const accentColorValue = accentColor.value.replace('#', '')

  const defaultSlug = `${primaryColorValue}-${secondaryColorValue}-${primbuttnColorValue}-${secbuttnColorValue}-${accentColorValue}`

  window.history.replaceState({}, document.title, `?colors=${defaultSlug}`)
}

const updateColor = (index: number) => {
  const hexInputs = document.querySelectorAll<HTMLInputElement>('.hex-input')
  const colorPickers =
    document.querySelectorAll<HTMLInputElement>('.colorpicker')

  const selectedColor =
    document.querySelectorAll<HTMLElement>('.selected-color')[index]
  const hexInput = hexInputs[index]
  const colorPickerInput = colorPickers[index]

  selectedColor.setAttribute(
    'style',
    `background-color: rgb(${getCurrentColor(index)})`
  )

  const currentColor = getCurrentColor(index)
  const [r, g, b] = currentColor
  const calculatedHexValue = rgbToHex(r, g, b)

  if (
    hexInput.value !== calculatedHexValue &&
    hexInput.dataset.modified !== 'true'
  ) {
    hexInput.value = calculatedHexValue
    hexInput.setAttribute('value', calculatedHexValue)
    colorPickerInput.value = calculatedHexValue
  }
}

const bindSlInputEvents = (index: number) => {
  const slInput = document.querySelectorAll<HTMLElement>('.sl-handle')[index]
  const slPicker = document.querySelectorAll<HTMLElement>(
    '.sat-lightness-picker'
  )[index]

  const setSlPosition = (xPos: number, yPos: number) => {
    const pickerRect = slPicker.getBoundingClientRect()
    const offsetX = pickerRect.left + window.scrollX
    const offsetY = pickerRect.top + window.scrollY

    let x = xPos - offsetX
    let y = yPos - offsetY

    if (x <= 0) {
      x = 0
    }
    if (x >= PICKER_WIDTH) {
      x = PICKER_WIDTH
    }
    if (y <= 0) {
      y = 0
    }
    if (y >= PICKER_HEIGHT) {
      y = PICKER_HEIGHT
    }

    currentSaturation[index] = x / PICKER_WIDTH
    currentValue[index] = 1 - y / PICKER_HEIGHT

    slInput.style.transform = `translate3d(${x}px, ${y}px, 1px)`
    slInput.style.backgroundColor = `rgb(${getCurrentColor(index)})`

    updateColor(index)
  }

  const handleSlMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    document.addEventListener('mousemove', handleSlMouseMove)
    document.addEventListener('mouseup', handleSlMouseUp)
    setSlPosition(e.pageX, e.pageY)
  }

  const handleSlMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    setSlPosition(e.pageX, e.pageY)
  }

  const handleSlMouseUp = () => {
    document.removeEventListener('mousemove', handleSlMouseMove)
    document.removeEventListener('mouseup', handleSlMouseUp)
  }

  slPicker.addEventListener('mousedown', handleSlMouseDown)
  updateColor(index)
}

for (let i = 0; i < hueRotationInputs.length; i++) {
  const handleHueInput = (e: Event): any => {
    const slInput = document.querySelectorAll<HTMLElement>('.sl-handle')[i]
    currentHue[i] = +(e.target as HTMLInputElement).value / 360
    hueUnderlays[i].setAttribute(
      'style',
      `background: rgb(${hsvToRgb(currentHue[i], 1, 1)})`
    )
    slInput.style.backgroundColor = `rgb(${getCurrentColor(i)})`
    updateColor(i)
  }

  hueRotationInputs[i].addEventListener('input', handleHueInput)
  bindSlInputEvents(i)
}

const themeButton = document.getElementById('theme')!
themeButton.addEventListener('click', toggleTheme)

let lastSelectedColorSet = null
let isDarkMode = false

//* DONE
function calculateLightness(hexColor: string): number {
  const hslColor = hexToHSL(hexColor)

  const lightness = hslColor.l

  return lightness * 100
}

function hexToHSL(hexColor: string): HSL {
  let r, g, b

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
  let h!: number, s, l

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

function checkDarkOrLight() {
  const searchParams = new URLSearchParams(window.location.search)
  const colorsParam = searchParams.get('colors')!

  const colors = colorsParam.split('-')
  const secondColor = colors[1]

  const lightness = calculateLightness(secondColor)

  if (lightness > 50) {
    isDarkMode = false
    const themeDiv = <HTMLElement>document.getElementById('theme')
    themeDiv.style.backgroundColor = isDarkMode ? 'black' : ''

    const themeContainer = themeDiv.querySelectorAll<HTMLElement>('.darkorlight-cont')[0] // DOUBT: U added this 0 yourself
    const themeWrapper = themeContainer.children[0] as HTMLElement
    themeWrapper.style.transform = 'translateY(-30px)'
  } else if (lightness < 50) {
    isDarkMode = true
    const themeDiv = <HTMLElement>document.getElementById('theme')
    themeDiv.style.backgroundColor = isDarkMode ? 'black' : ''

    const themeContainer =
      themeDiv.querySelector<HTMLElement>('.darkorlight-cont') as HTMLElement
    const themeWrapper = themeContainer.children[0] as HTMLElement

    if (isDarkMode) {
      themeWrapper.style.transform = 'translateY(0)'
    } else {
      themeWrapper.style.transform = 'translateY(-30px)'
    }
  }
}

// function generateQRCode() {
//   var currentUrl = window.location.href

//   var qrcodeElement = <HTMLElement>document.getElementById('qrcode')
//   while (qrcodeElement.firstChild) {
//     qrcodeElement.removeChild(qrcodeElement.firstChild)
//   }

//   return new QRCode(qrcodeElement, {
//     text: currentUrl,
//     width: 250,
//     height: 250,
//   })
// }
function generateQRCode2() {
  var currentUrl = window.location.href

  return QRcode.toDataURL(currentUrl, { width: 250 })
    .then((url) => {
      //alert(url.length)
      var img = document.querySelector<HTMLImageElement>('div#qrcode>image')!
      img.src = url
    })
    .catch(console.error)
}

hexInputs.forEach((hexInput) => {
  hexInput.addEventListener('input', handleHexInputChange)
})

function handleHexInputChange(event: Event): any {
  const target = event.target! as HTMLInputElement
  const hexValue = target.value
  const parentOption = target.closest('.colors-option')!

  if (parentOption.classList.contains('prim')) {
    primaryColor.value = hexValue
  } else if (parentOption.classList.contains('sec')) {
    secondaryColor.value = hexValue
  } else if (parentOption.classList.contains('primbuttn')) {
    primbuttnColor.value = hexValue
  } else if (parentOption.classList.contains('secbuttn')) {
    secbuttnColor.value = hexValue
  } else if (parentOption.classList.contains('accent')) {
    accentColor.value = hexValue
  }
}

randomizeButton?.addEventListener('click', () => {
  randomizeColors()
  updateSlug()
  attachColorPickerListeners(colorPickers, hexInputs)
  closeSettingsOnClickOutside(event as Event)
})

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    randomizeColors()
    updateSlug()
    attachColorPickerListeners(colorPickers, hexInputs)
    closeSettingsOnClickOutside(event)
    event.preventDefault()
  }
})

const colorSchemes = [
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
        `hsl(${baseHue}, ${baseSaturation}%, ${firstLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secondLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${primbuttnLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${secbuttnLightness}%)`,
        `hsl(${baseHue}, ${baseSaturation}%, ${accentLightness}%)`,
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

const primaryLock = document.getElementById('text-lock')
const secondaryLock = document.getElementById('bg-lock')
const primbuttnLock = document.getElementById('primbuttn-lock')
const secbuttnLock = document.getElementById('secbuttn-lock')
const accentLock = document.getElementById('accent-lock')

// lock open / close
const lockButtons = Array.from(
  document.querySelectorAll<HTMLElement>('.lock-button')
)!

lockButtons.forEach((lockButton) => {
  lockButton?.addEventListener('click', () => {
    lockButton
      ?.querySelector<HTMLElement>('.lock-closed')
      ?.classList.toggle('show')

    lockButton
      ?.querySelector<HTMLElement>('.lock-open')
      ?.classList.toggle('show')
  })
})

let isPrimaryLocked = false
let isSecondaryLocked = false
let isPrimbuttnLocked = false
let isSecbuttnLocked = false
let isAccentLocked = false

interface Scheme {
  baseHue: null | string
}

primaryLock?.addEventListener('click', function () {
  primaryLock.classList.toggle('locked')
  isPrimaryLocked = !isPrimaryLocked

  if (isPrimaryLocked) {
    const hue = primaryColor.value.split(',')[0]
    colorSchemes.forEach(function (scheme: Scheme) {
      scheme.baseHue = hue
    })
  } else {
    colorSchemes.forEach(function (scheme: Scheme) {
      scheme.baseHue = null
    })
  }

  updateLockButtons()
})

secondaryLock?.addEventListener('click', function () {
  secondaryLock.classList.toggle('locked')
  isSecondaryLocked = !isSecondaryLocked

  if (isSecondaryLocked) {
    const hue = secondaryColor.value.split(',')[0]
    colorSchemes.forEach(function (scheme: Scheme) {
      scheme.baseHue = hue
    })
  } else {
    colorSchemes.forEach(function (scheme) {
      scheme.baseHue = null
    })
  }

  updateLockButtons()
})

primbuttnLock?.addEventListener('click', function () {
  primbuttnLock.classList.toggle('locked')
  isPrimbuttnLocked = !isPrimbuttnLocked

  if (isPrimbuttnLocked) {
    const hue = primbuttnColor.value.split(',')[0]
    colorSchemes.forEach(function (scheme: Scheme) {
      scheme.baseHue = hue
    })
  } else {
    colorSchemes.forEach(function (scheme) {
      scheme.baseHue = null
    })
  }

  updateLockButtons()
})

secbuttnLock?.addEventListener('click', function () {
  secbuttnLock.classList.toggle('locked')
  isSecbuttnLocked = !isSecbuttnLocked

  if (isSecbuttnLocked) {
    const hue = secbuttnColor.value.split(',')[0]
    colorSchemes.forEach(function (scheme: Scheme) {
      scheme.baseHue = hue
    })
  } else {
    colorSchemes.forEach(function (scheme) {
      scheme.baseHue = null
    })
  }

  updateLockButtons()
})

accentLock?.addEventListener('click', function () {
  accentLock.classList.toggle('locked')
  isAccentLocked = !isAccentLocked

  if (isAccentLocked) {
    const hue = accentColor.value.split(',')[0]
    colorSchemes.forEach(function (scheme: Scheme) {
      scheme.baseHue = hue
    })
  } else {
    colorSchemes.forEach(function (scheme) {
      scheme.baseHue = null
    })
  }

  updateLockButtons()
})

function updateLockButtons() {
  const lockButtons = document.querySelectorAll<HTMLElement>('.lock-button')
  const lockedCount = document.querySelectorAll<HTMLElement>('.locked').length

  if (lockedCount >= 4) {
    lockButtons.forEach((button) => {
      if (!button.classList.contains('locked')) {
        button.classList.add('lock-disabled')
      }
    })
  } else {
    lockButtons.forEach((button) => {
      button.classList.remove('lock-disabled')
    })
  }
}

function isValidHex(hex: string) {
  const regex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i
  return regex.test(hex)
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

let selectedScheme = 'all'

const colorSchemeOptions =
  document.querySelectorAll<HTMLElement>('.scheme-option')
colorSchemeOptions.forEach((option) => {
  option.addEventListener('click', () => {
    colorSchemeOptions.forEach((option) => {
      option.classList.remove('selected-scheme')
    })

    selectedScheme = option.getAttribute('data-scheme')!
    option.classList.add('selected-scheme')
  })
})

function randomizeColors() {
  let randomColorScheme

  if (selectedScheme === 'all') {
    randomColorScheme =
      colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
  } else {
    randomColorScheme = colorSchemes.find(
      (scheme) =>
        scheme.name.toLowerCase().replace(/ /g, '-') === selectedScheme
    )
  }

  const colors = randomColorScheme?.generateColors()

  const hexColors = colors?.map((color) => {
    const [h, s, l] = color.match(/\d+/g) as string[]
    return hslToHex(parseInt(h), parseInt(s), parseInt(l))
  })

  const searchParams = new URLSearchParams(window.location.search)
  const colorsParam = searchParams.get('colors')

  const colorHex = colorsParam?.split('-')
  const lockedColors: string[] = []

  if (!isPrimaryLocked) {
    primaryColor.value = hexColors?.[0].slice(0, 7) as string
  } else {
    lockedColors.push(colorHex?.[0].slice(0, 6) as string)
  }

  if (!isSecondaryLocked) {
    secondaryColor.value = hexColors?.[1].slice(0, 7) as string
  } else {
    lockedColors.push(colorHex?.[1].slice(0, 6) as string)
  }

  if (!isPrimbuttnLocked) {
    primbuttnColor.value = hexColors?.[2].slice(0, 7) as string
  } else {
    lockedColors.push(colorHex?.[2].slice(0, 6) as string)
  }

  if (!isSecbuttnLocked) {
    secbuttnColor.value = hexColors?.[3].slice(0, 7) as string
  } else {
    lockedColors.push(colorHex?.[3].slice(0, 6) as string)
  }

  if (!isAccentLocked) {
    accentColor.value = hexColors?.[4].slice(0, 7) as string
  } else {
    lockedColors.push(colorHex?.[4].slice(0, 6) as string)
  }

  const numLockedColors = lockedColors.length

  colorSchemes.forEach(function (scheme: Scheme) {
    const randomIndex = Math.floor(Math.random() * numLockedColors)
    const lockedColor = lockedColors[randomIndex]
    scheme.baseHue = '#' + lockedColor
  })

  document.documentElement.style.setProperty(
    '--text',
    isPrimaryLocked ? primaryColor.value : (hexColors?.[0] as string)
  )
  document.documentElement.style.setProperty(
    '--bg',
    isSecondaryLocked ? secondaryColor.value : (hexColors?.[1] as string)
  )
  document.documentElement.style.setProperty(
    '--primary',
    isPrimbuttnLocked ? primbuttnColor.value : (hexColors?.[2] as string)
  )
  document.documentElement.style.setProperty(
    '--secondary',
    isSecbuttnLocked ? secbuttnColor.value : (hexColors?.[3] as string)
  )
  document.documentElement.style.setProperty(
    '--accent',
    isAccentLocked ? accentColor.value : (hexColors?.[4] as string)
  )

  lastSelectedColorSet = randomColorScheme?.name

  function setHexInputValues(
    hexInputs: NodeListOf<HTMLInputElement>,
    colors: string[]
  ) {
    for (let i = 0; i < hexInputs.length; i++) {
      hexInputs[i].value = colors[i]
    }
  }
  setHexInputValues(hexInputs, colors!)
  attachColorPickerListeners(colorPickers, hexInputs)

  getBrightnessAbs()
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()

  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass)
  updateContrastColor('--bgcontrast', secColorClass)
}
// TODO- Add to colors
function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b
  if (s === 0) {
    r = g = b = Math.round(l * 255)
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
    g = Math.round(hue2rgb(p, q, h) * 255)
    b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  }

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// SHADES

function appendHexValue(element: HTMLElement, color: string) {
  const span = document.createElement('span')
  span.innerText = color
  span.classList.add('hex-value')

  element.appendChild(span)
}

function fillDivsWithShades() {
  const primaryColorValue = primaryColor.value
  const secondaryColorValue = secondaryColor.value
  const primbuttnColorValue = primbuttnColor.value
  const secbuttnColorValue = secbuttnColor.value
  const accentColorValue = accentColor.value

  const textShadesDiv = document.querySelector<HTMLElement>('.text-shades')!
  const bgShadesDiv = document.querySelector<HTMLElement>('.bg-shades')!
  const primaryShadesDiv =
    document.querySelector<HTMLElement>('.primary-shades')!
  const secondaryShadesDiv =
    document.querySelector<HTMLElement>('.secondary-shades')!
  const accentShadesDiv = document.querySelector<HTMLElement>('.accent-shades')!

  const numShades = 20
  const maxLightness = 95

  function hexToHSL(hex: string) {
    const r = parseInt(hex.substring(1, 3), 16) / 255
    const g = parseInt(hex.substring(3, 5), 16) / 255
    const b = parseInt(hex.substring(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h!: number, s

    const l = (max + min) / 2

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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }
  // TODO - Add to colors
  function calculateShade(color: HSL, lightness: number) {
    return `hsl(${color.h}, ${color.s}%, ${lightness}%)`
  }

  textShadesDiv.innerHTML = ''
  bgShadesDiv.innerHTML = ''
  primaryShadesDiv.innerHTML = ''
  secondaryShadesDiv.innerHTML = ''
  accentShadesDiv.innerHTML = ''

  const textHSL = hexToHSL(primaryColorValue)
  const bgHSL = hexToHSL(secondaryColorValue)
  const primaryHSL = hexToHSL(primbuttnColorValue)
  const secondaryHSL = hexToHSL(secbuttnColorValue)
  const accentHSL = hexToHSL(accentColorValue)

  const existingHues = []

  for (let i = 0; i < numShades; i++) {
    if (textHSL.s !== 0) {
      const lightness = (maxLightness / (numShades - 1)) * i
      const shade = calculateShade(textHSL, lightness)
      const hexValue = hslToHex(textHSL.h, textHSL.s, lightness)

      const shadeDiv = document.createElement('div')
      shadeDiv.style.background = shade

      textShadesDiv.appendChild(shadeDiv)
      existingHues.push(textHSL.h)
      appendHexValue(shadeDiv, hexValue)
    }
  }

  if (bgHSL.s !== 0) {
    const bgHueExists = existingHues.some((hue) => Math.abs(hue - bgHSL.h) < 10)
    if (!bgHueExists) {
      for (let i = 0; i < numShades; i++) {
        const lightness = (maxLightness / (numShades - 1)) * i
        const shade = calculateShade(bgHSL, lightness)
        const shadeDiv = document.createElement('div')
        shadeDiv.style.backgroundColor = shade
        const hexValue = hslToHex(bgHSL.h, bgHSL.s, lightness)

        bgShadesDiv.appendChild(shadeDiv)
        appendHexValue(shadeDiv, hexValue)
      }
      existingHues.push(bgHSL.h)
    }
  }

  if (primaryHSL.s !== 0) {
    const primaryHueExists = existingHues.some(
      (hue) => Math.abs(hue - primaryHSL.h) < 10
    )
    if (!primaryHueExists) {
      for (let i = 0; i < numShades; i++) {
        const lightness = (maxLightness / (numShades - 1)) * i
        const shade = calculateShade(primaryHSL, lightness)
        const shadeDiv = document.createElement('div')
        shadeDiv.style.backgroundColor = shade
        const hexValue = hslToHex(primaryHSL.h, primaryHSL.s, lightness)

        primaryShadesDiv.appendChild(shadeDiv)
        appendHexValue(shadeDiv, hexValue)
      }
      existingHues.push(primaryHSL.h)
    }
  }

  if (secondaryHSL.s !== 0) {
    const secondaryHueExists = existingHues.some(
      (hue) => Math.abs(hue - secondaryHSL.h) < 10
    )
    if (!secondaryHueExists) {
      for (let i = 0; i < numShades; i++) {
        const lightness = (maxLightness / (numShades - 1)) * i
        const shade = calculateShade(secondaryHSL, lightness)
        const shadeDiv = document.createElement('div')
        shadeDiv.style.backgroundColor = shade
        const hexValue = hslToHex(secondaryHSL.h, secondaryHSL.s, lightness)

        secondaryShadesDiv.appendChild(shadeDiv)
        appendHexValue(shadeDiv, hexValue)
      }
      existingHues.push(secondaryHSL.h)
    }
  }

  if (accentHSL.s !== 0) {
    const accentHueExists = existingHues.some(
      (hue) => Math.abs(hue - accentHSL.h) < 10
    )
    if (!accentHueExists) {
      for (let i = 0; i < numShades; i++) {
        const lightness = (maxLightness / (numShades - 1)) * i
        const shade = calculateShade(accentHSL, lightness)
        const shadeDiv = document.createElement('div')
        shadeDiv.style.backgroundColor = shade
        const hexValue = hslToHex(accentHSL.h, accentHSL.s, lightness)

        accentShadesDiv.appendChild(shadeDiv)
        appendHexValue(shadeDiv, hexValue)
      }
      existingHues.push(accentHSL.h)
    }
  }

  const divs = document.querySelectorAll<HTMLElement>('.shade-cont > * > div')
  divs.forEach((div) => {
    div.addEventListener('mouseover', function () {
      const hexValue = this.querySelector<HTMLElement>('.hex-value')
      if (hexValue) {
        hexValue.style.visibility = 'visible'
      }
    })

    div.addEventListener('mouseout', function () {
      const hexValue = this.querySelector<HTMLElement>('.hex-value')
      if (hexValue) {
        hexValue.style.visibility = 'hidden'
      }
    })

    div.addEventListener('click', function () {
      const hexValue = this.querySelector<HTMLElement>('.hex-value')
      if (hexValue) {
        const originalValue = hexValue.innerText

        if (hexValue.textContent !== 'Copied!') {
          const tempElement = document.createElement('textarea')
          tempElement.value = originalValue

          document.body.appendChild(tempElement)

          tempElement.select()

          document.execCommand('copy')

          hexValue.textContent = 'Copied!'

          setTimeout(() => {
            hexValue.textContent = originalValue
          }, 2000)

          document.body.removeChild(tempElement)
        }
      }
    })
  })
}

fillDivsWithShades()

// COLOR INPUT

primaryColor.addEventListener('input', () => {
  const primaryColorValue = primaryColor.value
  document.documentElement.style.setProperty('--text', primaryColorValue)
})

secondaryColor.addEventListener('input', () => {
  const secondaryColorValue = secondaryColor.value
  document.documentElement.style.setProperty('--bg', secondaryColorValue)
})

primbuttnColor.addEventListener('input', () => {
  const primbuttnColorValue = primbuttnColor.value
  document.documentElement.style.setProperty('--primary', primbuttnColorValue)
})

secbuttnColor.addEventListener('input', () => {
  const secbuttnColorValue = secbuttnColor.value
  document.documentElement.style.setProperty('--secondary', secbuttnColorValue)
})

accentColor.addEventListener('input', () => {
  const accentColorValue = accentColor.value
  document.documentElement.style.setProperty('--accent', accentColorValue)
})

primaryColor.addEventListener('input', checkContrast)
secondaryColor.addEventListener('input', checkContrast)
primbuttnColor.addEventListener('input', checkContrast)
secbuttnColor.addEventListener('input', checkContrast)
accentColor.addEventListener('input', checkContrast)

// download

const downloadButton = document.getElementById('download')
const fileNameInput = document.getElementById('file-name-input')
const errorMessage = document.getElementById('error-message') as HTMLElement

/**
 * Generates the zip file to be downloaded
 */
downloadButton?.addEventListener('click', () => {
  const fileNameInput = <HTMLInputElement>(
    document.getElementById('file-name-input')
  )
  const fileName = fileNameInput.value.trim()

  if (!isValidFileName(fileName)) {
    errorMessage.textContent =
      'Uh-oh! File name should include only A-Z, a-z, 0-9, -, _ and .'
    errorMessage.style.display = 'block'
    return
  }

  errorMessage.style.display = 'none'

  const colorValues = [
    primaryColor.value,
    secondaryColor.value,
    primbuttnColor.value,
    secbuttnColor.value,
    accentColor.value,
  ]

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = colorValues.length * 100
  canvas.height = 100
  for (let i = 0; i < colorValues.length; i++) {
    ctx.fillStyle = colorValues[i]
    ctx.fillRect(i * 100, 0, 100, 100)
  }

  const paletteImage = canvas.toDataURL('image/png')
  const paletteBlob = dataURItoBlob(paletteImage)
  const paletteFile = new File([paletteBlob], fileName + '-palette.png', {
    type: 'image/png',
  })

  const colorText = `Your selected colors:\n
    Text: ${primaryColor.value} (RGB: ${hexToRgb(primaryColor.value)})
    Background: ${secondaryColor.value} (RGB: ${hexToRgb(secondaryColor.value)})
    Primary: ${primbuttnColor.value} (RGB: ${hexToRgb(primbuttnColor.value)})
    Secondary: ${secbuttnColor.value} (RGB: ${hexToRgb(secbuttnColor.value)})
    Accent: ${accentColor.value} (RGB: ${hexToRgb(accentColor.value)})\n
Realtime Colors link for selected colors: ${window.location.href}\n
Thanks for using RealtimeColors.com!`
  const colorBlob = new Blob([colorText], { type: 'text/plain' })
  const colorFile = new File([colorBlob], fileName + '-codes.txt', {
    type: 'text/plain',
  })
  // DONE
  const zip = new JSZip()
  zip.file(paletteFile.name, paletteFile)
  zip.file(colorFile.name, colorFile)
  zip.generateAsync({ type: 'blob' }).then(function (blob) {
    saveAs(blob, fileName + '.zip')
  })
})

fileNameInput?.addEventListener('input', () => {
  errorMessage.style.display = 'none'
})
// *DONE
function isValidFileName(fileName: string) {
  const validFileNameRegex = /^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9]+)?$/
  return validFileNameRegex.test(fileName)
}

// * Done
function hexToRgb(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
// * Done
function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

document.addEventListener('keydown', function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    document.getElementById('export')?.click()
  }
})

//
//
//

// CONTRAST CHECKER
// *DONE
function getBrightness(color: string) {
  let hex = color

  if (color.substring(0, 3) === 'rgb') {
    const [r, g, b] = color.match(/\d+/g) as string[]
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
// DONE
// function debounce(func, wait) {
//   let timeout
//   return function (...args) {
//     const context = this
//     clearTimeout(timeout)
//     timeout = setTimeout(() => {
//       func.apply(context, args)
//     }, wait)
//   }
// }

// DOUBT: May break
export const debounce = (func: Function, wait: number=100): EventListenerOrEventListenerObject => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

const primaryBox = document.querySelectorAll<HTMLElement>('.primary-color-box')
const secondaryBox = document.querySelectorAll<HTMLElement>(
  '.secondary-color-box'
)
const accentBox = document.querySelectorAll<HTMLElement>('.accent-color-box')

// CONTRAST CHECKING RULES

function checkContrast() {
  const handleInput = (
    colorValue: string,
    elements: HTMLElement[]
  ) => {
    const primaryColorValue = primaryColor.value
    const secondaryColorValue = secondaryColor.value
    const primaryBrightness = getBrightness(primaryColorValue)
    const secondaryBrightness = getBrightness(secondaryColorValue)

    elements.forEach((element) => {
      const contrastRatio = getContrastRatio(colorValue, primaryColorValue)

      if (primaryBrightness < secondaryBrightness) {
        if (contrastRatio < 4.5) {
          element.style.color = 'var(--bg)'
          secbuttnColorClass.style.color = 'var(--bg)'
        } else if (contrastRatio > 4.5) {
          element.style.color = 'var(--text)'
          secbuttnColorClass.style.color = 'var(--text)'
        }
      } else {
        if (contrastRatio < 4.5) {
          element.style.color = 'var(--bg)'
          secbuttnColorClass.style.color = 'var(--bg)'
        } else if (contrastRatio > 4.5) {
          element.style.color = 'var(--text)'
          secbuttnColorClass.style.color = 'var(--text)'
        }
      }
    })
  }
 // FIXME
  primbuttnColor.addEventListener(
    'input',
    debounce(function() {
      const primbuttnColorValue = primbuttnColor.value
      handleInput(primbuttnColorValue, [...primaryButtons, ...primaryBox])
    })
  )

  secbuttnColor.addEventListener(
    'input',
    debounce(function() {
      const secbuttnColorValue = secbuttnColor.value
      handleInput(secbuttnColorValue, [
        ...faqQuestions,
        ...secondaryButtons,
        ...partTwo,
        ...secondaryBox,
      ])
    })
  )

  accentColor.addEventListener(
    'input',
    debounce(function() {
      const accentColorValue = accentColor.value
      handleInput(accentColorValue, [accentColorClass, ...accentBox])
    })
  )
}

function getBrightnessAbs() {
  const primbuttnColorValue = primbuttnColor.value
  const secbuttnColorValue = secbuttnColor.value
  const accentColorValue = accentColor.value
  const primaryColorValue = primaryColor.value
  const secondaryColorValue = secondaryColor.value

  const primaryBrightness = getBrightness(primaryColorValue)
  const secondaryBrightness = getBrightness(secondaryColorValue)
  const accentColorBrightness = getBrightness(accentColor.value)

  // Update primary buttons
  updateButtonStyle(
    primaryButtons,
    primbuttnColorClass,
    primbuttnColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )

  // Update Primary Boxes
  updateButtonStyle(
    primaryBox,
    primbuttnColorClass,
    primbuttnColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )
  //FIXME: Update FAQ questions
  updateButtonStyle(
    faqQuestions,
    secbuttnColorClass,
    secbuttnColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )

  // Update secondary buttons
  updateButtonStyle(
    secondaryButtons,
    secbuttnColorClass,
    secbuttnColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )

  // Update secondary boxes
  updateButtonStyle(
    secondaryBox,
    secbuttnColorClass,
    secbuttnColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )

  // Update part two
  updateButtonStyle(
    partTwo,
    secbuttnColorClass,
    secbuttnColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )

  // Update accent color
  updateAccentColor(
    accentColorClass,
    accentColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )
  // Update accent color
  updateButtonStyle(
    accentBox,
    accentColorClass,
    accentColorValue,
    primaryBrightness,
    secondaryBrightness,
    primaryColorValue
  )
}

function updateButtonStyle(
  buttons: NodeListOf<HTMLElement>,
  colorClass: HTMLElement,
  colorValue: string,
  primaryBrightness: number,
  secondaryBrightness: number,
  primaryColorValue: string
) {
  const contrastRatio = getContrastRatio(colorValue, primaryColorValue)

  if (primaryBrightness < secondaryBrightness && contrastRatio < 4.5) {
    buttons.forEach((button: HTMLElement) => {
      button.style.color = 'var(--bg)'
      colorClass.style.color = 'var(--bg)'
    })
  } else if (primaryBrightness < secondaryBrightness && contrastRatio > 4.5) {
    buttons.forEach((button: HTMLElement) => {
      button.style.color = 'var(--text)'
      colorClass.style.color = 'var(--text)'
    })
  } else if (primaryBrightness > secondaryBrightness && contrastRatio < 4.5) {
    buttons.forEach((button: HTMLElement) => {
      button.style.color = 'var(--bg)'
      colorClass.style.color = 'var(--bg)'
    })
  } else if (primaryBrightness > secondaryBrightness && contrastRatio > 4.5) {
    buttons.forEach((button: HTMLElement) => {
      button.style.color = 'var(--text)'
      colorClass.style.color = 'var(--text)'
    })
  }
}

function updateAccentColor(
  colorClass: HTMLElement,
  colorValue: string,
  primaryBrightness: number,
  secondaryBrightness: number,
  primaryColorValue: string
) {
  const contrastRatio = getContrastRatio(colorValue, primaryColorValue)

  if (primaryBrightness < secondaryBrightness && contrastRatio < 4.5) {
    colorClass.style.color = 'var(--bg)'
  } else if (primaryBrightness < secondaryBrightness && contrastRatio > 4.5) {
    colorClass.style.color = 'var(--text)'
  } else if (primaryBrightness > secondaryBrightness && contrastRatio < 4.5) {
    colorClass.style.color = 'var(--bg)'
  } else if (primaryBrightness > secondaryBrightness && contrastRatio > 4.5) {
    colorClass.style.color = 'var(--text)'
  }
}

// CONTRAST CHECKING FUNCTION
//*DONE
function getContrastRatio(background: string, foreground: string) {
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
//* DONE
function parseColor(color: string) {
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
//* DONE
function getLuminance(color: RGB) {
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  const luminance =
    0.2126 * Math.pow(r, 2.2) +
    0.7152 * Math.pow(g, 2.2) +
    0.0722 * Math.pow(b, 2.2)
  return luminance
}

// SLUG update based on selected colors

function updateSlug() {
  const colors = [
    primaryColor,
    secondaryColor,
    primbuttnColor,
    secbuttnColor,
    accentColor,
  ].map((color) => {
    const colorValue = color.value
    return colorValue ? encodeURIComponent(colorValue.replace('#', '')) : ''
  })

  const slug = colors.join('-')
  window.history.replaceState({}, document.title, `?colors=${slug}`)
}

function applyColorsFromSlug(slug?: string) {
  const searchParams = new URLSearchParams(window.location.search)
  slug = slug || (searchParams.get('colors') as string)

  if (slug) {
    const decodedColors = slug
      .split('-')
      .map((color) => `#${decodeURIComponent(color)}`)
    ;[
      primaryColor.value,
      secondaryColor.value,
      primbuttnColor.value,
      secbuttnColor.value,
      accentColor.value,
    ] = decodedColors
    hexInputs.forEach((input, index) => (input.value = decodedColors[index]))

    const cssVariables = [
      '--text',
      '--bg',
      '--primary',
      '--secondary',
      '--accent',
    ]
    cssVariables.forEach((variable, index) => {
      document.documentElement.style.setProperty(variable, decodedColors[index])
    })
  } else {
    updateSlug()
  }

  attachColorPickerListeners(colorPickers, hexInputs)
  updateColors()

  getBrightnessAbs()
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
  fillDivsWithShades()
  checkDarkOrLight()
  // generateQRCode()
  generateQRCode2()
}

applyColorsFromSlug()
;[
  primaryColor,
  secondaryColor,
  primbuttnColor,
  secbuttnColor,
  accentColor,
].forEach((color) => {
  color.addEventListener('change', updateSlug)
  color.addEventListener('change', updateColors)
})

function updateColors() {
  const colors = [
    primaryColor,
    secondaryColor,
    primbuttnColor,
    secbuttnColor,
    accentColor,
  ].map((color) => {
    const colorValue = color.value.replace(/#|%23/g, '')
    return `#${colorValue}`
  })

  const slug = colors
    .map((color) => encodeURIComponent(color.replace('#', '')))
    .join('-')
  window.history.replaceState({}, document.title, `?colors=${slug}`)

  const cssVariables = [
    '--text',
    '--bg',
    '--primary',
    '--secondary',
    '--accent',
  ]
  cssVariables.forEach((variable, index) => {
    document.documentElement.style.setProperty(variable, colors[index])
  })
}

// redo and undo

let urlSlugs = [] as string[]
let currentSlugIndex = -1

function addSlugToArray() {
  let url = window.location.href
  let slug = url.substring(url.indexOf('?'))
  if (urlSlugs.length === 0 || slug !== urlSlugs[currentSlugIndex]) {
    urlSlugs.splice(
      currentSlugIndex + 1,
      urlSlugs.length - currentSlugIndex - 1,
      slug
    )
    currentSlugIndex++
  }

  applyColorsFromSlug(slug)
  updateUndoRedoButtons()
  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass as HTMLElement)
  updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
}

window.addEventListener('load', addSlugToArray)

window.addEventListener('popstate', function () {
  let urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('colors')) {
    addSlugToArray()
  }
})

window.addEventListener('hashchange', function () {
  let urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('colors')) {
    addSlugToArray()
  }
})

let oldColors = ''
setInterval(function () {
  let urlParams = new URLSearchParams(window.location.search)
  let newColors = urlParams.get('colors')
  if (newColors !== null && newColors !== oldColors) {
    addSlugToArray()
    oldColors = newColors
  }
})

document.getElementById('undo')?.addEventListener('click', function () {
  if (currentSlugIndex > 0) {
    currentSlugIndex--
    let slug = urlSlugs[currentSlugIndex]
    let url = window.location.origin + window.location.pathname + slug
    window.history.pushState({}, '', url)

    applyColorsFromSlug(slug)
  }
})

document.getElementById('redo')?.addEventListener('click', function () {
  if (currentSlugIndex < urlSlugs.length - 1) {
    currentSlugIndex++
    let slug = urlSlugs[currentSlugIndex]
    let url = window.location.origin + window.location.pathname + slug
    window.history.pushState({}, '', url)

    applyColorsFromSlug(slug)
  }
})

document.addEventListener('keydown', function (event) {
  if (
    event.key === 'ArrowLeft' ||
    ((event.ctrlKey || event.metaKey) && event.key === 'z')
  ) {
    document.getElementById('undo')?.click()
  } else if (
    event.key === 'ArrowRight' ||
    ((event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      (event.key === 'z' || event.key === 'Z'))
  ) {
    document.getElementById('redo')?.click()
  }
})

function updateUndoRedoButtons() {
  let undoButton = document.getElementById('undo')
  let redoButton = document.getElementById('redo')

  if (currentSlugIndex === 0) {
    undoButton?.classList.add('disabled')
  } else {
    undoButton?.classList.remove('disabled')
  }

  if (currentSlugIndex === urlSlugs.length - 1) {
    redoButton?.classList.add('disabled')
  } else {
    redoButton?.classList.remove('disabled')
  }
}

// // Expand button for toolbar

const expandButtonColors =
  document.querySelector<HTMLElement>('.colors-rollout')
const expandButtonFonts = document.querySelector<HTMLElement>('.fonts-rollout')
const colorsOptions = document.querySelectorAll<HTMLElement>('.colors-option')
const fontsOptions = document.querySelectorAll<HTMLElement>('.fonts-option')
const colorSpan = document.querySelector<HTMLElement>('.color-tools-span')
const fontSpan = document.querySelector<HTMLElement>('.font-tools-span')

const colorsRolloutIcon = document.querySelector<HTMLElement>(
  '.colors-rollout svg'
)
const fontsRolloutIcon =
  document.querySelector<HTMLElement>('.fonts-rollout svg')

if (window.innerWidth < 1100) {
  expandButtonFonts?.addEventListener('click', () => {
    colorSpan?.classList.remove('hide')
  })
} else {
  expandButtonFonts?.addEventListener('click', () => {
    colorSpan?.classList.add('hide')
  })
}

expandButtonColors?.addEventListener('click', () => {
  expandButtonColors?.classList.add('hide')
  expandButtonFonts?.classList.remove('hide')
  colorSpan?.classList.toggle('hide')
  fontSpan?.classList.add('hide')
  colorsRolloutIcon?.classList.toggle('rotateX')
  fontsRolloutIcon?.classList.remove('rotateX')
})

expandButtonFonts?.addEventListener('click', () => {
  expandButtonFonts?.classList.add('hide')
  expandButtonColors?.classList.remove('hide')
  fontSpan?.classList.toggle('hide')
  fontsRolloutIcon?.classList.toggle('rotateX')
  colorsRolloutIcon?.classList.remove('rotateX')
})

// expanding fonts

const textFontsButton = document.getElementById('text-fonts-buttn')
const textFontsBox = document.querySelector<HTMLElement>('.text-fonts-box')
const textFontsIcon = document.querySelector<HTMLElement>(
  '.text-fonts-buttn svg'
)

textFontsButton?.addEventListener('click', (event) => {
  if (!textFontsBox?.contains(event.target as Node)) {
    textFontsBox?.classList.toggle('open')
    textFontsIcon?.classList.toggle('rotate')
    headingFontsBox?.classList.remove('open')
    headingFontsIcon?.classList.remove('rotate')
  }
})

document.addEventListener('mousedown', (event) => {
  if (
    !textFontsBox?.contains(event.target as Node) &&
    event.target !== textFontsButton
  ) {
    textFontsBox?.classList.remove('open')
    textFontsIcon?.classList.remove('rotate')
  }
})

const headingFontsButton = document.getElementById('heading-fonts-buttn')
const headingFontsBox =
  document.querySelector<HTMLElement>('.heading-fonts-box')
const headingFontsIcon = document.querySelector<HTMLElement>(
  '.heading-fonts-buttn svg'
)

headingFontsButton?.addEventListener('click', (event) => {
  if (!headingFontsBox?.contains(event.target as Node)) {
    headingFontsBox?.classList.toggle('open')
    headingFontsIcon?.classList.toggle('rotate')
    textFontsBox?.classList.remove('open')
    textFontsIcon?.classList.remove('rotate')
  }
})

document.addEventListener('mousedown', (event) => {
  if (
    !headingFontsBox?.contains(event.target as Node) &&
    event.target !== headingFontsButton
  ) {
    headingFontsBox?.classList.remove('open')
    headingFontsIcon?.classList.remove('rotate')
  }
})

// contrast checker

function getContrastRatio2(color1: string, color2: string) {
  const luminance1 = getLuminance2(color1)
  const luminance2 = getLuminance2(color2)

  const contrastRatio2 =
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)

  return contrastRatio2
}

function getLuminance2(color: string): number {
  const rgb = color.match(/\d+/g) as RegExpMatchArray
  const [r, g, b] = rgb.map(Number)

  const [red, green, blue] = [r / 255, g / 255, b / 255]

  const luminance =
    0.2126 * adjustGamma(red) +
    0.7152 * adjustGamma(green) +
    0.0722 * adjustGamma(blue)

  return luminance
}
// ADD
function adjustGamma(color: number): number {
  return color <= 0.03928
    ? color / 12.92
    : Math.pow((color + 0.055) / 1.055, 2.4)
}

function updateContrastColor(variable: string, element: HTMLElement) {
  const textColor = getComputedStyle(element).color
  const bgColor = getComputedStyle(element).backgroundColor
  const contrastRatio2 = getContrastRatio2(textColor, bgColor)

  const tooltipSpan = element.querySelector<HTMLElement>(
    '.contrast-tooltip'
  ) as HTMLElement

  let contrastText

  if (contrastRatio2 < 4.5) {
    document.documentElement.style.setProperty(variable, '#ff8f8f')
    contrastText = 'Fail'
  } else if (contrastRatio2 < 7) {
    document.documentElement.style.setProperty(variable, '#ffdd00')
    contrastText = 'AA'
  } else {
    document.documentElement.style.setProperty(variable, '#64d97b')
    contrastText = 'AAA'
  }

  tooltipSpan.innerHTML = `${contrastText} - ${contrastRatio2.toFixed(
    2
  )}:1 <br><span style="font-size: 10px; opacity: 60%;">Learn more</span>`
}

function updateContrastColor2(variable: string, element: HTMLElement) {
  const accentColor = getComputedStyle(accentColorClass).backgroundColor
  const bgColor = getComputedStyle(secbuttnColorClass).backgroundColor
  const contrastRatio2 = getContrastRatio2(accentColor, bgColor)

  const tooltipSpan = element.querySelector<HTMLElement>(
    '.contrast-tooltip'
  ) as HTMLElement

  let contrastText

  if (contrastRatio2 < 3.1) {
    document.documentElement.style.setProperty(variable, '#ff8f8f')
    contrastText = 'Fail'
  } else {
    document.documentElement.style.setProperty(variable, '#64d97b')
    contrastText = 'Pass'
  }

  tooltipSpan.innerHTML = `${contrastText} - ${contrastRatio2.toFixed(
    2
  )}:1 <br><span style="font-size: 10px; opacity: 60%;">Learn more</span>`
}

updateContrastColor('--primarycontrast', primbuttnColorClass)
updateContrastColor('--secondarycontrast', secbuttnColorClass)
updateContrastColor2('--accentcontrast', accentColorClass)
updateContrastColor('--textcontrast', primColorClass as HTMLElement)
updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
generateCSSCodeAndCopy()
generateTailwindCSSCodeAndCopy()
generateSCSSCodeAndCopy()
generateCSVCodeAndCopy()

primaryColor.addEventListener('change', () => {
  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass as HTMLElement)
  updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
})

secondaryColor.addEventListener('change', () => {
  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass as HTMLElement)
  updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
})

primbuttnColor.addEventListener('change', () => {
  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass as HTMLElement)
  updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
})

secbuttnColor.addEventListener('change', () => {
  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass as HTMLElement)
  updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
})

accentColor.addEventListener('change', () => {
  updateContrastColor('--primarycontrast', primbuttnColorClass)
  updateContrastColor('--secondarycontrast', secbuttnColorClass)
  updateContrastColor2('--accentcontrast', accentColorClass)
  updateContrastColor('--textcontrast', primColorClass as HTMLElement)
  updateContrastColor('--bgcontrast', secColorClass as HTMLElement)
  generateCSSCodeAndCopy()
  generateTailwindCSSCodeAndCopy()
  generateSCSSCodeAndCopy()
  generateCSVCodeAndCopy()
})

var input = document.getElementById('file-name-input')

input?.addEventListener('keydown', function (event) {
  if (event.code === 'Space') {
    event.stopPropagation()
    event.preventDefault()
  }
})

function hexToRgbCode(hex: string) {
  hex = hex.replace('#', '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char: string) => char + char)
      .join('')
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgb(${r}, ${g}, ${b})`
}

function hexToHslCode(hex: string) {
  hex = hex.replace('#', '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char: string) => char + char)
      .join('')
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)

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

  s = max === min ? 0 : (max - l) / Math.min(l, 1 - l)

  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return `hsl(${h}, ${s}%, ${l}%)`
}

hexInputs.forEach(function (hexInput) {
  hexInput.addEventListener('keydown', function (event) {
    if (event.keyCode === 32) {
      event.preventDefault()
      event.stopPropagation()
    }
  })
})

const fontTypeInputs =
  document.querySelectorAll<HTMLElement>('.font-type-input')
fontTypeInputs.forEach(function (fontTypeInput) {
  fontTypeInput.addEventListener('keydown', function (event) {
    if (event.keyCode === 32) {
      event.stopPropagation()
    }
  })
})

function toggleSelectedType(button: HTMLElement) {
  const codeTypeContainer = button.closest('.code-type-cont')
  const codeTypes =
    codeTypeContainer?.querySelectorAll<HTMLElement>('.code-type')
  codeTypes?.forEach((type: HTMLElement) => {
    type.classList.remove('selected-type')
  })
  button.classList.add('selected-type')
}

// CSS export

function generateCSSCodeAndCopy() {
  const primaryColorValue = primaryColor.value
  const secondaryColorValue = secondaryColor.value
  const primbuttnColorValue = primbuttnColor.value
  const secbuttnColorValue = secbuttnColor.value
  const accentColorValue = accentColor.value

  let cssCode = ''

  const hexButton = document.querySelector<HTMLElement>(
    '.css-hex'
  ) as HTMLElement
  const rgbButton = document.querySelector<HTMLElement>(
    '.css-rgb'
  ) as HTMLElement
  const hslButton = document.querySelector<HTMLElement>(
    '.css-hsl'
  ) as HTMLElement

  hexButton?.addEventListener('click', () => {
    cssCode = `--text: ${primaryColorValue};
--background: ${secondaryColorValue};
--primary: ${primbuttnColorValue};
--secondary: ${secbuttnColorValue};
--accent: ${accentColorValue};`
    updateCSSCode(cssCode)
    toggleSelectedType(hexButton)
  })

  rgbButton.addEventListener('click', () => {
    cssCode = `--text: ${hexToRgbCode(primaryColorValue)};
--background: ${hexToRgbCode(secondaryColorValue)};
--primary: ${hexToRgbCode(primbuttnColorValue)};
--secondary: ${hexToRgbCode(secbuttnColorValue)};
--accent: ${hexToRgbCode(accentColorValue)};`
    updateCSSCode(cssCode)
    toggleSelectedType(rgbButton)
  })

  hslButton.addEventListener('click', () => {
    cssCode = `--text: ${hexToHslCode(primaryColorValue)};
--background: ${hexToHslCode(secondaryColorValue)};
--primary: ${hexToHslCode(primbuttnColorValue)};
--secondary: ${hexToHslCode(secbuttnColorValue)};
--accent: ${hexToHslCode(accentColorValue)};`
    updateCSSCode(cssCode)
    toggleSelectedType(hslButton)
  })

  // Initial code generation
  cssCode = `--text: ${primaryColorValue};
--background: ${secondaryColorValue};
--primary: ${primbuttnColorValue};
--secondary: ${secbuttnColorValue};
--accent: ${accentColorValue};`
  updateCSSCode(cssCode)
  toggleSelectedType(hexButton as HTMLElement)

  const copyButton = document.getElementById('copy-css')
  copyButton?.addEventListener('click', () => {
    navigator.clipboard.writeText(cssCode).then(() => {
      copyButton.textContent = 'Copied!'
      setTimeout(() => {
        copyButton.textContent = 'Copy'
      }, 2000)
    })
  })

  function updateCSSCode(code: string) {
    const css_code = document.getElementById('css-code') as HTMLElement
    css_code.textContent = code
  }
}

// Tailwind css

function generateTailwindCSSCodeAndCopy() {
  const primaryColorValue = primaryColor.value
  const secondaryColorValue = secondaryColor.value
  const primbuttnColorValue = primbuttnColor.value
  const secbuttnColorValue = secbuttnColor.value
  const accentColorValue = accentColor.value

  let tcssCode = ''

  const hexButton = document.querySelector<HTMLElement>('.tcss-hex') as HTMLElement
  const rgbButton = document.querySelector<HTMLElement>('.tcss-rgb') as HTMLElement
  const hslButton = document.querySelector<HTMLElement>('.tcss-hsl') as HTMLElement

  hexButton?.addEventListener('click', () => {
    tcssCode = `'text': '${primaryColorValue}',
'background': '${secondaryColorValue}',
'primary': '${primbuttnColorValue}',
'secondary': '${secbuttnColorValue}',
'accent': '${accentColorValue}',`
    updateCSSCode(tcssCode)
    toggleSelectedType(hexButton)
  })

  rgbButton?.addEventListener('click', () => {
    tcssCode = `'text': '${hexToRgbCode(primaryColorValue)}',
'background': '${hexToRgbCode(secondaryColorValue)}',
'primary': '${hexToRgbCode(primbuttnColorValue)}',
'secondary': '${hexToRgbCode(secbuttnColorValue)}',
'accent': '${hexToRgbCode(accentColorValue)}',`
    updateCSSCode(tcssCode)
    toggleSelectedType(rgbButton)
  })

  hslButton?.addEventListener('click', () => {
    tcssCode = `'text': '${hexToHslCode(primaryColorValue)}',
'background': '${hexToHslCode(secondaryColorValue)}',
'primary': '${hexToHslCode(primbuttnColorValue)}',
'secondary': '${hexToHslCode(secbuttnColorValue)}',
'accent': '${hexToHslCode(accentColorValue)}',`
    updateCSSCode(tcssCode)
    toggleSelectedType(hslButton)
  })

  // Initial code generation
  tcssCode = `'text': '${primaryColorValue}',
'background': '${secondaryColorValue}',
'primary': '${primbuttnColorValue}',
'secondary': '${secbuttnColorValue}',
'accent': '${accentColorValue}',`
  updateCSSCode(tcssCode)
  toggleSelectedType(hexButton)

  const copyButton = document.getElementById('copy-tailwind')
  copyButton?.addEventListener('click', () => {
    navigator.clipboard.writeText(tcssCode).then(() => {
      copyButton.textContent = 'Copied!'
      setTimeout(() => {
        copyButton.textContent = 'Copy'
      }, 2000)
    })
  })

  function updateCSSCode(code: string) {
    const tw_code = document.getElementById('tailwind-code') as HTMLElement
    tw_code.textContent = code
  }
}

// SCSS

function generateSCSSCodeAndCopy() {
  const primaryColorValue = primaryColor.value
  const secondaryColorValue = secondaryColor.value
  const primbuttnColorValue = primbuttnColor.value
  const secbuttnColorValue = secbuttnColor.value
  const accentColorValue = accentColor.value

  let scssCode = ''

  const hexButton = document.querySelector<HTMLElement>('.scss-hex') as HTMLElement
  const rgbButton = document.querySelector<HTMLElement>('.scss-rgb') as HTMLElement
  const hslButton = document.querySelector<HTMLElement>('.scss-hsl') as HTMLElement
 
  hexButton?.addEventListener('click', () => {
    scssCode = `$text: ${primaryColorValue};
$background: ${secondaryColorValue};
$primary: ${primbuttnColorValue};
$secondary: ${secbuttnColorValue};
$accent: ${accentColorValue};`
    updateCSSCode(scssCode)
    toggleSelectedType(hexButton)
  })

  rgbButton?.addEventListener('click', () => {
    scssCode = `$text: ${hexToRgbCode(primaryColorValue)};
$background: ${hexToRgbCode(secondaryColorValue)};
$primary: ${hexToRgbCode(primbuttnColorValue)};
$secondary: ${hexToRgbCode(secbuttnColorValue)};
$accent: ${hexToRgbCode(accentColorValue)};`
    updateCSSCode(scssCode)
    toggleSelectedType(rgbButton)
  })

  hslButton?.addEventListener('click', () => {
    scssCode = `$text: ${hexToHslCode(primaryColorValue)};
$background: ${hexToHslCode(secondaryColorValue)};
$primary: ${hexToHslCode(primbuttnColorValue)};
$secondary: ${hexToHslCode(secbuttnColorValue)};
$accent: ${hexToHslCode(accentColorValue)};`
    updateCSSCode(scssCode)
    toggleSelectedType(hslButton)
  })

  // Initial code generation
  scssCode = `$text: ${primaryColorValue};
$background: ${secondaryColorValue};
$primary: ${primbuttnColorValue};
$secondary: ${secbuttnColorValue};
$accent: ${accentColorValue};`
  updateCSSCode(scssCode)
  toggleSelectedType(hexButton)

  const copyButton = document.getElementById('copy-scss')
  copyButton?.addEventListener('click', () => {
    navigator.clipboard.writeText(scssCode).then(() => {
      copyButton.textContent = 'Copied!'
      setTimeout(() => {
        copyButton.textContent = 'Copy'
      }, 2000)
    })
  })

  function updateCSSCode(code: string) {
    const scss_code = document.getElementById('scss-code') as HTMLElement
    scss_code.textContent = code
  }
}

// CSV

function generateCSVCodeAndCopy() {
  const primaryColorValue = primaryColor.value
  const secondaryColorValue = secondaryColor.value
  const primbuttnColorValue = primbuttnColor.value
  const secbuttnColorValue = secbuttnColor.value
  const accentColorValue = accentColor.value

  const colorMap = {
    text: primaryColorValue,
    background: secondaryColorValue,
    primary: primbuttnColorValue,
    secondary: secbuttnColorValue,
    accent: accentColorValue,
  }

  let csvCodeWithoutHash = ''
  let csvCodeWithHash = ''

  for (const [colorName, colorValue] of Object.entries(colorMap)) {
    csvCodeWithoutHash += `${colorValue.substr(1)},`
    csvCodeWithHash += `${colorValue},`
  }

  csvCodeWithoutHash = csvCodeWithoutHash.slice(0, -1)
  csvCodeWithHash = csvCodeWithHash?.slice(0, -1)

  const csv_code = document.getElementById(
    'csv-code-without-hash'
  ) as HTMLElement
  csv_code.textContent = csvCodeWithoutHash

  const csv_code_$ = document.getElementById(
    'csv-code-with-hash'
  ) as HTMLElement
  csv_code_$.textContent = csvCodeWithHash

  const copyButtonWithoutHash = document.getElementById('copy-csv-without-hash')
  copyButtonWithoutHash?.addEventListener('click', () => {
    navigator.clipboard.writeText(csvCodeWithoutHash).then(() => {
      copyButtonWithoutHash.textContent = 'Copied!'
      setTimeout(() => {
        copyButtonWithoutHash.textContent = 'Copy'
      }, 2000)
    })
  })

  const copyButtonWithHash = document.getElementById('copy-csv-with-hash')
  copyButtonWithHash?.addEventListener('click', () => {
    navigator.clipboard.writeText(csvCodeWithHash).then(() => {
      copyButtonWithHash.textContent = 'Copied!'
      setTimeout(() => {
        copyButtonWithHash.textContent = 'Copy'
      }, 2000)
    })
  })
}

const colorLabels = document.querySelectorAll<HTMLElement>('.color-label')
const colorSettings = document.querySelectorAll<HTMLElement>('.color-settings')

const randomizeSettings = document.querySelector<HTMLElement>(
  '.randomize-settings'
)

const randomizeOptionsButton = document.querySelector<HTMLElement>(
  '.randomize-options-open'
)

const isOpenSettings = new Array(colorLabels.length).fill(false)

randomizeOptionsButton?.addEventListener('click', () => {
  randomizeSettings?.classList.toggle('open-settings')
})

document.addEventListener('click', (event) => {
  const isClickInside = randomizeSettings?.contains(event.target as Node)
  if (!isClickInside) {
    randomizeSettings?.classList.remove('open-settings')
  }
})

// // Add a mouseover event listener to prevent closing the settings
// randomizeSettings.addEventListener('mouseenter', () => {
//   clearTimeout(closeTimeout); // Clear the previously set timeout
//   randomizeSettings.classList.add('open-settings');
// });

// // Add a mouseleave event listener to close the settings after a delay
// randomizeSettings.addEventListener('mouseleave', () => {
//     randomizeSettings.classList.remove('open-settings');

// });

function closeColorSettings(index: number) {
  colorSettings[index].classList.remove('open-settings')
  isOpenSettings[index] = false
}

function openColorSettings(index: number) {
  colorSettings[index].classList.add('open-settings')
  isOpenSettings[index] = true
  updateSlug()
}

function closeSettingsOnClickOutside(event: Event) {
  const isClickedInsideSettings = Array.from(
    (event.target as HTMLElement).classList
  ).some((className: string) => className?.startsWith('color-settings'))

  if (!isClickedInsideSettings) {
    colorSettings.forEach((settings, index) => {
      closeColorSettings(index)
    })
    document.removeEventListener('mousedown', closeSettingsOnClickOutside)
  }
  updateSlug()
}

colorLabels.forEach((label, index) => {
  label.addEventListener('mousedown', () => {
    if (!isOpenSettings[index]) {
      openColorSettings(index)
      for (let i = 0; i < colorSettings.length; i++) {
        if (i !== index && isOpenSettings[i]) {
          closeColorSettings(i)
        }
      }
      document.removeEventListener('mousedown', closeSettingsOnClickOutside)
      setTimeout(() => {
        document.addEventListener('mousedown', closeSettingsOnClickOutside)
      }, 1)
    }
  })
})

colorLabels.forEach((label, index) => {
  label.addEventListener('focus', () => {
    if (isOpenSettings[index]) {
      document.removeEventListener('mousedown', closeSettingsOnClickOutside)
      document.addEventListener('mousedown', closeSettingsOnClickOutside)
    }
  })
})

colorSettings.forEach((settings) => {
  settings.addEventListener('mousedown', (event) => {
    event.stopPropagation()
  })
})

const copyIcons = document.querySelectorAll<HTMLElement>('.copy-icon')

copyIcons.forEach(function (copyIcon) {
  const hexInput =
    copyIcon.parentElement?.querySelector<HTMLInputElement>('.hex-input')
  const originalHTML = copyIcon.innerHTML

  copyIcon.addEventListener('click', function () {
    const inputText = hexInput?.value as string
    navigator.clipboard.writeText(inputText)

    copyIcon.innerHTML = `
      <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.06797" y="0.905736" width="24.4083" height="24.4083" rx="3.84742" stroke="rgb(24, 172, 122)" stroke-width="0.7" style="opacity:0.3"/>
        <path d="M7 13.5L11.5 18L20 8" stroke="rgb(24, 172, 122)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    
    `

    setTimeout(function () {
      copyIcon.innerHTML = originalHTML
    }, 1000)
  })
})

// THEME

let isToggling = false

function toggleTheme() {
  if (isToggling) {
    return
  }

  isToggling = true

  const themeDiv = document.getElementById('theme') as HTMLElement

  const targetDivIds = [
    'randomize',
    'export',
    'undo',
    'redo',
    'share-link',
    'prim-cont',
    'sec-cont',
    'primbuttn-cont',
    'secbuttn-cont',
    'accent-cont',
  ]

  const overlays: HTMLElement[] = []

  const blockedKeys = [
    'ArrowRight',
    'ArrowLeft',
    ' ',
    'Control',
    'z',
    'Shift',
    'e',
    's',
  ]

  const keydownListener = (event: KeyboardEvent) => {
    if (blockedKeys.includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const disableKeyboardInput = () => {
    document.addEventListener('keydown', keydownListener, true)
  }

  disableKeyboardInput()

  const enableKeyboardInput = () => {
    document.removeEventListener('keydown', keydownListener, true)
  }

  const createOverlay = (parentDiv: HTMLElement) => {
    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    parentDiv.appendChild(overlay)
    overlays.push(overlay)
    return overlay
  }

  const removeOverlays = () => {
    overlays.forEach((overlay) => {
      overlay?.parentNode?.removeChild(overlay)
    })
    overlays.length = 0
  }

  const animateOverlayHeight = (
    overlay: HTMLElement,
    startTime: number,
    duration: number,
    targetDiv: HTMLElement
  ) => {
    const decreaseHeight = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.max(0, Math.min(1, elapsed / duration))
      overlay.style.height = `${(1 - progress) * 100}%`
      if (progress < 1) {
        requestAnimationFrame(decreaseHeight)
      } else {
        targetDiv.style.pointerEvents = ''
      }
    }
    requestAnimationFrame(decreaseHeight)
  }

  const toggleOverlay = (parentDiv: HTMLElement, isThemeDiv: boolean) => {
    const overlay = createOverlay(parentDiv)
    overlay.style.position = 'absolute'
    overlay.style.bottom = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.backgroundColor = 'rgba(124, 124, 124, 0.5)'
    overlay.style.borderRadius = '0 0 4px 4px'
    parentDiv.style.pointerEvents = 'none'

    const startTime = Date.now()
    const duration = 0
    animateOverlayHeight(overlay, startTime, duration, parentDiv)

    if (isThemeDiv) {
      overlay.addEventListener(
        'transitionend',
        () => {
          themeDiv.style.pointerEvents = ''
        },
        { once: true }
      )
    }
  }

  toggleOverlay(themeDiv, true)

  targetDivIds.forEach((divId) => {
    const targetDiv = document.getElementById(divId) as HTMLElement
    toggleOverlay(targetDiv, false)
  })

  setTimeout(() => {
    isDarkMode = !isDarkMode
    themeDiv.style.backgroundColor = isDarkMode ? 'black' : ''

    const themeContainer =
      themeDiv.querySelector<HTMLElement>('.darkorlight-cont')
    const themeWrapper = themeContainer?.children[0] as HTMLElement
    themeWrapper.style.transform = isDarkMode
      ? 'translateY(0)'
      : 'translateY(-30px)'

    const lightnessRange0 = isDarkMode ? [98, 98] : [2, 2]
    const lightnessRange1 = isDarkMode ? [2, 2] : [98, 98]
    const lightnessRange2 = isDarkMode ? [10, 10] : [90, 90]
    const lightnessRange3 = isDarkMode ? [70, 70] : [50, 50]

    const urlParams = new URLSearchParams(window.location.search)
    const colorParam = urlParams.get('colors')

    if (colorParam) {
      const hexValues = colorParam.split('-')
      const hexValue0 = setLightness(
        hexValues[0],
        lightnessRange0[0],
        lightnessRange0[1]
      )
      const hexValue1 = setLightness(
        hexValues[1],
        lightnessRange1[0],
        lightnessRange1[1]
      )
      const hexValue3 = setLightness(
        secbuttnColor.value,
        lightnessRange2[0],
        lightnessRange2[1]
      )
      const hexValue4 = setLightness(
        accentColor.value,
        lightnessRange3[0],
        lightnessRange3[1]
      )

      hexValues[0] = hexValue0.slice(1, 7)
      hexValues[1] = hexValue1.slice(1, 7)
      hexValues[3] = hexValue3.slice(1, 7)
      hexValues[4] = hexValue4.slice(1, 7)

      const newColorParam = hexValues.join('-')
      urlParams.set('colors', newColorParam)
      const newURL = `${window.location.origin}${
        window.location.pathname
      }?${urlParams.toString()}`
      window.history.replaceState(null, '', newURL)
    }

    applyColorsFromSlug()

    let elapsedTime = 0
    const interval = setInterval(() => {
      elapsedTime += 100

      if (elapsedTime >= 0) {
        clearInterval(interval)
        isToggling = false
        removeOverlays()
        enableKeyboardInput()
      }
    }, 0)
  }, 0)
}

document.addEventListener('keydown', function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
    event.preventDefault()
    document.getElementById('theme')?.click()
  }
})

function getRandomLightness(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function setLightness(
  hexColor: string,
  minLightness: number,
  maxLightness: number
) {
  const hslColor = hexToHsl(hexColor)
  const updatedColor = setHslLightness(
    hslColor,
    getRandomLightness(minLightness, maxLightness)
  )
  return updatedColor
}

function setHslLightness(hslColor: HSL, lightness: number) {
  const { h, s, l } = hslColor

  return hslToHex(h, s, lightness)
}

function hexToHsl(hexColor: string) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0
  if (hexColor.length == 4) {
    r = parseInt('0x' + hexColor[1] + hexColor[1])
    g = parseInt('0x' + hexColor[2] + hexColor[2])
    b = parseInt('0x' + hexColor[3] + hexColor[3])
  } else if (hexColor.length == 7) {
    r = parseInt('0x' + hexColor[1] + hexColor[2])
    g = parseInt('0x' + hexColor[3] + hexColor[4])
    b = parseInt('0x' + hexColor[5] + hexColor[6])
  }
  // Then to HSL
  r /= 255
  g /= 255
  b /= 255
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0

  if (delta == 0) h = 0
  else if (cmax == r) h = ((g - b) / delta) % 6
  else if (cmax == g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  h = Math.round(h * 60)

  if (h < 0) h += 360

  l = (cmax + cmin) / 2
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return { h, s, l }
}
