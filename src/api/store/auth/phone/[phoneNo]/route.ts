import type {
    CustomerService,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/medusa"


export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const { phoneNo } = req.params
    console.log(phoneNo)

    try {
        const customerService: CustomerService =
            req.scope.resolve("customerService")
        const customer = await customerService.retrieveByPhone(phoneNo, {
            select: ["id", "has_account", "email"],
        })
        res.status(200).json({ exists: customer.has_account, email: customer.email })
    } catch (err) {
        res.status(200).json({ exists: false })
    }
}

