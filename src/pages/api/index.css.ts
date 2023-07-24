import type { APIRoute } from 'astro'

import { randomizeColors } from '../../utils/color'
import { css } from '../../utils/api'

export const get: APIRoute = async () => css(randomizeColors())
