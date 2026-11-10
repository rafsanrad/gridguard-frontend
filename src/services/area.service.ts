import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/services/customer.service";

export interface Zone {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export interface Substation {
  id: string;
  name: string;
  code: string;
  zoneId: string;
  zone: Zone;
}

export interface Feeder {
  id: string;
  name: string;
  code: string;
  voltageLevel: string | null;
  isActive: boolean;
  substationId: string;
  substation: Substation;
}

export interface Area {
  id: string;
  name: string;
  code: string;
  address: string | null;
  description: string | null;
  isActive: boolean;
  feederId: string;
  feeder: Feeder;
}

export interface LoadSheddingSchedule {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  status: string;
  reason: string | null;
  feederId: string;
  feeder: Feeder;
}

export interface ScheduleQueryParams {
  feederId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const areaService = {
  getAreaById: (id: string) =>
    apiClient<{
      success: boolean;
      message: string;
      data: Area;
    }>(`/areas/${id}`),

  getSchedules: async (params: ScheduleQueryParams) => {
    const query = new URLSearchParams();

    query.set("feederId", params.feederId);
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 10));
    query.set("sortBy", params.sortBy ?? "startDateTime");
    query.set("sortOrder", params.sortOrder ?? "asc");

    const response = await apiClient<{
      success: boolean;
      message: string;
      data: PaginatedResponse<LoadSheddingSchedule>;
    }>(`/load-shedding?${query.toString()}`);

    return response.data;
  },
};
