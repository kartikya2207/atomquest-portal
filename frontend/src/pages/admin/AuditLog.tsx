import React from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
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
import { format } from "date-fns";

const AuditLog: React.FC = () => {
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ["auditLogs"],
    queryFn: async () => (await client.get("/audit")).data,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500">Track all critical state changes across the system</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Reason/Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{log.entity_type}</TableCell>
                  <TableCell>{log.entity_id}</TableCell>
                  <TableCell>{log.changed_by_name || `User #${log.changed_by}`}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.reason || "—"}</TableCell>
                </TableRow>
              ))}
              {logs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No audit logs found.
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

export default AuditLog;
