import request from "@/utils/request";
import type { DashboardOverviewData } from "@/types/api/dashboard-stats";

const BASE_URL = "/dashboard";

const DashboardStatsAPI = {
  getStats(view = "overview", range = "all"): Promise<DashboardOverviewData> {
    return request<any, DashboardOverviewData>({
      url: `${BASE_URL}/stats`,
      method: "get",
      params: { view, range },
    });
  },
};

export default DashboardStatsAPI;
