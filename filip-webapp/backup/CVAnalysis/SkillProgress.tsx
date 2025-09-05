import React from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/backup/components/ui/card";
import { Badge } from "@/backup/components/ui/badge";
import { Checkbox } from "@/backup/components/ui/checkbox";
import { Progress } from "@/backup/components/ui/progress";

interface Skill {
  name: string;
  level: "Advanced" | "Intermediate" | "Beginner";
  confidence: number;
  category: string;
}

interface SkillProgressCardProps {
  skill: Skill;
  isSelected: boolean;
  onToggle: (skillName: string) => void;
  getSkillLevelColor?: (level: string) => string;
}

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({
  skill,
  isSelected,
  onToggle,
  getSkillLevelColor,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-green-200 hover:border-green-300"
      }`}
      onClick={() => onToggle(skill.name)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(skill.name)}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <h4 className="font-medium text-gray-900">{skill.name}</h4>
          </div>
          <Badge
            variant="secondary"
            className={
              getSkillLevelColor ? getSkillLevelColor(skill.level) : ""
            }
          >
            {skill.level}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{skill.category}</span>
          <span className="font-medium">{skill.confidence}%</span>
        </div>

        <Progress
          value={skill.confidence}
          className={`h-2 ${
            isSelected ? "[&>div]:bg-green-600" : "[&>div]:bg-green-500"
          }`}
        />

        {isSelected && (
          <div className="flex items-center space-x-2 text-sm text-green-700 font-medium mt-1">
            <CheckCircle className="w-4 h-4" />
            <span>Selected for improvement</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SkillsListProps {
  skills: Skill[];
  selectedSkills: string[];
  onToggleSkill: (skillName: string) => void;
  getSkillLevelColor?: (level: string) => string;
}

export const SkillsList: React.FC<SkillsListProps> = ({
  skills,
  selectedSkills,
  onToggleSkill,
  getSkillLevelColor,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Current Skills</h3>
        <span className="text-sm text-gray-500">
          ({skills.length} detected)
        </span>
        <span className="text-xs text-blue-600 ml-2">
          ✓ Select skills to improve
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <SkillProgressCard
            key={index}
            skill={skill}
            isSelected={selectedSkills.includes(skill.name)}
            onToggle={onToggleSkill}
            getSkillLevelColor={getSkillLevelColor}
          />
        ))}
      </div>
    </div>
  );
};
