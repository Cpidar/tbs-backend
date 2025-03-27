import {
    AbstractBatchJobStrategy,
    BatchJobService,
    CreateBatchJobInput,
    BatchJob,
    StoreService,
    MedusaRequest,
    ProductVariantService
} from "@medusajs/medusa"
import PishroAccService from "src/services/pishro-acc"
import { EntityManager } from "typeorm"

interface ContextData {
    sku: string
    quantity: number
    price: number
}

class WoocommerceImportStrategy extends AbstractBatchJobStrategy {
    static batchType = "variants-update"
    static identifier = "variatn-update-strategy"

    protected batchJobService_: BatchJobService
    protected productVariantService_: ProductVariantService
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
    protected store_: StoreService
    protected pishroAccService_: PishroAccService

    constructor(
        {
            manager,
            storeService,
            productVariantService,
            batchJobService,
            pishroAccService
        },
        options
    ) {
        super({
            manager,
            storeService,
            productVariantService,
            batchJobService,
            pishroAccService
        })


        this.manager_ = manager
        this.store_ = storeService
        this.batchJobService_ = batchJobService
        this.productVariantService_ = productVariantService
        this.pishroAccService_ = pishroAccService
    }


    async prepareBatchJobForProcessing(
        batchJob: CreateBatchJobInput,
        req: MedusaRequest
    ): Promise<CreateBatchJobInput> {

        const {
            entity: {
                username,
                appcode,
                password
            }
        } = (req.body as any).context

        console.log(username,
            appcode,
            password)
        return batchJob
    }

    async preProcessBatchJob(batchJobId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {

        const batchJob = (await this.batchJobService_
            .retrieve(batchJobId))

        const {
            entity: {
                username,
                appcode,
                password
            }
        } = batchJob.context as any

        const token = await this.pishroAccService_.getToken({ username, appcode, password })
        const products = await this.pishroAccService_.getPorductsData(token)
        const count = products.length

        const data: ContextData[] = products
            .map(p => ({ sku: `${p.GroupId}${p.Code}`, quantity: +(p.ProductStocks[0].Stock).split('/')[0], price: +p.Price }))

        await this.batchJobService_
            .update(batchJob, {
                context: {
                    data
                },
                result: {
                    advancement_count: 0,
                    count,
                    stat_descriptors: [
                        {
                            key: "product-publish-count",
                            name: "Number of products to publish",
                            message:
                                `${count} product(s) will be published.`,
                        },
                    ],
                },
            })
        })
    }


    async processJob(batchJobId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {

        const batchJob = (await this.batchJobService_
            .withTransaction(manager)
            .retrieve(batchJobId))

        // console.log(batchJob)

        const productVariantServiceTx = this.productVariantService_
        .withTransaction(manager)

        const data = batchJob.context?.data as ContextData[]

        const updatedProducts = await Promise.all(data.map(async d => {
            console.log(d)
            const { sku, quantity, price } = d

            try {

                const variant = await productVariantServiceTx.retrieveBySKU(sku, {
                    // region_id: "reg_01HV8YJHZYC979X27ABJDP0Q67",
                    relations: ["prices"]
                })

                console.log(variant)

                if (variant) {

                    const variantId = variant.id

                    await productVariantServiceTx.updateVariantPrices([{
                        variantId,
                        prices: [{
                            amount: price,
                            currency_code: 'irr'
                        }]
                    }])

                    await productVariantServiceTx.update(variantId, { inventory_quantity: quantity })
                }

                return variant
            } catch (e) {
                console.error(e)
            }
        }))



        //     await this.batchJobService_
        //         .withTransaction(manager)
        //         .update(batchJobId, {
        //             result: {
        //                 advancement_count: count,
        //                 count,
        //                 stat_descriptors: [
        //                     {
        //                         key: "variatn-update-count",
        //                         name: "Number of product variants to update",
        //                         message:
        //                             `${count} product(s) will be updated.`,
        //                     },
        //                 ],
        //             },
        //         })




        })
    }

    buildTemplate(): Promise<string> {
        throw new Error("Method not implemented.")
    }
    protected async shouldRetryOnProcessingError(
        batchJob: BatchJob,
        err: unknown
    ): Promise<boolean> {
        return true
    }
    protected async handleProcessingError<T>(
        batchJobId: string,
        err: unknown,
        result: T
    ): Promise<void> {
        // different implementation...
    }
}

export default WoocommerceImportStrategy