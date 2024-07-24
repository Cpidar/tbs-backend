import {
    AbstractBatchJobStrategy,
    BatchJobService,
    CreateBatchJobInput,
    ProductService,
    ProductStatus,
    BatchJob,
    StoreService,
    ProductCategoryService,
    ProductCategory
} from "@medusajs/medusa"
import { WooCommerceRestApiOptions } from "@woocommerce/woocommerce-rest-api"
import WooCategoryService from "src/services/woo-category"
import WooClientService from "src/services/woo-client"
import { EntityManager } from "typeorm"

class WoocommerceImportStrategy extends AbstractBatchJobStrategy {
    static batchType = "category-update"
    static identifier = "woocommerce-category-update-strategy"

    protected batchJobService_: BatchJobService
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
    protected productService_: ProductService
    protected client_: WooClientService
    protected wooCategoryService_: WooCategoryService
    protected categoryService_: ProductCategoryService
    protected store_: StoreService

    constructor(
        {
            manager,
            storeService,
            wooProductService,
            wooCategoryService,
            wooClientService,
            productCategoryService,
            batchJobService
        },
        options
    ) {
        super({
            manager,
            storeService,
            wooProductService,
            wooCategoryService,
            wooClientService,
            productCategoryService,
            batchJobService
        })


        this.manager_ = manager
        this.productService_ = wooProductService
        this.wooCategoryService_ = wooCategoryService
        this.client_ = wooClientService
        this.store_ = storeService
        this.categoryService_ = productCategoryService
        this.batchJobService_ = batchJobService
    }

    async prepareBatchJobForProcessing(
        batchJob: CreateBatchJobInput,
        req: Express.Request
    ): Promise<CreateBatchJobInput> {

        const url = process.env.WOO_URL
        const consumerKey = process.env.WOO_CONSUMER_KEY
        const consumerSecret = process.env.WOO_CONSUMER_SECRET
        // const { url, consumerKey, consumerSecret } = batchJob.context as unknown as WooCommerceRestApiOptions
        console.log(batchJob.context)

        this.client_.initialize({ url, consumerKey, consumerSecret })
        return batchJob
    }

    async preProcessBatchJob(batchJobId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {

            //   await this.shippingProfileService_.createDefault()
            //   await this.shippingProfileService_.createGiftCardDefault()

            // const { data: products } = await this.client_.get('products')


            let count: number
            let breakLoop = false
            let page = 1
            const [categories, ] = await this.categoryService_.withTransaction(manager).listAndCount({})
            count = categories.length

            Promise.all(
                categories.map(c => this.wooCategoryService_
                    .withTransaction(manager)
                    .updateCategoryStructure(c))
            )
            // while (!breakLoop) {
            //     // let data = await this.client_.get('products', { page, per_page: 100, type: "simple" })
            //     const data = await this.client_.get('products/categories', { page, per_page: 100 })
            //         .then((response) => {
            //             return response.data
            //         })
            //         .catch((error) => {
            //             console.log(error.response.data);
            //         })
            //     if (data.length === 0 || !data) {
            //         breakLoop = true
            //     } else {
            //         count = data.length
            //         const sortedData = data.sort((a, b) => a.parent - b.parent)
            //         // const filteredData = data.filter(x => x.id !== 1985 || x.parent !== 1985)



            //         // const productServiceTx = this.productService_.withTransaction(manager)
            //         // const resolvedProducts = await Promise.all(
            //         //   data.map(async (product) => {
            //         //     return await productServiceTx.create(product)
            //         //   })
            //         // )

            //         page = page + 1
            //     }
            // }

            // const productServiceTx = this.productService_.withTransaction(manager)
            // const resolvedProducts = await Promise.all(
            //   products.map(async (product) => {
            //     return await productServiceTx.create(product)
            //   })
            // )

            await this.batchJobService_
                .withTransaction(manager)
                .update(batchJobId, {
                    result: {
                        advancement_count: 0,
                        count,
                        stat_descriptors: [
                            {
                                key: "category-import-count",
                                name: "Number of category to import",
                                message:
                                    `${count} category(ies) will be imported.`,
                            },
                        ],
                    },
                })




        })
    }


    async processJob(batchJobId: string): Promise<void> {
        // return this.atomicPhase_(async (manager) => {

        //     const categories = await this.categoryService_
        //         .withTransaction(manager)
        //         .listAndCount({})


        //     categories[0].forEach(async category => this.wooCategoryService_
        //         .withTransaction(manager)
        //         .updateCategoryStructure(category)
        //     )

        //     await this.batchJobService_
        //         .withTransaction(manager)
        //         .update(batchJobId, {
        //             result: {
        //                 advancement_count: categories[1],
        //             },
        //         })
        // })
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