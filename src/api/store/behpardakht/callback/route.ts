import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"
import TtlCacheService from "src/services/ttl-cache"
import { EntityManager } from "typeorm"

interface BodyType {
    ResCode?: string
    RefId: string
    SaleOrderId: string
    SaleReferenceId: string
}

export const POST = async (
    req: MedusaRequest<BodyType>,
    res: MedusaResponse
) => {
    const { SaleOrderId, SaleReferenceId, RefId, ResCode } = req.body
    const cacheService: TtlCacheService = req.scope.resolve("ttlCacheService")

    if (!ResCode) {
        res.status(403).json({ message: 'پاسخی از بانک دریافت نشد' })
    }

    if (ResCode && (["0", "43"].indexOf(ResCode) === -1)) {
        res.status(401).json({
            ResCode
        })
    }

    cacheService.set(RefId, SaleReferenceId)

    return res.status(200).json({
        SaleOrderId, SaleReferenceId, RefId, ResCode
    })
}