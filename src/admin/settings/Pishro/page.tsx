import type { SettingConfig, SettingProps } from "@medusajs/admin"
import {
    Photo,
    Spinner,
    ExclamationCircle,
  } from "@medusajs/icons";
import { Container, Text } from "@medusajs/ui";
import {
  useAdminCustomQuery
} from "medusa-react";
import { useQueryClient } from "@tanstack/react-query";
import { BannersSettingsResponse } from "../../../api/admin/banners-settings/route";
import { BannerSettings } from "../../../models/banner_settings";
import { useEffect, useState } from "react";
import PishroAccForm from "../../components/pishro-acc/pishro-acc-loging-form";

function BannersSettingsEmptyState() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <p className="text-grey-40">
        Налаштування банерів не ініціалізовано. Можливо що ви не провели міграції. Зверніться до адміністратора/розробника.
      </p>
    </div>
  );
}

function BannersSettingsErrorState() {
  return (
    <Container className="flex min-h-[320px] items-center justify-center mt-8">
      <div className="flex items-center gap-x-2">
        <ExclamationCircle className="text-ui-fg-base" />
        <Text className="text-ui-fg-subtle">
        An error occurred while loading banner settings. Please reload the page and try again. If the error remains, try again later.
        </Text>
      </div>
    </Container>
  );
}

const BannersSettingPage = ({
    notify,
  }: SettingProps) => {

    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useAdminCustomQuery
    <any, BannersSettingsResponse>(
      "/banners-settings",
      ["banners-settings"],
      {}
    )

    const [banner_settings, setBannerSettings] = useState<BannerSettings|undefined|null>()
    useEffect(() => {
      if(data && data.banners_settings) {
        setBannerSettings(data.banners_settings);
      }
    }, [data])

    const submitUpdate = async () => {
      await queryClient.invalidateQueries(['banners-settings']);
    };

    const showPlaceholder = !isLoading && !banner_settings;

    if (isError || !banner_settings) {
      return <BannersSettingsErrorState />;
    }

  return (
    <Container className="flex flex-col min-h-[640px] grow h-full w-full">
        <div className="flex justify-between align-top border-grey-20 border-b pb-4">
            <div>
                <h1 className="inter-xlarge-semibold text-grey-90">
                Pishro Accounting
                </h1>
                <h3 className="inter-medium-regular text-grey-50 pt-1.5">
                Enter Pishro accounting software credentials to continue
                </h3>
            </div>
        </div>
        <Container>
        <div className="flex flex-col justify-between mt-4 h-full w-full">
          {showPlaceholder ? (
            <BannersSettingsEmptyState />
          ) : isLoading ? (
            <div className="flex h-max items-center justify-center">
              <Spinner className="text-ui-fg-subtle animate-spin" />
            </div>
          ) : (
            <PishroAccForm
            notify={notify}
            onUpdate={submitUpdate}
            />
          )}
        </div>
        </Container>
    </Container>
  )
}

export const config: SettingConfig = {
  card: {
    label: "Pishro Accounting",
    description: "Synchronize with Pishor Accounting App",
    // optional
    icon: Photo,
  },
}

export default BannersSettingPage