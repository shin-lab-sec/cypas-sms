import { createHash } from 'crypto'

export const createHashKey = (...args: any[]) => {
  return createHash('sha256').update(args.join()).digest('hex')
}
