import { Button, Label, Input, Select } from "@medusajs/ui";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Notify } from "../../types/notify"
import { useAdminCreateBatchJob } from "medusa-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPostBatchesReq } from "@medusajs/medusa";

export type PishroAccFormValues = {
  type: string;
  appcode: number;
  username: string;
  password: string;
};

const PishroAccForm = ({
  notify,
  onUpdate,
}: {
  notify: Notify;
  onUpdate: () => void;
}) => {
  const { register, handleSubmit, reset, control } =
    useForm<PishroAccFormValues>();
  const items = [
    {
      label: "Update product price and quantity",
      value: "variants-update",
    },
    { label: "Export Customers", value: "customers-export" },
    { label: "Export Orders", value: "orders-export" },
  ];
  // for update after change
  const queryClient = useQueryClient();

  const { mutateAsync, mutate, isLoading } = useAdminCreateBatchJob();

  const onReset = () => {
    reset();
    onUpdate();
  };

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    setIsSaving(true);
    const payload: AdminPostBatchesReq = {
      type: data.type || "variants-update",
      context: {
        entity: {
          username: data.username,
          appcode: data.appcode,
          password: data.password,
        },
      },
      dry_run: false,
    };

    mutateAsync(payload, {
      onSuccess: async (b) => {
        console.log('asdfasd', b)
        notify.success("Успіх", `Налаштування банерів оновлено`);
      },
      onError: () => {
        notify.error(
          "Помилка",
          `Під час оновлення налаштування банерів виникла помилка`
        );
      },
    });
    setIsSaving(false);
  });

  // ...

  // const handleAction = (max: number) => {
  //   customBannerSetting.mutate({
  //     max
  //   }, {
  //     onSuccess: ({ banners_settings }) => {
  //       console.log(banners_settings)
  //     }
  //   })
  // }

  //   const { mutate } = useAdminCreateProductCategory();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2 w-[256px]">
          <Label htmlFor="max" className="text-ui-fg-subtle">
            App Code
          </Label>
          <Input
            type="text"
            defaultValue={"011931"}
            {...register("appcode", { required: true })}
          />
          <Label htmlFor="max" className="text-ui-fg-subtle">
            Username
          </Label>
          <Input
            type="text"
            defaultValue={"011931"}
            {...register("username", { required: true })}
          />{" "}
          <Label htmlFor="max" className="text-ui-fg-subtle">
            Password
          </Label>
          <Input
            type="password"
            defaultValue={"197967957424"}
            {...register("password", { required: true })}
          />
          <Label htmlFor="max" className="text-ui-fg-subtle">
            Type of job
          </Label>
          <Controller
            name="type"
            control={control}
            defaultValue="variants-update"
            rules={{ required: true }}
            render={({ field: { onChange, ...rest } }) => (
              <Select {...rest} onValueChange={onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select a job" />
                </Select.Trigger>
                <Select.Content>
                  {items.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          <div className="flex gap-2">
            <Button isLoading={isLoading || isSaving} type="submit">
              update products
            </Button>
            {/* <Button isLoading={isLoading || isSaving} variant='secondary'>export customers</Button> */}
            {/* <Button isLoading={isLoading || isSaving} variant='secondary'>export orders</Button> */}
          </div>
        </div>
      </div>
    </form>
  );
};

export default PishroAccForm;
