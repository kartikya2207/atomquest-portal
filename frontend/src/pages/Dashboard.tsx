import React from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, TrendingUp, AlertCircle, Calendar, Users, ClipboardList } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: summary, isLoading } = useQuery<any>({
    queryKey: ["dashboardSummary"],
    queryFn: async () => (await client.get("/dashboard/summary")).data,
  });

  if (isLoading) return <div>Loading...</div>;

  if (user?.role === "admin") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-500">Organization overview for {summary?.active_cycle_name || "the current cycle"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-orange-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              <Users className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.total_users}</div>
              <p className="text-xs text-gray-500 mt-1">Registered in the system</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Goals</CardTitle>
              <Target className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.total_goals}</div>
              <p className="text-xs text-gray-500 mt-1">Across all employees</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg Org Score</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.avg_org_score?.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Average across all achievements</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Approvals</CardTitle>
              <ClipboardList className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.pending_approvals}</div>
              <p className="text-xs text-gray-500 mt-1">Goals awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Goal Setting Period</span>
                <span className="text-sm font-medium">May 1 - Jun 15</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Q1 Achievement Log</span>
                <span className="text-sm font-medium">May 1 - Jun 30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Q1 Manager Review</span>
                <span className="text-sm font-medium">Jun 1 - Jul 10</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.role === "manager") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-500">Team overview for {summary?.active_cycle_name || "the current cycle"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-orange-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Team Members</CardTitle>
              <Users className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.team_members}</div>
              <p className="text-xs text-gray-500 mt-1">Direct reports</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Goals Pending Approval</CardTitle>
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.pending_approvals}</div>
              <p className="text-xs text-gray-500 mt-1">Submitted by your team</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Team Avg Score</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.avg_team_score?.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Q1 average across team</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Goal Setting Period</span>
                <span className="text-sm font-medium">May 1 - Jun 15</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Q1 Achievement Log</span>
                <span className="text-sm font-medium">May 1 - Jun 30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Q1 Manager Review</span>
                <span className="text-sm font-medium">Jun 1 - Jul 10</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Employee view
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500">Here's an overview of your performance goals for {summary?.active_cycle_name || "the current cycle"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-orange-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Weightage</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.total_weightage}%</div>
            <p className="text-xs text-gray-500 mt-1">Must be 100% to submit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Goals</CardTitle>
            <Target className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.goal_count}</div>
            <p className="text-xs text-gray-500 mt-1">Max 8 goals allowed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Q1 Avg Score</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.avg_score_q1?.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Current quarter progress</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sheet Status</CardTitle>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <Badge className="text-lg px-3 py-0.5 capitalize">
                {summary?.status_counts && Object.keys(summary.status_counts).length > 0
                  ? Object.keys(summary.status_counts)[0]
                  : "Not Started"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates on your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                <div className="flex-1">Goal sheet created for FY 2026-27</div>
                <div className="text-gray-400">May 16, 2026</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-600">Goal Setting Period</span>
              <span className="text-sm font-medium">May 1 - Jun 15</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-600">Q1 Achievement Log</span>
              <span className="text-sm font-medium">May 1 - Jun 30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Q1 Manager Review</span>
              <span className="text-sm font-medium">Jun 1 - Jul 10</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
