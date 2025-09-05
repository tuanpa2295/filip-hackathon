import React from "react";
import { BookOpen, GraduationCap, Calendar, FileBadge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/backup/components/ui/card";
import { Badge } from "@/backup/components/ui/badge";

interface EducationItem {
  degree: string;
  institution: string;
  year: number;
  type?: "degree" | "certification";
}

interface EducationTimelineProps {
  education: EducationItem[];
}

const EducationTimeline: React.FC<EducationTimelineProps> = ({ education }) => {
  // Sort education by year (most recent first)
  const sortedEducation = [...education].sort((a, b) => b.year - a.year);

  const getEducationIcon = (item: EducationItem) => {
    if (
      item.type === "certification" ||
      item.degree.toLowerCase().includes("certified")
    ) {
      return <FileBadge className="w-4 h-4 text-yellow-600" />;
    }
    return <GraduationCap className="w-4 h-4 text-green-600" />;
  };

  const getEducationColor = (item: EducationItem) => {
    if (
      item.type === "certification" ||
      item.degree.toLowerCase().includes("certified")
    ) {
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        line: "bg-yellow-300",
        dot: "bg-yellow-500",
      };
    }
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      line: "bg-green-300",
      dot: "bg-green-500",
    };
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-900">Education</span>
          <Badge variant="secondary" className="ml-2">
            {education.length} items
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <div className="space-y-6">
            {sortedEducation.map((edu, index) => {
              const colors = getEducationColor(edu);
              const isLast = index === sortedEducation.length - 1;

              return (
                <div
                  key={index}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 w-12 h-12 ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center shadow-sm`}
                  >
                    {getEducationIcon(edu)}
                  </div>

                  {/* Vertical line */}
                  {!isLast && (
                    <div
                      className={`absolute left-6 top-12 bottom-0 w-0.5 ${colors.line} origin-top`}
                      style={{ transform: "scaleY(1.5)" }}
                    ></div>
                  )}

                  {/* Content card */}
                  <div
                    className={`flex-1 text-left ${colors.bg} ${colors.border} border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm leading-relaxed">
                          {edu.degree}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {edu.institution}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            edu.type === "certification" ||
                            edu.degree.toLowerCase().includes("certified")
                              ? "border-yellow-300 text-yellow-700"
                              : "border-green-300 text-green-700"
                          }`}
                        >
                          {edu.year}
                        </Badge>
                      </div>
                    </div>

                    {/* Education type indicator */}
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          edu.type === "certification" ||
                          edu.degree.toLowerCase().includes("certified")
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {edu.type === "certification" ||
                        edu.degree.toLowerCase().includes("certified")
                          ? "Certification"
                          : "Degree"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline end indicator */}
          <div className="relative flex items-center justify-center mt-4">
            <div className="w-6 h-6 bg-gray-200 border-2 border-gray-300 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationTimeline;
