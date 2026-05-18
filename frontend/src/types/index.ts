export type UserRole = "employee" | "manager" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  designation: string;
  manager_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type UoMType = "numeric_min" | "numeric_max" | "percent_min" | "percent_max" | "timeline" | "zero";
export type GoalStatus = "draft" | "submitted" | "approved" | "locked" | "returned";

export interface Goal {
  id: number;
  employee_id: number;
  cycle_id: number;
  thrust_area_id: number;
  title: string;
  description?: string;
  uom_type: UoMType;
  target_value?: number;
  target_date?: string;
  weightage: number;
  status: GoalStatus;
  is_shared: boolean;
  shared_parent_id?: number;
  is_shared_primary: boolean;
  approved_by?: number;
  approved_at?: string;
  returned_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Cycle {
  id: number;
  name: string;
  year: number;
  is_active: boolean;
  goal_setting_open: string;
  goal_setting_close: string;
}

export interface ThrustArea {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export type Quarter = "q1" | "q2" | "q3" | "q4";
export type AchievementStatus = "not_started" | "on_track" | "completed";

export interface Achievement {
  id: number;
  goal_id: number;
  quarter: Quarter;
  actual_value?: number;
  actual_date?: string;
  status: AchievementStatus;
  score_percent: number;
}
