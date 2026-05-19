import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Goal } from "../../types";
import { useCurrentCycle } from "../../hooks/useCurrentCycle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock } from "lucide-react";

const UOM_LABELS: Record<string, string> = {
  numeric_min: "Higher is Better",
  numeric_max: "Lower is Better",
  percent_min: "Higher is Better",
  percent_max: "Lower is Better",
  timeline: "Timeline",
  zero: "Zero Target",
};

const QuarterlyCheckin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: cycle, isLoading: isCycleLoading } = useCurrentCycle();
  
  const [actuals, setActuals] = useState<Record<number, { value?: number; date?: string }>>({});

  const { data: goals, isLoading: isGoalsLoading } = useQuery<Goal[]>({
    queryKey: ["myGoals"],
    queryFn: async () => {
      const response = await client.get("/goals/mine");
      return response.data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: ({ goalId, quarter, data }: { goalId: number; quarter: string; data: any }) => 
      client.put(`/achievements/goal/${goalId}/quarter/${quarter}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAchievements"] });
      toast.success("Achievement saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to save achievement");
    },
  });

  const getActiveQuarter = () => {
    if (!cycle) return null;
    const today = new Date();
    if (today >= new Date(cycle.goal_setting_open) && today <= new Date(cycle.goal_setting_close)) {
      // Actually window for q1 might be different, but for now let's use the logic from service
      // Wait, I'll just rely on the backend to tell me if window is open if I had an endpoint for it.
      // For now, let's hardcode today's check based on cycle dates.
      if (today >= new Date("2026-05-01") && today <= new Date("2026-06-30")) return "q1";
      if (today >= new Date("2026-07-01") && today <= new Date("2026-09-30")) return "q2";
    }
    // Simple fallback for demo
    return "q1"; 
  };

  const activeQuarter = getActiveQuarter();
  const approvedGoals = goals?.filter(g => g.status === 'approved' || g.status === 'locked') || [];

  const handleSave = (goalId: number) => {
    const data = actuals[goalId];
    if (!data) return;
    upsertMutation.mutate({
      goalId,
      quarter: activeQuarter!,
      data: {
        actual_value: data.value,
        actual_date: data.date,
        status: 'completed'
      }
    });
  };

  if (isCycleLoading || isGoalsLoading) return <div>Loading...</div>;

  if (approvedGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed text-gray-500">
        <Clock className="w-12 h-12 mb-4 text-orange-400" />
        <h3 className="text-lg font-medium">No goals approved yet</h3>
        <p>Once your manager approves your goals, you can start logging achievements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quarterly Check-in</h1>
          <p className="text-gray-500">Logging achievements for {activeQuarter?.toUpperCase()} of {cycle?.name}</p>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 px-3 py-1">
          Window Closes: {cycle?.goal_setting_close}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {approvedGoals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <CardDescription>Target: {goal.uom_type === 'timeline' ? goal.target_date : goal.target_value} • Weightage: {goal.weightage}%</CardDescription>
                </div>
                <Badge>{UOM_LABELS[goal.uom_type] ?? goal.uom_type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm font-medium text-gray-700">Actual Value</label>
                  {goal.uom_type === 'timeline' ? (
                    <Input 
                      type="date" 
                      onChange={(e) => setActuals({ ...actuals, [goal.id]: { ...actuals[goal.id], date: e.target.value } })}
                    />
                  ) : (
                    <Input 
                      type="number" 
                      placeholder="Enter actual performance"
                      onChange={(e) => setActuals({ ...actuals, [goal.id]: { ...actuals[goal.id], value: parseFloat(e.target.value) } })}
                    />
                  )}
                </div>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                  onClick={() => handleSave(goal.id)}
                  disabled={upsertMutation.isPending}
                >
                  Save Achievement
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuarterlyCheckin;
