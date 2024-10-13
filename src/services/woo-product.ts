import isEmpty from "lodash/isEmpty"
import omit from "lodash/omit"
import random from "lodash/random"
import { Product, ProductCategoryService, ProductService, ProductStatus, ProductVariantService, SalesChannelService, ShippingProfileService, TransactionBaseService, Logger } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import WooCacheService from "./woo-cache"
import WooClientService from "./woo-client"
import { Attributes, Products as WooProducts, ProductsVariations } from "woocommerce-rest-ts-api/dist/src/typesANDinterfaces"
import { CreateProductInput, CreateProductProductVariantPriceInput } from "@medusajs/medusa/dist/types/product"
import { CreateProductVariantInput } from "@medusajs/medusa/dist/types/product-variant"

class WooProductService extends TransactionBaseService {


    public manager_: EntityManager
    public productService_: ProductService
    public productVariantService_: ProductVariantService
    public productCategoryService_: ProductCategoryService
    public shippingProfileService_: ShippingProfileService
    // /** @private @const {ShopifyRestClient} */
    public woo_: WooClientService
    public cacheService_: WooCacheService
    public salesChannelService_: SalesChannelService
    public logger_: Logger

    public options: any

    constructor(
        {
            manager,
            productService,
            productVariantService,
            productCategoryService,
            salesChannelService,
            shippingProfileService,
            wooClientService,
            wooCacheService,
            logger
        },
        options
    ) {
        super({
            manager,
            productService,
            productVariantService,
            productCategoryService,
            salesChannelService,
            shippingProfileService,
            wooClientService,
            wooCacheService,
            logger
        })

        this.options = options

        this.manager_ = manager
        this.productService_ = productService
        this.productVariantService_ = productVariantService
        this.productCategoryService_ = productCategoryService
        this.salesChannelService_ = salesChannelService
        this.shippingProfileService_ = shippingProfileService
        this.woo_ = wooClientService
        this.cacheService_ = wooCacheService
        this.logger_ = logger
    }

    // withTransaction(transactionManager: EntityManager) {
    //     if (!transactionManager) {
    //         return this
    //     }

    //     const cloned = new WooProductService(
    //         {
    //             manager: transactionManager,
    //             shippingProfileService: this.shippingProfileService_,
    //             productVariantService: this.productVariantService_,
    //             productService: this.productService_,
    //             wooClientService: this.woo_,
    //             wooCacheService: this.cacheService_,
    //         },
    //         this.options
    //     )

    //     cloned.transactionManager_ = transactionManager

    //     return cloned
    // }

    async create(data: WooProducts): Promise<Product | void> {
        return this.atomicPhase_(async (manager) => {
            const ignore = await this.cacheService_.shouldIgnore(
                data.id,
                "product.created"
            )
            if (ignore) {
                return
            }

            const existingProduct = await this.productService_
                .withTransaction(manager)
                .retrieveByExternalId(`${data.id}`, {
                    relations: ["variants", "options"],
                })
                .catch((_) => undefined)

            if (existingProduct) {
                return await this.update(existingProduct, data)
            }

            const normalizedProduct = data.type === 'simple' ? await this.normalizeSimpleProduct_(data, manager) : this.normalizeVariableProduct_(data)
            // normalizedProduct.profile_id = await this.getShippingProfile_(
            //     normalizedProduct.is_giftcard
            // )

            let variants = normalizedProduct.variants
            delete normalizedProduct.variants

            const product = await this.productService_
                .withTransaction(manager)
                .create(normalizedProduct)
                .then(p => {
                    this.logger_.info(`product with id ${p.id} created`)
                    return p
                })

            if (variants) {
                variants = variants.map((v) =>
                    this.addVariantOptions_(v, product.options)
                )

                for (let variant of variants) {
                    variant = await this.ensureVariantUnique_(variant)
                    await this.productVariantService_
                        .withTransaction(manager)
                        .create(product.id, variant as unknown as CreateProductVariantInput)
                }
            }

            await this.cacheService_.addIgnore(data.id, "product.created")

            return product
        })
    }

    async update(existing: Product, wooUpdate: WooProducts) {
        return this.atomicPhase_(async (manager) => {
            const ignore = await this.cacheService_.shouldIgnore(
                wooUpdate.id,
                "product.updated"
            )
            if (ignore) {
                return
            }

            const normalized = await this.normalizeSimpleProduct_(wooUpdate)

            existing = await this.addProductOptions_(existing, normalized.options)

            await this.updateVariants_(existing, normalized.variants)
            await this.deleteVariants_(existing, normalized.variants)
            delete normalized.variants
            delete normalized.options

            const update = {}

            for (const key of Object.keys(normalized)) {
                if (normalized[key] !== existing[key]) {
                    update[key] = normalized[key]
                }
            }

            if (!isEmpty(update)) {
                await this.cacheService_.addIgnore(wooUpdate.id, "product.updated")
                return await this.productService_
                    .withTransaction(manager)
                    .update(existing.id, update)
            }

            return Promise.resolve()
        })
    }

