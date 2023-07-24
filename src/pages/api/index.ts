import type {APIRoute} from 'astro'
import { randomizeColors } from '../../utils/color'
import json from '../../utils/api'

export const get:APIRoute = async () => json(randomizeColors())
