export const json = (colorset: string[]): Response => {
  const [text, bg, primary, secondary, accent] = colorset
  return new Response(
    JSON.stringify({ text, bg, primary, secondary, accent }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
export const css = (colorset: string[]): Response => {
  const [text, bg, primary, secondary, accent] = colorset

  const cssvars = `:root {
    --rc-text: ${text};
    --rc-bg: ${bg};
    --rc-primary:${primary};
    --rc-secondary: ${secondary};
    --rc-accent: ${accent};
  }`

  return new Response(cssvars, {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/css; charset=utf-8',
    },
  })
}

export const txt = (colorset: string[]): Response =>
  new Response(colorset.join('-'))

export default json
