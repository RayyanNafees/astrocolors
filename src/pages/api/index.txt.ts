import type { APIRoute } from 'astro'

import { randomizeColors } from '../../utils/color'
import { txt } from '../../utils/api'

export const get: APIRoute = async () => txt(randomizeColors())
