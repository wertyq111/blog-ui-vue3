import request from "@/utils/request";
import type { DashboardOverviewData } from "@/types/api/dashboard-stats";

const BASE_URL = "/dashboard";

const DashboardStatsAPI = {
  getOverview(): Promise<DashboardOverviewData> {
    return request<any, DashboardOverviewData>({
      url: `${BASE_URL}/stats`,
      method: "get",
      params: { view: "overview", range: "all" },
    });
  },
};

export default DashboardStatsAPI;
