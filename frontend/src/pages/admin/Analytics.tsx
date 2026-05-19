import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

const Analytics: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: users } = useQuery<User[]>({
    queryKey: ["analyticsUsers", currentUser?.role],
    queryFn: async () => {
      if (currentUser?.role === "admin") {
        return (await client.get("/users")).data;
      }
      // Managers: fetch team members + include self for QoQ analysis
      const team: User[] = (await client.get("/users/team")).data;
      if (currentUser && !team.some(u => u.id === currentUser.id)) {
        return [currentUser as User, ...team];
      }
      return team;
    },
    enabled: !!currentUser,
  });

  React.useEffect(() => {
    if (users && users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id.toString());
    }
  }, [users, selectedUserId]);

  const { data: health, isLoading: isHealthLoading } = useQuery<any>({
    queryKey: ["orgHealth"],
    queryFn: async () => (await client.get("/analytics/org-health")).data,
  });

  const { data: qoqData, isLoading: isQoqLoading, isError: isQoqError } = useQuery<any>({
    queryKey: ["qoq", selectedUserId],
    queryFn: async () => (await client.get(`/analytics/qoq?user_id=${selectedUserId}`)).data,
    enabled: !!selectedUserId,
  });

  const { data: deptPerf, isLoading: isDeptLoading } = useQuery<any>({
    queryKey: ["deptPerf"],
    queryFn: async () => (await client.get("/analytics/department")).data,
  });

  const { data: thrustDist, isLoading: isThrustLoading } = useQuery<any>({
    queryKey: ["thrustDist"],
    queryFn: async () => (await client.get("/analytics/thrust-distribution")).data,
  });

  const { data: heatmap, isLoading: isHeatmapLoading } = useQuery<any>({
    queryKey: ["heatmap"],
    queryFn: async () => (await client.get("/analytics/completion-heatmap")).data,
  });

  if (isHealthLoading) return <div className="p-8">Loading organization health...</div>;

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-gray-100 text-gray-400";
    if (value < 30) return "bg-orange-100 text-orange-700";
    if (value < 70) return "bg-orange-300 text-orange-900";
    return "bg-orange-500 text-white";
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Analytics</h1>
        <p className="text-gray-500">Insights into goal setting and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Goal Setting Completion</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-4xl font-bold text-orange-600">{health?.completion_rate?.toFixed(1)}%</div>
             <p className="text-sm text-gray-500 mt-1">{health?.users_with_goals} of {health?.total_users} users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QoQ Performance */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quarter-on-Quarter Performance</CardTitle>
              <CardDescription>Average goal score across quarters</CardDescription>
            </div>
            <div className="w-64">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {isQoqLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400 italic">Loading QoQ data...</div>
            ) : isQoqError ? (
              <div className="flex items-center justify-center h-full text-red-500 italic">Error loading performance data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qoqData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, '']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ea580c"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Avg Score %"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Dept Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Average score % per department</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isDeptLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400 italic">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerf} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="dept" type="category" width={100} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, '']} />
                  <Bar dataKey="score" fill="#ea580c" radius={[0, 4, 4, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Thrust Area Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Thrust Area Focus</CardTitle>
            <CardDescription>Distribution of goals by thrust area</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isThrustLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400 italic">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={thrustDist}
                    dataKey="count"
                    nameKey="area"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    label
                  >
                    {thrustDist?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Completion Heatmap */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Completion Heatmap</CardTitle>
            <CardDescription>% of goals with achievements logged by department</CardDescription>
          </CardHeader>
          <CardContent>
            {isHeatmapLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-400 italic">Loading heatmap...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left bg-gray-50 border">Department</th>
                      <th className="p-2 text-center bg-gray-50 border">Q1</th>
                      <th className="p-2 text-center bg-gray-50 border">Q2</th>
                      <th className="p-2 text-center bg-gray-50 border">Q3</th>
                      <th className="p-2 text-center bg-gray-50 border">Q4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap?.map((row: any) => (
                      <tr key={row.dept}>
                        <td className="p-2 font-medium border">{row.dept}</td>
                        <td className={`p-2 text-center border font-bold ${getHeatmapColor(row.q1)}`}>
                          {row.q1}%
                        </td>
                        <td className={`p-2 text-center border font-bold ${getHeatmapColor(row.q2)}`}>
                          {row.q2}%
                        </td>
                        <td className={`p-2 text-center border font-bold ${getHeatmapColor(row.q3)}`}>
                          {row.q3}%
                        </td>
                        <td className={`p-2 text-center border font-bold ${getHeatmapColor(row.q4)}`}>
                          {row.q4}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex items-center justify-end space-x-4 text-xs text-gray-500">
              <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 mr-1 border"></div> 0%</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-orange-100 mr-1 border"></div> 1-30%</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-orange-300 mr-1 border"></div> 31-70%</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 mr-1 border"></div> 71-100%</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
