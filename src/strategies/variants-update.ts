import {
    AbstractBatchJobStrategy,
    BatchJobService,
    CreateBatchJobInput,
    BatchJob,
    StoreService,
    MedusaRequest,
    ProductVariantService
} from "@medusajs/medusa"
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

    constructor(
        {
            manager,
            storeService,
            productVariantService,
            batchJobService
        },
        options
    ) {
        super({
            manager,
            storeService,
            productVariantService,
            batchJobService
        })


        this.manager_ = manager
        this.store_ = storeService
        this.batchJobService_ = batchJobService
        this.productVariantService_ = productVariantService
    }


    async prepareBatchJobForProcessing(
        batchJob: CreateBatchJobInput,
        req: MedusaRequest
    ): Promise<CreateBatchJobInput> {

        console.log(req.body)

        return batchJob
    }

    async preProcessBatchJob(batchJobId: string): Promise<void> {
        return
    }


    async processJob(batchJobId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {

            const batchJob = (await this.batchJobService_
                .withTransaction(manager)
                .retrieve(batchJobId))

            const productVariantServiceTx = this.productVariantService_
                .withTransaction(manager)

            const context = batchJob.context as { data: ContextData[] }
            const data = context.data
            const count = data.length

            data.forEach(async d => {
                const { sku, quantity, price } = d
                
                const variant = await productVariantServiceTx.retrieveBySKU(sku, {
                    // region_id: "reg_01HV8YJHZYC979X27ABJDP0Q67",
                    relations: ["prices"]
                })
                const variantId = variant.id

                await productVariantServiceTx.updateVariantPrices([{
                    variantId,
                    prices: [{
                        amount: price,
                        currency_code: 'irr'
                    }]
                }])

                await productVariantServiceTx.update(variantId, { inventory_quantity: quantity })
            })



            await this.batchJobService_
                .withTransaction(manager)
                .update(batchJobId, {
                    result: {
                        advancement_count: count,
                        count,
                        stat_descriptors: [
                            {
                                key: "variatn-update-count",
                                name: "Number of product variants to update",
                                message:
                                    `${count} product(s) will be updated.`,
                            },
                        ],
                    },
                })




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