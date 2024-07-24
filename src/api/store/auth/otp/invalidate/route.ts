import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa"

import TtlCacheService from 'src/services/ttl-cache'

interface BodyType  {
  phone: string
}

export const POST = async (req: MedusaRequest<BodyType>, res: MedusaResponse) => {
  const { phone } = req.body
  const ttlCache: TtlCacheService = req.scope.resolve('ttlCacheService')


  try {

    ttlCache.invalidate(phone)
    return res.status(200).json({ status: 200, message: `otp code invalidated` })

  } catch (error) {
    return res.status(404).json({ message: `There was an error sending the email.` })
  }
}

