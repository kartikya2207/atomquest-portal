import React from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { ThrustArea } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

const ThrustAreas: React.FC = () => {
  const { data: thrustAreas, isLoading, isError } = useQuery<ThrustArea[]>({
    queryKey: ["thrustAreas"],
    queryFn: async () => (await client.get("/thrust-areas")).data,
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-500">Failed to load thrust areas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thrust Areas</h1>
        <p className="text-gray-500">Strategic pillars for goal alignment</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {thrustAreas?.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell className="text-gray-600">{area.description}</TableCell>
                  <TableCell>
                    <Badge variant={area.is_active ? "default" : "secondary"}>
                      {area.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {thrustAreas?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No thrust areas found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThrustAreas;
