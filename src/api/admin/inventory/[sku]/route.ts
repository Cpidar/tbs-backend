import type {
    MedusaRequest,
    MedusaResponse,
    ProductVariant,
    ProductVariantService,
} from "@medusajs/medusa"
import { UpdateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant"

export const PUT = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const sku = req.params.sku
    const inventory_quantity = (req.body as UpdateProductVariantInput).inventory_quantity
    const productVariantService: ProductVariantService = req.scope.resolve('productVariantService')

    const variant = await productVariantService.retrieveBySKU(sku)
    const variantId = variant.id

    const updatedVarinat = await productVariantService.update(variantId, { inventory_quantity })

    res.json({ updatedVarinat })

}