import type { WidgetConfig } from "@medusajs/admin";
import { Button, Container, Text } from "@medusajs/ui";
import { useAdminCustomPost, useAdminCreateBatchJob, useAdminBatchJobs } from "medusa-react";

const ProductWidget = () => {
  // const { mutateAsync } = useAdminCustomPost("/import/woo", [
  //   "products",
  //   "categories",
  // ]);

  const createBatchJob = useAdminCreateBatchJob();
  // ...

  const handleCreateBatchJob = () => {
    createBatchJob.mutate(
      {
        type: "product-import",
        context: {
          url: process.env.WOO_URL,
          consumerKey: process.env.WOO_CONSUMER_KEY,
          consumerSecret: process.env.WOO_CONSUMER_SECRET
        },
        dry_run: false,
      },
      {
        onSuccess: ({ batch_job }) => {
          console.log(batch_job);
        },
      }
    );
  };

  const handleCreateCatBatchJob = () => {
    createBatchJob.mutate(
      {
        type: "category-import",
        context: {
          url: process.env.WOO_URL,
          consumerKey: process.env.WOO_CONSUMER_KEY,
          consumerSecret: process.env.WOO_CONSUMER_SECRET
        },
        dry_run: false,
      },
      {
        onSuccess: ({ batch_job }) => {
          console.log(batch_job);
        },
      }
    );
  };

  const handleUpdateCatBatchJob = () => {
    createBatchJob.mutate(
      {
        type: "category-update",
        context: {
          url: process.env.WOO_URL,
          consumerKey: process.env.WOO_CONSUMER_KEY,
          consumerSecret: process.env.WOO_CONSUMER_SECRET
        },
        dry_run: false,
      },
      {
        onSuccess: ({ batch_job }) => {
          console.log(batch_job);
        },
      }
    );
  };
  return (
    <Container className="text-ui-fg-subtle px-0 pt-0 pb-4">
      <div className="flex justify-end gap-2 mt-6">
        <Text className="mb-2">Import Products from Woocommerce</Text>

        <Button variant="secondary" size="base" onClick={() => handleCreateBatchJob()}>
          Import From Woocommerce
        </Button>
        <Button variant="secondary" size="base" onClick={() => handleCreateCatBatchJob()}>
          Import Category
        </Button>
        <Button variant="secondary" size="base" onClick={() => handleUpdateCatBatchJob()}>
          update Category
        </Button>
      </div>
    </Container>
  );
};

export const config: WidgetConfig = {
  zone: "product.list.before",
};

export default ProductWidget;