    async delete(id) {
        return this.atomicPhase_(async (manager) => {
            const product = await this.productService_.retrieveByExternalId(id)

            return await this.productService_
                .withTransaction(manager)
                .delete(product.id)
        })
    }

    async updateCollectionId(productId, collectionId) {
        return this.atomicPhase_(async (manager) => {
            return await this.productService_
                .withTransaction(manager)
                .update(productId, { collection_id: collectionId })
        })
    }

    async updateVariants_(product, updateVariants) {
        return this.atomicPhase_(async (manager) => {
            const { id, variants, options } = product
            for (let variant of updateVariants) {
                const ignore =
                    (await this.cacheService_.shouldIgnore(
                        variant.metadata.sh_id,
                        "product-variant.updated"
                    )) ||
                    (await this.cacheService_.shouldIgnore(
                        variant.metadata.sh_id,
                        "product-variant.created"
                    ))
                if (ignore) {
                    continue
                }

                variant = this.addVariantOptions_(variant, options)
                const match = variants.find(
                    (v) => v.metadata.sh_id === variant.metadata.sh_id
                )
                if (match) {
                    variant = this.removeUniqueConstraint_(variant)

                    await this.productVariantService_
                        .withTransaction(manager)
                        .update(match.id, variant)
                } else {
                    await this.productVariantService_
                        .withTransaction(manager)
                        .create(id, variant)
                }
            }
        })
    }

    async deleteVariants_(product, updateVariants) {
        return this.atomicPhase_(async (manager) => {
            const { variants } = product
            for (const variant of variants) {
                const ignore = await this.cacheService_.shouldIgnore(
                    variant.metadata.sh_id,
                    "product-variant.deleted"
                )
                if (ignore) {
                    continue
                }

                const match = updateVariants.find(
                    (v) => v.metadata.sh_id === variant.metadata.sh_id
                )
                if (!match) {
                    await this.productVariantService_
                        .withTransaction(manager)
                        .delete(variant.id)
                }
            }
        })
    }

    addVariantOptions_(variant, productOptions = []) {
        if (productOptions) {
            const options = productOptions.map((o, i) => ({
                option_id: o.id,
                ...variant.options[i],
            }))
            variant.options = options
        }
        return variant
    }

    async addProductOptions_(product, updateOptions) {
        return this.atomicPhase_(async (manager) => {
            const { id, options } = product

            for (const option of updateOptions) {
                const match = options.find((o) => o.title === option.title)
                if (match) {
                    await this.productService_
                        .withTransaction(manager)
                        .updateOption(product.id, match.id, { title: option.title })
                } else if (!match) {
                    await this.productService_
                        .withTransaction(manager)
                        .addOption(id, option.title)
                }
            }

            const result = await this.productService_.retrieve(id, {
                relations: ["variants", "options"],
            })

            return result
        })
    }

    async getShippingProfile_(isGiftCard) {
        let shippingProfile
        if (isGiftCard) {
            shippingProfile =
                await this.shippingProfileService_.retrieveGiftCardDefault()
        } else {
            shippingProfile = await this.shippingProfileService_.retrieveDefault()
        }

        return shippingProfile
    }

    async normalizeSimpleProduct_(product: WooProducts, manager?: EntityManager): Promise<CreateProductInput> {
        const categories = await Promise.all(product.categories.map(c => this.productCategoryService_.withTransaction(manager).retrieve(`${c.id}`)))
        const defaultSaleChannel = await this.salesChannelService_.retrieveDefault()
        const status = product.status === 'publish'
            ? ProductStatus.PUBLISHED
            : product.status === 'draft'
                ? ProductStatus.DRAFT
                : ProductStatus.PROPOSED
        return {
            title: product.name,
            handle: product.slug !== decodeURIComponent(product.slug) ? decodeURI(product.slug) : product.slug,
            description: product.description || product.short_description,
            // is_giftcard: product.product_type === "Gift Cards",
            options:
                product.attributes?.map((option) => this.normalizeProductOption_(option)) ||
                [],
            variants: [{
                title: product.name,
                prices: this.normalizePrices_([product.regular_price || 0, product.sale_price || 0]),
                sku: product.sku,
                inventory_quantity: product.stock_quantity || 0,
                allow_backorder: product.backorders_allowed,
                manage_inventory: product.manage_stock,
                weight: +product.weight,
                options: this.normalizeVariantOptions_(
                    product.attributes[0]?.name || '',
                    product.attributes[1]?.name || '',
                    product.attributes[2]?.name || ''
                ),

            }],
            categories,
            tags: product.tags.map((tag) => this.normalizeTag_(tag)) || [],
            images: product.images.map((img) => (img.src!)) || [],
            thumbnail: product.images[0]?.src || undefined,
            external_id: `${product.id}`,
            status,
            sales_channels: [{ id: defaultSaleChannel.id }]
        }
    }

