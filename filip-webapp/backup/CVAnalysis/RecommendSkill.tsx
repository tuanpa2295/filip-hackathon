import React from "react";
import { Target, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/backup/components/ui/card";
import { Badge } from "@/backup/components/ui/badge";
import { Checkbox } from "@/backup/components/ui/checkbox";
import { Progress } from "@/backup/components/ui/progress";

interface RecommendedSkill {
  skill: string;
  priority: "High" | "Medium" | "Low";
  marketDemand: number;
  salaryImpact: string;
  relevance: string;
  description: string;
}

interface RecommendedSkillCardProps {
  skill: RecommendedSkill;
  isSelected: boolean;
  onToggle: (skillName: string) => void;
  getPriorityColor?: (priority: string) => string;
}

export const RecommendedSkillCard: React.FC<RecommendedSkillCardProps> = ({
  skill,
  isSelected,
  onToggle,
  getPriorityColor,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-red-500 bg-red-50 shadow-md"
          : "border-red-200 hover:border-red-300"
      }`}
      onClick={() => onToggle(skill.skill)}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(skill.skill)}
              className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
            />
            <h4 className="font-semibold text-gray-900 text-lg">
              {skill.skill}
            </h4>
          </div>
          <Badge
            variant="secondary"
            className={getPriorityColor ? getPriorityColor(skill.priority) : ""}
          >
            {skill.priority} Priority
          </Badge>
        </div>

        {isSelected && (
          <div className="mb-4 p-2 bg-red-100 rounded-md border border-red-200">
            <div className="text-sm text-red-800 font-medium">
              ✓ Added to your learning path
            </div>
          </div>
        )}

        {/* Target Relevance */}
        <div className="mb-4 p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Target Role Relevance
            </span>
          </div>
          <p className="text-sm text-left text-blue-700 font-medium">
            {skill.relevance}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-left text-gray-600 mb-4 leading-relaxed">
          {skill.description}
        </p>

        {/* Market Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Market Demand</div>
              <div className="font-semibold text-blue-600">
                {skill.marketDemand}%
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Salary Impact</div>
              <div className="font-semibold text-green-600">
                {skill.salaryImpact}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <Progress
          value={skill.marketDemand}
          className={`h-2 ${
            isSelected ? "[&>div]:bg-red-600" : "[&>div]:bg-red-500"
          }`}
        />
      </CardContent>
    </Card>
  );
};

interface RecommendedSkillsListProps {
  skills: RecommendedSkill[];
  selectedSkills: string[];
  onToggleSkill: (skillName: string) => void;
  getPriorityColor?: (priority: string) => string;
}

export const RecommendedSkillsList: React.FC<RecommendedSkillsListProps> = ({
  skills,
  selectedSkills,
  onToggleSkill,
  getPriorityColor,
}) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <Target className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Recommended Skills to Learn
        </h3>
        <span className="text-sm text-gray-500">
          High-impact opportunities for your target role
        </span>
        <span className="text-xs text-blue-600 ml-2">
          ✓ Select skills to learn
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, index) => (
          <RecommendedSkillCard
            key={index}
            skill={skill}
            isSelected={selectedSkills.includes(skill.skill)}
            onToggle={onToggleSkill}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  );
};
