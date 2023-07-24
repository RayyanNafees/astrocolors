import type { APIRoute } from 'astro'

import { colorSets, choice } from '../../utils/random-sets'
import {txt} from '../../utils/api'

/**
 * 
 * @returns A random predefined color set from utils/random-sets.ts
 */
export const get: APIRoute = async () => txt(choice(colorSets).colors)
