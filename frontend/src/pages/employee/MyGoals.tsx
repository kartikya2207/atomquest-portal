import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Goal, ThrustArea } from "../../types";
import { useCurrentCycle } from "../../hooks/useCurrentCycle";
import GoalForm, { GoalFormValues } from "../../components/goals/GoalForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const MyGoals: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { data: cycle, isLoading: isCycleLoading } = useCurrentCycle();
  
  const { data: goals, isLoading: isGoalsLoading } = useQuery<Goal[]>({
    queryKey: ["myGoals"],
    queryFn: async () => {
      const response = await client.get("/goals/mine");
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

  const createMutation = useMutation({
    mutationFn: (newGoal: any) => client.post("/goals", newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGoals"] });
      toast.success("Goal created successfully");
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create goal");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => client.patch(`/goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGoals"] });
      toast.success("Goal updated successfully");
      setEditingGoal(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update goal");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGoals"] });
      toast.success("Goal deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete goal");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => client.post("/goals/submit"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGoals"] });
      toast.success("Goals submitted for approval");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to submit goals");
    },
  });

  const totalWeightage = goals?.filter(g => g.status === 'draft' || g.status === 'returned').reduce((sum, goal) => sum + goal.weightage, 0) || 0;
  const isSubmitEnabled = totalWeightage === 100 && (goals?.length || 0) <= 8 && (goals?.length || 0) > 0;

  const handleAddGoal = (values: GoalFormValues) => {
    if (!cycle) return;
    createMutation.mutate({ ...values, cycle_id: cycle.id });
  };

  const handleUpdateGoal = (values: GoalFormValues) => {
    if (!editingGoal) return;
    updateMutation.mutate({ id: editingGoal.id, data: values });
  };

  if (isCycleLoading || isGoalsLoading) {
    return <div>Loading...</div>;
  }

  if (!cycle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No active cycle</h3>
        <p className="text-gray-500">Contact your administrator to start a goal cycle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-500">{cycle.name} Cycle</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Define a new goal for the current cycle.
              </DialogDescription>
            </DialogHeader>
            <GoalForm 
              onSubmit={handleAddGoal} 
              thrustAreas={thrustAreas || []} 
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Goals</CardTitle>
            <CardDescription className="text-2xl font-bold text-gray-900">{goals?.length || 0} / 8</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Weightage</CardTitle>
            <CardDescription className={`text-2xl font-bold ${totalWeightage === 100 ? "text-green-600" : "text-orange-600"}`}>
              {totalWeightage}% / 100%
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">Status</CardTitle>
            <CardDescription className="text-2xl font-bold text-gray-900">
              {goals?.every(g => g.status === 'draft') ? 'Drafting' : 'Mixed'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Goal Title</TableHead>
                <TableHead>Thrust Area</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Weightage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals?.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium">{goal.title}</TableCell>
                  <TableCell>{thrustAreas?.find(ta => ta.id === goal.thrust_area_id)?.name}</TableCell>
                  <TableCell className="capitalize">{goal.uom_type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {goal.uom_type === 'timeline' ? goal.target_date : goal.target_value}
                  </TableCell>
                  <TableCell>{goal.weightage}%</TableCell>
                  <TableCell>
                    <Badge variant={
                      goal.status === 'draft' ? 'secondary' :
                      goal.status === 'submitted' ? 'default' :
                      goal.status === 'approved' || goal.status === 'locked' ? 'outline' : 'destructive'
                    }>
                      {goal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {goal.status === 'draft' && (
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingGoal(goal)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => deleteMutation.mutate(goal.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {goals?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No goals created yet. Click "Add Goal" to start.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => submitMutation.mutate()} 
          disabled={!isSubmitEnabled || submitMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit for Approval"}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details.
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <GoalForm 
              onSubmit={handleUpdateGoal} 
              thrustAreas={thrustAreas || []} 
              initialValues={{
                title: editingGoal.title,
                description: editingGoal.description,
                uom_type: editingGoal.uom_type,
                target_value: editingGoal.target_value,
                target_date: editingGoal.target_date,
                weightage: editingGoal.weightage,
                thrust_area_id: editingGoal.thrust_area_id,
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyGoals;
