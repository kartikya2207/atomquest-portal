import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { User } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const TeamCheckins: React.FC = () => {
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Record<number, string>>({});

  const { data: team } = useQuery<User[]>({
    queryKey: ["team"],
    queryFn: async () => {
      const response = await client.get("/users/team");
      return response.data;
    },
  });

  const { data: checkinData, isLoading } = useQuery<any[]>({
    queryKey: ["teamCheckins"],
    queryFn: async () => {
      const response = await client.get("/checkins/team");
      return response.data;
    },
  });

  React.useEffect(() => {
    if (checkinData) {
      const initialComments: Record<number, string> = {};
      checkinData.forEach((item) => {
        if (item.comment) {
          initialComments[item.goal_id] = item.comment;
        }
      });
      setComments(initialComments);
    }
  }, [checkinData]);

  // Simple logic to get current quarter for demo
  const activeQuarter = "q1";

  const checkinMutation = useMutation({
    mutationFn: ({ goalId, quarter, comment }: { goalId: number; quarter: string; comment: string }) => 
      client.put(`/checkins/goal/${goalId}/quarter/${quarter}`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamCheckins"] });
      toast.success("Check-in comment saved");
    },
  });

  if (isLoading) return <div>Loading...</div>;

  // Group goals by employee
  const goalsByEmployee: Record<number, any[]> = checkinData?.reduce((acc, item) => {
    if (!acc[item.employee_id]) acc[item.employee_id] = [];
    acc[item.employee_id].push(item);
    return acc;
  }, {} as Record<number, any[]>) || {};

  const handleSaveCheckin = (goalId: number) => {
    const comment = comments[goalId];
    if (!comment) return;
    checkinMutation.mutate({ goalId, quarter: activeQuarter, comment });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Check-ins</h1>
        <p className="text-gray-500">Monitor performance and provide feedback for {activeQuarter.toUpperCase()}</p>
      </div>

      {Object.entries(goalsByEmployee).map(([employeeId, employeeGoals]: [string, any[]]) => {
        const employee = team?.find(u => u.id === parseInt(employeeId));
        return (
          <Card key={employeeId}>
            <CardHeader>
              <CardTitle>{employee?.name || employeeGoals[0].employee_name}</CardTitle>
              <CardDescription>{employee?.designation}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="w-1/3">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeGoals.map((goal: any) => (
                    <TableRow key={goal.goal_id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell>{goal.uom_type === 'timeline' ? goal.target_date : goal.target_value}</TableCell>
                      <TableCell>{goal.actual_value !== null ? goal.actual_value : "—"}</TableCell>
                      <TableCell>{goal.score_percent !== null ? `${parseFloat(goal.score_percent).toFixed(1)}%` : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="Add a comment..." 
                            className="h-10 min-h-[40px]"
                            value={comments[goal.goal_id] || ""}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments({ ...comments, [goal.goal_id]: e.target.value })}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSaveCheckin(goal.goal_id)}
                            disabled={!comments[goal.goal_id] || checkinMutation.isPending}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {checkinData?.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed text-gray-500">
          <MessageSquare className="w-12 h-12 mb-4" />
          <p>No approved goals yet. Approve your team's goals to start check-ins.</p>
        </div>
      )}
    </div>
  );
};

export default TeamCheckins;
