import { Button } from "@/backup/components/ui/button";
import { Card, CardContent, CardTitle } from "@/backup/components/ui/card";
import { Brain, Upload } from "lucide-react";

interface HeaderCardProps {
  fileName: string;
  targetRole: string;
  timeline: string;
  overallScore: number;
  onUploadNew: () => void;
  onDownloadReport: () => void;
}

const HeaderCard = ({
  fileName,
  targetRole,
  timeline,
  overallScore,
  onUploadNew,
  onDownloadReport,
}: HeaderCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <Card className="mb-6">
      <CardContent className="flex justify-between items-center space-x-4">
        <div className="flex items-center flex-1 space-x-4 text-left">
          <div className="bg-blue-600 rounded-xl flex items-center justify-center p-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl ">CV Analysis Complete</CardTitle>

            <p className="text-sm text-muted-foreground">
              File: <span className="font-medium">{fileName}</span>
            </p>
            <p className="text-sm text-blue-600">
              Target: I want to become a{" "}
              <span className="font-medium">{targetRole} |</span> Timeline:{" "}
              <span className="font-medium">{timeline}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-12">
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
            >
              {overallScore}%
            </div>
            <p className="text-sm font-semibold text-gray-600">Skills Match</p>
          </div>
          <Button
            variant="outline"
            className="h-16 text-gray-800 text-base font-medium flex flex-col items-center justify-center"
            onClick={onUploadNew}
          >
            <Upload className="h-4 w-4" />
            Upload New CV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderCard;
