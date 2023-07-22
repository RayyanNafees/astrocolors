// // FONTS

// // Headings
const h1Tags = document.getElementsByTagName('h1')
const h2Tags = document.getElementsByTagName('h2')
const fontUploadHeadings = document.getElementById(
  'font-upload-headings'
) as HTMLInputElement
const headingLabelSpan = document.getElementById('heading-label-span')!
const headingsFontsLabel = document.querySelector<HTMLElement>(
  '#headings-fonts-label'
)!
const headingFontName = 'custom-heading-font'
const googleFontSelectHeading = document.getElementById(
  'google-font-select-heading'
)! as HTMLInputElement
const googleFontSelectText = <HTMLInputElement>document.getElementById('google-font-select-text')!
const errorMessageFonts = document.querySelectorAll('.error-message-fonts')!

let currentFont
let file

fontUploadHeadings.addEventListener('change', () => {
  const file = fontUploadHeadings?.files && fontUploadHeadings.files[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const fontUrl = reader.result
      const fontName = 'custom-font'
      const fontFace = new FontFace(headingFontName, `url(${fontUrl})`)
      document.fonts.add(fontFace)
      const headings = document.querySelectorAll<HTMLElement>('h1, h2')
      headings.forEach((heading) => {
        heading.style.fontFamily = `${headingFontName}, sans-serif`
        heading.style.letterSpacing = 'normal'
      })
      const headingLabelSpan = document.querySelector(
        '#heading-label-span'
      ) as HTMLElement
      const fileName = file.name
      headingLabelSpan.innerText = fileName
    }
  }
})

const resetFontButtonHeading = document.querySelector<HTMLElement>('.reset-font-heading')!
resetFontButtonHeading.addEventListener('click', () => {
  const headings = document.querySelectorAll<HTMLElement>('h1, h2')
  headings.forEach((heading) => {
    heading.style.fontFamily = 'Inter'
  })
  headingLabelSpan.innerText = `Upload`
  headingsFontsLabel.style.fontFamily = 'Inter'
  file = null
  googleFontSelectHeading.value = ''
  fontUploadHeadings.value = ''
  googleFontSelectHeading.value = ''
  const changeEvent = new Event('change')
  const inputEvent = new Event('input')
  fontUploadHeadings.dispatchEvent(changeEvent)
  googleFontSelectHeading.dispatchEvent(inputEvent)
  const errorElement = document.getElementById('heading-error-message')!
  errorElement.style.display = 'none'
})

// Text
const paragraphTags = document.getElementsByTagName('p')
const hrefTags = document.getElementsByTagName('a')
const h3Tags = document.getElementsByTagName('h3')
const fontUploadTexts = document.getElementById(
  'font-upload-texts'
) as HTMLInputElement
const textLabelSpan = document.getElementById('text-label-span')!
const textsFontsLabel = document.querySelector<HTMLElement>('#texts-fonts-label')!
const textFontName = 'custom-text-font'

fontUploadTexts.addEventListener('change', () => {
  const file = fontUploadTexts.files && fontUploadTexts.files[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const fontUrl = reader.result
      const fontName = 'custom-font'
      const fontFace = new FontFace(textFontName, `url(${fontUrl})`)
      document.fonts.add(fontFace)
      const texts = document.querySelectorAll<HTMLElement>('p, a, h3, li')
      texts.forEach((text) => {
        text.style.fontFamily = `${textFontName}, sans-serif`
        text.style.letterSpacing = 'normal'
      })
      const textLabelSpan = document.querySelector<HTMLElement>('#text-label-span')!
      const fileName = file.name
      textLabelSpan.innerText = fileName
    }
  }
})

