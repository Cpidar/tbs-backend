import {
    AbstractFulfillmentService,
    Cart,
    Fulfillment,
    LineItem,
    MedusaContainer,
    Order
} from "@medusajs/medusa"
import { CreateReturnType } from "@medusajs/medusa/dist/types/fulfillment-provider"

class PishtazFulfillmentService extends AbstractFulfillmentService {
    static identifier = "pishtaz-fulfillment";

    options: any

    constructor(container: MedusaContainer, options) {
        super(container as any)

        this.options = options

        this.options.default_template ||= process.env.INPOST_DEFAULT_TEMPLATE
        this.options.sourceState = process.env.SOURCE_PROVINCE

    }

    async getFulfillmentOptions(): Promise<any[]> {
        return [
            { id: "Pishtaz" },
        ]
    }

    async validateFulfillmentData(
        optionData: { [x: string]: unknown },
        data: { [x: string]: unknown },
        cart: Cart
    ): Promise<Record<string, unknown>> {
        if (cart.shipping_address.phone === null) {
            throw new Error("Phone number is required")
        }
        return data
    }

    async validateOption(
        data: { [x: string]: unknown }
    ): Promise<boolean> {
        return data.id == "Pishtaz"
    }

    async canCalculate(
        data: { [x: string]: unknown }
    ): Promise<boolean> {
        return false
    }

    async calculatePrice(
        optionData: { [x: string]: unknown },
        data: { [x: string]: unknown },
        cart: Cart
    ): Promise<number> {
        const province = cart.shipping_address.province

        if (province === this.options.sourceState) {
            return this.options.insideStatePrice
        } else if (this.postInsidePart(this.options.sourceState).includes(province)) {
            return this.options.edgeStatePrice
        } else {
            return this.options.outsideStatePrice
        }
    }

    async createFulfillment(
        data: { [x: string]: unknown },
        items: LineItem[],
        order: Order,
        fulfillment: Fulfillment
    ): Promise<any> {
        // 3rd party api going here

        return {}
    }

    async cancelFulfillment(
        fulfillment: { [x: string]: unknown }
    ): Promise<any> {
        throw new Error("Method not implemented.")
    }

    async createReturn(
        returnOrder: CreateReturnType
    ): Promise<Record<string, unknown>> {
        throw new Error("Method not implemented.")
    }

    async getFulfillmentDocuments(
        data: { [x: string]: unknown }
    ): Promise<any> {
        throw new Error("Method not implemented.")
    }

    async getReturnDocuments(
        data: Record<string, unknown>
    ): Promise<any> {
        throw new Error("Method not implemented.")
    }

    async getShipmentDocuments(
        data: Record<string, unknown>
    ): Promise<any> {
        throw new Error("Method not implemented.")
    }

    async retrieveDocuments(
        fulfillmentData: Record<string, unknown>,
        documentType: "invoice" | "label"
    ): Promise<any> {
        throw new Error("Method not implemented.")
    }
    private postInsidePart($sourcePartId)
    {
        let $result = [];
        switch ($sourcePartId) {
            case 1:
                $result = Array(13,31,11,10,9);
                break;
            case 2:
                $result = Array(15,12,8,13);
                break;
            case 3:
                $result = Array(15,12,16);
                break;
            case 4:
                $result = Array(27,20,24,28,21);
                break;
            case 5:
                $result = Array(21,28,6,25,22,23);
                break;
            case 6:
                $result = Array(5,25,9,10,11,20,24,28);
                break;
            case 7:
                $result = Array(29,9,30,25);
                break;
            case 8:
                $result = Array(2,12,17,11,31,13);
                break;
            case 9:
                $result = Array(6,25,7,29,14,13,1,10);
                break;
            case 10:
                $result = Array(1,6,9,11);
                break;
            case 11:
                $result = Array(6,10,1,31,8,17,20);
                break;
            case 12:
                $result = Array(3,16,15,2,8,17,18);
                break;
            case 13:
                $result = Array(14,2,1,31,8,9);
                break;
            case 14:
                $result = Array(29,9,13);
                break;
            case 15:
                $result = Array(3,2,12);
                break;
            case 16:
                $result = Array(3,12,18);
                break;
            case 17:
                $result = Array(18,19,12,8,11,20);
                break;
            case 18:
                $result = Array(17,19,12,16);
                break;
            case 19:
                $result = Array(18,17,20,27);
                break;
            case 20:
                $result = Array(11,17,19,27,6,24,4);
                break;
            case 21:
                $result = Array(23,5,28,4);
                break;
            case 22:
                $result = Array(26,23,5,25,30);
                break;
            case 23:
                $result = Array(26,22,5,21);
                break;
            case 24:
                $result = Array(6,28,4,20);
                break;
            case 25:
                $result = Array(30,6,5,22,9,7);
                break;
            case 26:
                $result = Array(23,22,30);
                break;
            case 27:
                $result = Array(4,20,19);
                break;
            case 28:
                $result = Array(6,24,4,21,5);
                break;
            case 29:
                $result = Array(14,9,7);
                break;
            case 30:
                $result = Array(26,22,25,7);
                break;
            case 31:
                $result = Array(13,8,1,11);
                break;
            default:
                $result = [];
                break;
        }
        return $result;
    }
    // async getPoints(): Promise<any> {
    //   return await this.inpost.points.list()
    // }

    // async getPoint(id): Promise<any> {
    //   return await this.inpost.points.retrieve(id)
    // }

    // async getShipments(query?): Promise<any> {
    //   return await this.inpost.shipments.list(query)
    // }

    // async getShipment(id): Promise<any> {
    //   return await this.inpost.shipments.retrieve(id)
    // }

    // async createShipment(data): Promise<any> {
    //   return await this.inpost.shipments.create(data)
    // }

    // async updateShipment(id, data): Promise<any> {
    //   return await this.inpost.shipments.update(id, data)
    // }

    // async cancelShipment(id): Promise<any> {
    //   return await this.inpost.shipments.cancel(id)
    // }
}

export default PishtazFulfillmentService