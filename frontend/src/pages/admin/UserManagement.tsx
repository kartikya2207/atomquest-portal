import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { User } from "../../types";
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
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatError } from "@/lib/utils";

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: async () => (await client.get("/users")).data,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return client.post("/users/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("Users imported successfully");
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast.error(formatError(error.response?.data?.detail || "Failed to import users"));
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage portal users and hierarchy</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="outline" disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Importing..." : "Import Users"}
            </Button>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept=".csv,.xlsx" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Manager ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.designation}</TableCell>
                  <TableCell>{user.manager_id || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
