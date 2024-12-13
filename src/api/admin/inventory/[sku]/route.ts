import type {
    MedusaRequest,
    MedusaResponse,
    PricingService,
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
    const amount = +((req.body as any).amount)
    const productVariantService: ProductVariantService = req.scope.resolve('productVariantService')
    const pricingService: PricingService = req.scope.resolve('pricingService')
    console.log(amount)
    
    const variant = await productVariantService.retrieveBySKU(sku, {
        // region_id: "reg_01HV8YJHZYC979X27ABJDP0Q67",
        relations: ["prices"]
    })

    const variantId = variant.id
    const prices = variant.prices
    console.log(prices)

    await productVariantService.updateVariantPrices([{
        variantId,
        prices: [{
            amount,
            currency_code: 'irr'
        }]
    }])
    const updatedVarinat = await productVariantService.update(variantId, { inventory_quantity })

    const price = await pricingService.getProductVariantPricing(variant, {
        // region_id: "reg_01HV8YJHZYC979X27ABJDP0Q67"
    })


    res.json({ price })

}