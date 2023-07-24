// import type {APIRoute} from 'astro'
import { randomizeColors } from '../../utils/color'
export async function get() {
  const [text, bg, primary, secondary, accent] = randomizeColors() as string[]
  return new Response(
    JSON.stringify({ text, bg, primary, secondary, accent }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