    normalizeVariableProduct_(product: WooProducts): CreateProductInput {
        return {} as CreateProductInput
        // return {
        //     title: product.name,
        //     handle: product.slug,
        //     description: product.description,
        //     product_type: {
        //         value: product.type,
        //     },
        //     // is_giftcard: product.product_type === "Gift Cards",
        //     options:
        //         product.attributes.map((option) => this.normalizeProductOption_(option as Attributes)) ||
        //         [],
        //     variants: product.variations.map((variant) => this.normalizeVariant_(variant)) || [],
        //     tags: product.tags.map((tag) => this.normalizeTag_(tag)) || [],
        //     images: product.images.map((img) => img.src) || [],
        //     thumbnail: product.images[0]?.src || null,
        //     external_id: product.id,
        //     status: "proposed",
        //     metadata: {
        //         vendor: product.vendor,
        //     },
        // }
    }

    normalizeProductOption_(option: Partial<Attributes>) {
        return {
            title: option.name!,
            values: option?.options?.map((v) => {
                return { value: v }
            }),
        }
    }

    normalizeVariant_(variant: ProductsVariations) {
        // return {
        //     title: variant.title,
        //     prices: this.normalizePrices_(variant.presentment_prices),
        //     sku: variant.sku || null,
        //     barcode: variant.barcode || null,
        //     upc: variant.barcode || null,
        //     inventory_quantity: variant.inventory_quantity,
        //     variant_rank: variant.position,
        //     allow_backorder: variant.inventory_policy === "continue",
        //     manage_inventory: variant.inventory_management === "shopify",
        //     weight: variant.grams,
        //     options: this.normalizeVariantOptions_(
        //         variant.option1,
        //         variant.option2,
        //         variant.option3
        //     ),
        //     metadata: {
        //         sh_id: variant.id,
        //     },
        // }
    }


    normalizePrices_(presentmentPrices): CreateProductProductVariantPriceInput[] {
        return presentmentPrices.filter(p => p !== 0).map((p) => {
            return {
                amount: p,
                currency_code: process.env.CURRENCY_CODE || 'IRR',
            }
        })
    }

    normalizeVariantOptions_(option1, option2, option3) {
        const opts = [] as any
        if (option1) {
            opts.push({
                value: option1,
            })
        }

        if (option2) {
            opts.push({
                value: option2,
            })
        }

        if (option3) {
            opts.push({
                value: option3,
            })
        }

        return opts
    }

    normalizeTag_(tag) {
        return {
            value: tag,
        }
    }

    handleDuplicateConstraint_(uniqueVal) {
        return `DUP-${random(100, 999)}-${uniqueVal}`
    }

    async testUnique_(uniqueVal, type) {
        // Test if the unique value has already been added, if it was then pass the value onto the duplicate handler and return the new value
        const exists = await this.cacheService_.getUniqueValue(uniqueVal, type)

        if (exists) {
            const dupValue = this.handleDuplicateConstraint_(uniqueVal)
            await this.cacheService_.addUniqueValue(dupValue, type)
            return dupValue
        }
        // If it doesn't exist, we return the value
        await this.cacheService_.addUniqueValue(uniqueVal, type)
        return uniqueVal
    }

    async ensureVariantUnique_(variant) {
        let { sku, ean, upc, barcode } = variant

        if (sku) {
            sku = await this.testUnique_(sku, "SKU")
        }

        if (ean) {
            ean = await this.testUnique_(ean, "EAN")
        }

        if (upc) {
            upc = await this.testUnique_(upc, "UPC")
        }

        if (barcode) {
            barcode = await this.testUnique_(barcode, "BARCODE")
        }

        return { ...variant, sku, ean, upc, barcode }
    }

    removeUniqueConstraint_(update) {
        const payload = omit(update, ["sku", "ean", "upc", "barcode"])

        return payload
    }
}

export default WooProductService
