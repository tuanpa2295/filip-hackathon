import React from "react";
import { Award, Briefcase, Building, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/backup/components/ui/card";
import { Badge } from "@/backup/components/ui/badge";

interface ExperienceData {
  totalYears: number;
  currentRole: string;
  industry: string;
  companies: string[];
}

interface ExperienceSummaryCardProps {
  experience: ExperienceData;
}

const ExperienceSummaryCard: React.FC<ExperienceSummaryCardProps> = ({
  experience,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-gray-900">Experience</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-left">
        {/* Total Experience */}
        <div className="flex items-start p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-3">
            <span className="text-sm text-gray-600">Total Experience</span>
            <div className="text-xl font-bold text-purple-600">
              {experience.totalYears} years
            </div>
          </div>
        </div>

        {/* Current Role */}
        <div className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <span className="text-sm text-gray-600 block mb-1">
              Current Role
            </span>
            <span className="font-semibold text-gray-900 text-sm leading-relaxed">
              {experience.currentRole}
            </span>
          </div>
        </div>

        {/* Industry */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-sm text-gray-600">Industry</span>
              <div className="font-semibold text-gray-900">
                {experience.industry}
              </div>
            </div>
          </div>
        </div>

        {/* Companies */}
        <div className="text-sm text-gray-600">Previous Companies</div>
        {experience.companies && experience.companies.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {experience.companies.map((company, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {company}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceSummaryCard;
