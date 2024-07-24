import { AbstractSearchService } from "@medusajs/utils"
import MiniSearch from 'minisearch'
import { transformProduct } from "../utils/transformers"
import { Lifetime } from "awilix"

class MinisearchService extends AbstractSearchService {
    isDefault = true
    protected client: MiniSearch
    static LIFE_TIME = Lifetime.SINGLETON

    constructor() {
        // @ts-expect-error prefer-rest-params
        super(...arguments)


        // you can also initialize a client that
        // communicates with a third-party service.
        this.client = new MiniSearch({
            fields: ['title'],
            storeFields: ['title', 'collection']
        })
    }

    createIndex(indexName: string, options: Record<string, any>) {
        throw new Error("Method not implemented.")
    }
    getIndex(indexName: string) {
        throw new Error("Method not implemented.")
    }
    addDocuments(
        indexName: string,
        documents: Record<string, any>[],
        type: string
    ) {
        const transformedDocuments = this.getTransformedDocuments(type, documents)
        return this.client.addAll(transformedDocuments)
    }
    replaceDocuments(
        indexName: string,
        documents: Record<string, any>[],
        type: string
    ) {
        const transformedDocuments = this.getTransformedDocuments(type, documents)
        transformedDocuments.forEach(doc => this.client.replace(doc))
    }
    async deleteDocument(
        indexName: string,
        document_id: string | number
    ) {
        return this.client.discard(document_id)
    }
    deleteAllDocuments(indexName: string) {
        throw new Error("Method not implemented.")
    }
    search(
        indexName: string,
        query: string,
        options: Record<string, any>
    ) {
        console.log(this.client.documentCount)
        const hits = this.client.search(query)
        console.log(hits)

        return {
            hits
        }
    }
    updateSettings(
        indexName: string,
        settings: Record<string, any>
    ) {
        throw new Error("Method not implemented.")
    }

    getTransformedDocuments(type: string, documents: any[]) {
        if (!documents?.length) {
            return []
        }

        return documents.map(transformProduct)
    }

}

export default MinisearchService