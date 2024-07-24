import type { 
    MedusaRequest, 
    MedusaResponse,
  } from "@medusajs/medusa"
import { Provinces } from "../../../../models/provinces"
  import { EntityManager } from "typeorm"
  
  export const GET = async (
    req: MedusaRequest, 
    res: MedusaResponse
  ) => {
    const id = +req.params.id
    const manager: EntityManager = req.scope.resolve("manager")
    const provincesRepo = manager.getRepository(Provinces)
  
    return res.json({
        provinces: await provincesRepo.find({
            where: { id },
            relations: { cities: true }
        }),
    })
  }