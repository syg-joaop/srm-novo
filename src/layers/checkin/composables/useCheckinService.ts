import type { CheckinFilters, PaginatedCheckinResponse } from "../checkin.types";
import { schemaPaginatedCheckinResponse } from "~/layers/checkin/schemas/checkin.schema";

const CHECKINS_LIST_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_CHECKIN";

export const useCheckinService = () => {
  const fetchCheckins = useOfflineAsyncData<PaginatedCheckinResponse, CheckinFilters>({
    key: "checkins",
    endpoint: CHECKINS_LIST_ENDPOINT,
    buildBody: buildPagedBody,
    homol: true,
    cacheTtl: 1 * 60 * 1000,
    schema: schemaPaginatedCheckinResponse,
  });

  return { fetchCheckins };
};
