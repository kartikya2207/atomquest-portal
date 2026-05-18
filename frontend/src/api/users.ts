import client from "./client";
import { User } from "../types";

export const getTeam = async (): Promise<User[]> => {
  const response = await client.get("/users/team");
  return response.data;
};
