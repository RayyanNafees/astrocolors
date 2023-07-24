import type { APIRoute } from 'astro'

import { colorSets, choice } from '../../utils/random-sets'
import json from '../../utils/api'

/**
 * 
 * @returns A random predefined color set from utils/random-sets.ts
 */
export const get: APIRoute = async () => json(choice(colorSets).colors)
