import { TransactionBaseService } from "@medusajs/medusa"
import { fetchOTP } from "../utils/fetch"

class MellipayamakService extends TransactionBaseService {
  getMessage() {
    return `Welcome to My Store!`
  }
  async sendOTP(body: { to: string }) {
    try {
      const res: any = await fetchOTP('console.melipayamak.com', '/api/send/otp/d2a06968057f4cdf80c0a719d815e24b', body)

      if(!res?.code) {
        return null
      }
      return res?.code
    } catch (e) {
      throw new Error(e)
    }
  }

  async sendShared(body: {
    bodyId: number
    to: string
    args: string[]
  }) {
    try {
      const res: any = await fetchOTP('console.melipayamak.com', '/api/send/shared/d2a06968057f4cdf80c0a719d815e24b', body)

      if(!res?.recId) {
        return null
      }

      return res?.recId
    } catch (e) {
      throw new Error(e)
    }
  }
}

export default MellipayamakService