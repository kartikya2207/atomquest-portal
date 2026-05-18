import React from "react";
import client from "../../api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const Reports: React.FC = () => {
  const handleExport = async () => {
    try {
      const response = await client.get("/reports/export", {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'atomquest_master_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Export system data for external analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Master Data Export</CardTitle>
            <CardDescription>All goals, achievements, and check-ins for the current cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Summary</CardTitle>
            <CardDescription>Individual performance scores and completion status (Coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
