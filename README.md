# Astro Colors

[Realtime Colors](https://realtimecolors.com) site but much cleaner implementation in [Astro](https://astro.build) + [Solid](https://solidjs.com) + [UnoCSS](https://unocss.dev)

## REST API

**baseURL**: `https://astrocolors.vercel.app`

#### Endpoints:

**GET** `/api` => Returns the randomly generated color values with realtimecolors algorithm

**GET** `/colorset` => Returns the predefined set of beautiful colors in realtimecolors

_Returned variables:_

- `text` - text color
- `bg` - backrgound colors
- `primary` - primary color
- `secondary` - secondary colot
- `accent` - accent color

### Endpoint Suffices

#### `.css`

Suffix `.css` to get the color values as css variables as in `_/api.css` or `_/colorset.css`

For example:

```css
@import url('https://astrocolors.vercel.app/api.css');
```

Will return the css with variables:

```css
:root {
    --rc-text:     #..., /*The hex colorcode for text*/
    --rc-bg:       #...; /*The hex colorcode for background*/
    --rc-primary:  #...; /*The primary color hexcode*/
    --rc-secondary:#...; /*The secondary color hexcode*/
    --rc-accent:   #...; /*The accent color hexcode*/
  }

```

#### `.txt`

Suffix `.txt` to get the variable as dash-separated text as in `_/api.txt` or `_/colorset.txt`

```js
'text-bg-primary-secondary-accent'
```

## Website Stack

- [Starlight](https://starlight.astro.build) for the docs
- [UnoCSS](https://unocss.dev) for Icons & Styling css
- [Dexie](https://dexie.org) for storing user themes in IndexedDB (Browser's Database)
- [SolidJS](https://solidjs.com) for updating frotnend UI in a much cleaner and efficient way
- [nanostores](https://github.com/nanostores/nanostores) for managing state between different parts of the website
- [Astro](https://astro.build) for providing the backend service for rendering & the REST API

## Feature stack

- qrcode
- FileSaver
- zip
