import { registerOverriddenValidators } from "@medusajs/medusa"
import { IsString, IsOptional, IsInt, Min, IsBoolean } from "class-validator";
import { AdminPostProductCategoriesCategoryReq as MedusaAdminPostProductCategoriesCategoryReq } from "@medusajs/medusa/dist/api/routes/admin/product-categories/update-product-category";

// Product category Images Validators
class AdminPostProductCategoriesCategoryReq extends MedusaAdminPostProductCategoriesCategoryReq {
  @IsString()
  @IsOptional()
  thumbnail: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  visits: number;

  @IsBoolean()
  @IsOptional()
  featured: boolean;
}

registerOverriddenValidators(AdminPostProductCategoriesCategoryReq)
