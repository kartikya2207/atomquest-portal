import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { Cycle } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CycleManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: cycles, isLoading } = useQuery<Cycle[]>({
    queryKey: ["cycles"],
    queryFn: async () => (await client.get("/cycles")).data,
  });

  const activateMutation = useMutation({
    mutationFn: (cycle: Cycle) => 
      client.patch(`/cycles/${cycle.id}`, { ...cycle, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      queryClient.invalidateQueries({ queryKey: ["currentCycle"] });
      toast.success("Cycle activated successfully");
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cycle Management</h1>
          <p className="text-gray-500">Create and schedule performance goal cycles</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          New Cycle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cycle Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Goal Setting Window</TableHead>
                <TableHead>Q1 Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles?.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>{cycle.year}</TableCell>
                  <TableCell className="text-xs">
                    {cycle.goal_setting_open} to {cycle.goal_setting_close}
                  </TableCell>
                  <TableCell className="text-xs">
                    {/* Simplified for display */}
                    Q1 open
                  </TableCell>
                  <TableCell>
                    {cycle.is_active ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!cycle.is_active && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => activateMutation.mutate(cycle)}
                        disabled={activateMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Mark as Active
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleManagement;
