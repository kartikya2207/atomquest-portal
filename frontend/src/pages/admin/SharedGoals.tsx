import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import client from "../../api/client";
import { User, ThrustArea, UoMType } from "../../types";
import { useCurrentCycle } from "../../hooks/useCurrentCycle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const SharedGoals: React.FC = () => {
  const { data: cycle } = useCurrentCycle();
  const { data: thrustAreas } = useQuery<ThrustArea[]>({
    queryKey: ["thrustAreas"],
    queryFn: async () => (await client.get("/thrust-areas")).data,
  });
  const { data: users } = useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: async () => (await client.get("/users/team")).data, // For demo, using team users. In real admin it would be all users.
  });

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [primaryOwner, setPrimaryOwner] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thrust_area_id: 0,
    uom_type: "numeric_min" as UoMType,
    target_value: 0,
    target_date: "",
    weightage: 10,
  });

  const pushMutation = useMutation({
    mutationFn: (data: any) => client.post("/goals/shared", data),
    onSuccess: () => {
      toast.success("Shared goals pushed successfully");
      setSelectedUsers([]);
      setPrimaryOwner(null);
      setFormData({
        title: "",
        description: "",
        thrust_area_id: 0,
        uom_type: "numeric_min",
        target_value: 0,
        target_date: "",
        weightage: 10,
      });
    },
  });

  const handlePush = () => {
    if (selectedUsers.length === 0 || !primaryOwner || !formData.title || !formData.thrust_area_id) {
      toast.error("Please fill all required fields and select recipients");
      return;
    }
    pushMutation.mutate({
      ...formData,
      cycle_id: cycle?.id,
      recipient_user_ids: selectedUsers,
      primary_owner_id: primaryOwner,
    });
  };

  const toggleUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      if (primaryOwner === userId) setPrimaryOwner(null);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Push Shared Goals</h1>
        <p className="text-gray-500">Deploy common goals to multiple employees at once</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={formData.title} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Org-wide Revenue Target"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thrust Area</label>
                <Select onValueChange={val => setFormData({...formData, thrust_area_id: parseInt(val)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {thrustAreas?.map(ta => <SelectItem key={ta.id} value={ta.id.toString()}>{ta.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">UoM</label>
                <Select onValueChange={val => setFormData({...formData, uom_type: val as UoMType})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric_min">Numeric Min</SelectItem>
                    <SelectItem value="numeric_max">Numeric Max</SelectItem>
                    <SelectItem value="percent_min">Percent Min</SelectItem>
                    <SelectItem value="percent_max">Percent Max</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="zero">Zero-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Value</label>
                <Input type="number" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, target_value: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weightage (%)</label>
                <Input type="number" value={formData.weightage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, weightage: parseInt(e.target.value)})} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>Select users and pick one primary owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-md p-2">
              {users?.map(user => (
                <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                  <Checkbox 
                    checked={selectedUsers.includes(user.id)} 
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.designation}</p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Button 
                      variant={primaryOwner === user.id ? "default" : "outline"} 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setPrimaryOwner(user.id)}
                    >
                      {primaryOwner === user.id ? "Primary" : "Set Primary"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700" 
              disabled={pushMutation.isPending}
              onClick={handlePush}
            >
              <Send className="w-4 h-4 mr-2" />
              Push Shared Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedGoals;
