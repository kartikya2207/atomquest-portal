import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Goal, User, ThrustArea } from "../../types";
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
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Approvals: React.FC = () => {
  const queryClient = useQueryClient();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

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

  const { data: thrustAreas } = useQuery<ThrustArea[]>({
    queryKey: ["thrustAreas"],
    queryFn: async () => {
      const response = await client.get("/thrust-areas");
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => client.post(`/goals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamGoals"] });
      toast.success("Goal approved");
    },
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) => 
      client.post(`/goals/${id}/return`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamGoals"] });
      toast.success("Goals returned for rework");
      setReturnDialogOpen(false);
      setReturnComment("");
    },
  });

  const submittedGoals = goals?.filter(g => g.status === 'submitted') || [];
  
  // Group goals by employee
  const goalsByEmployee = submittedGoals.reduce((acc, goal) => {
    if (!acc[goal.employee_id]) acc[goal.employee_id] = [];
    acc[goal.employee_id].push(goal);
    return acc;
  }, {} as Record<number, Goal[]>);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-500">Review and approve your team's goal submissions</p>
      </div>

      {Object.entries(goalsByEmployee).map(([employeeId, employeeGoals]) => {
        const employee = team?.find(u => u.id === parseInt(employeeId));
        return (
          <Card key={employeeId}>
            <CardHeader>
              <CardTitle>{employee?.name || "Unknown Employee"}</CardTitle>
              <CardDescription>{employee?.designation} • {employee?.department}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal Title</TableHead>
                    <TableHead>Thrust Area</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Weightage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell>{thrustAreas?.find(ta => ta.id === goal.thrust_area_id)?.name}</TableCell>
                      <TableCell>
                        {goal.uom_type === 'timeline' ? goal.target_date : goal.target_value}
                      </TableCell>
                      <TableCell>{goal.weightage}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => approveMutation.mutate(goal.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setSelectedGoalId(employeeGoals[0].id);
                    setReturnDialogOpen(true);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Return Entire Sheet
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {submittedGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed text-gray-500">
          <Check className="w-12 h-12 text-green-400 mb-4" />
          <p>All submissions reviewed! No pending approvals.</p>
        </div>
      )}

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for Rework</DialogTitle>
            <DialogDescription>
              Provide a comment explaining why the goals are being returned.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="e.g. Please revise your targets for Q3..." 
            value={returnComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReturnComment(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedGoalId && returnMutation.mutate({ id: selectedGoalId, comment: returnComment })}
              disabled={!returnComment}
            >
              Return Goals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
