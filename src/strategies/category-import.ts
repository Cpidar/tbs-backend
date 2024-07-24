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
    static batchType = "category-import"
    static identifier = "woocommerce-category-import-strategy"

    protected batchJobService_: BatchJobService
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
    protected productService_: ProductService
    protected client_: WooClientService
    protected wooCategoryService_: WooCategoryService
    protected categoryService_: ProductCategoryService
    protected store_: StoreService
    protected treeStructuredCategories: any[][]

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

            const arrayToTree = (arr, parent = 0) =>
                arr.filter(item => item.parent === parent)
                    .map(child => ({
                        ...child, children: arrayToTree(arr,
                            child.id)
                    }));

            const walkBFS = async (root) => {
                if (root === null) return

                let queue = [...root], ans = []

                while (queue.length) {
                    const item = queue.shift()
                    const categories = await this.wooCategoryService_
                        .withTransaction(manager)
                        .createCategory([item])
                    if (item.children) queue = [...queue, ...item.children]
                }
                return ans
            }

            let count: number
            let breakLoop = false
            let page = 1
            let data = []
            // while (!breakLoop) {
            const categories = await this.client_.get('products/categories', { page, per_page: 100 })
                .then((response) => {
                    return response.data
                })
                .catch((error) => {
                    console.log(error.response.data);
                })
            if (categories.length === 0 || !categories) {
                breakLoop = true
            } else {
                count = data.length
                data = [...data, ...categories]
                const tree = await arrayToTree(data)
                await walkBFS(tree)

                page = page + 1
            }
            // }



            await this.batchJobService_
                .withTransaction(manager)
                .update(batchJobId, {
                    result: {
                        advancement_count: 0,
                        count: data.length,
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
        return this.atomicPhase_(async (manager) => {
            console.log(this.treeStructuredCategories)

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