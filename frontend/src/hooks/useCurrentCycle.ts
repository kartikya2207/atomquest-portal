import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import { Cycle } from "../types";

export const useCurrentCycle = () => {
  return useQuery<Cycle>({
    queryKey: ["currentCycle"],
    queryFn: async () => {
      const response = await client.get("/cycles/active");
      return response.data;
    },
  });
};
