import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Goal, User } from "../../types";
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

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["teamGoals"],
    queryFn: async () => {
      const response = await client.get("/goals/team");
      return response.data;
    },
  });

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

  const approvedGoals = goals?.filter(g => g.status === 'approved' || g.status === 'locked') || [];
  
  // Group goals by employee
  const goalsByEmployee = approvedGoals.reduce((acc, goal) => {
    if (!acc[goal.employee_id]) acc[goal.employee_id] = [];
    acc[goal.employee_id].push(goal);
    return acc;
  }, {} as Record<number, Goal[]>);

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

      {Object.entries(goalsByEmployee).map(([employeeId, employeeGoals]) => {
        const employee = team?.find(u => u.id === parseInt(employeeId));
        return (
          <Card key={employeeId}>
            <CardHeader>
              <CardTitle>{employee?.name || "Unknown Employee"}</CardTitle>
              <CardDescription>{employee?.designation}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Actual (TBD)</TableHead>
                    <TableHead>Score (TBD)</TableHead>
                    <TableHead className="w-1/3">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell>{goal.uom_type === 'timeline' ? goal.target_date : goal.target_value}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="Add a comment..." 
                            className="h-10 min-h-[40px]"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments({ ...comments, [goal.id]: e.target.value })}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSaveCheckin(goal.id)}
                            disabled={!comments[goal.id] || checkinMutation.isPending}
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

      {approvedGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed text-gray-500">
          <MessageSquare className="w-12 h-12 mb-4" />
          <p>No approved goals yet. Approve your team's goals to start check-ins.</p>
        </div>
      )}
    </div>
  );
};

export default TeamCheckins;