const resetFontButtonText = document.querySelector<HTMLElement>('.reset-font-text')!
resetFontButtonText.addEventListener('click', () => {
  const texts = document.querySelectorAll<HTMLElement>('p, a, h3, li')!
  texts.forEach((text) => {
    text.style.fontFamily = 'Inter'
  })
  textLabelSpan.innerText = `Upload`
  textsFontsLabel.style.fontFamily = 'Inter'
  file = null
  fontUploadTexts.value = ''
  googleFontSelectText.value = ''
  const changeEvent = new Event('change')
  const inputEvent = new Event('input')
  fontUploadTexts.dispatchEvent(changeEvent)
  googleFontSelectText.dispatchEvent(inputEvent)
  const errorElement = document.getElementById('text-error-message')!
  errorElement.style.display = 'none'
})

googleFontSelectHeading.addEventListener('change', async () => {
  let selectedFont = googleFontSelectHeading.value
  const errorElement = document.getElementById('heading-error-message')! // Replace with the appropriate error element ID
  try {
    const normalizedFont = await normalizeFontName(selectedFont, errorElement)
    if (normalizedFont) {
      applyGoogleFont(normalizedFont, ['h1', 'h2'])
    }
  } catch (error) {
    console.error(error)
  }
})

googleFontSelectText.addEventListener('change', async () => {
  let selectedFont = googleFontSelectText.value
  const errorElement = document.getElementById('text-error-message')! // Replace with the appropriate error element ID
  try {
    const normalizedFont = await normalizeFontName(selectedFont, errorElement)
    if (normalizedFont) {
      applyGoogleFont(normalizedFont, ['p', 'a', 'h3', 'li'])
    }
  } catch (error) {
    console.error(error)
  }
})

function capitalizeFirstLetter(string: string) {
  return string.replace(/\b\w/g, (match) => match.toUpperCase())
}

async function normalizeFontName(fontName: string, errorElement: HTMLElement) {
  const lowerCaseFontName = fontName.toLowerCase()
  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBGvuAr8QpuKsPCBBr9bWgzxysFMLG4oeE&sort=popularity`
  )
  const data = await response.json()

  const matchedFont = data.items.find(
    (font: { family: string }) =>
      font.family.toLowerCase() === lowerCaseFontName
  )

  if (matchedFont) {
    errorElement.style.display = 'none'
    return matchedFont.family
  } else {
    const testElement = document.createElement('span')
    testElement.style.fontFamily = fontName
    testElement.innerText = 'Sample text'

    document.body.appendChild(testElement)

    const isFontAvailable =
      testElement.offsetWidth !== 0 || testElement.offsetHeight !== 0

    document.body.removeChild(testElement)

    if (isFontAvailable) {
      errorElement.textContent =
        'No results on Google Fonts. Switched to local fonts.'
      errorElement.style.display = 'block'
      return fontName
    }
  }
}

function matchFontWeight(fontName: string, fontWeight: number) {
  const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  const closestWeight = fontWeights.reduce((a, b) => {
    return Math.abs(b - fontWeight) < Math.abs(a - fontWeight) ? b : a
  })

  if (fontWeights.includes(closestWeight)) {
    return closestWeight
  } else {
    return fontWeights[0]
  }
}
const elem = document.getElementsByTagName('div')

function applyGoogleFont(fontName: string, selectors: string[]) {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName
    .toString()
    .replace(' ', '+')}`
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = fontUrl

  // Check if the font link already exists, remove the existing one if so
  const existingFontLink = document.querySelector<HTMLElement>(`link[href="${fontUrl}"]`)
  if (existingFontLink) {
    existingFontLink.remove()
  }

  document.head.appendChild(fontLink)

  selectors.forEach((selector: string) => {
    const texts = document.querySelectorAll<HTMLElement>(selector)!
    texts.forEach((text) => {
      const fontWeight = +getComputedStyle(text).fontWeight
      const matchedWeight = matchFontWeight(fontName, fontWeight)
      text.style.fontFamily = `${fontName}, sans-serif`
      text.style.fontWeight = String(matchedWeight)
      text.style.letterSpacing = 'normal'
    })
  })
}
