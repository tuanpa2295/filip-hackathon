import { Card, CardContent, CardHeader, CardTitle } from "@/backup/components/ui/card";
import { Button } from "@/backup/components/ui/button";
import { Progress } from "@/backup/components/ui/progress";
import { Clock, Star, BarChart, Play, ExternalLink } from "lucide-react";
import { Badge } from "@/backup/components/ui/badge";

// This needs refining to match the actual course data structure
interface Course {
  platform: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  progress?: number;
  coverUrl?: string;
  rating?: number;
  students?: number;
  skills?: string[];
  isActive?: boolean;
}

interface Skill {
  name: string;
  priority: string;
  currentLevel: string;
  targetLevel: string;
  progress: number;
  courses: Course[];
}

interface SkillCardProps {
  skill: Skill;
}

// Mini Course Item Component - compact horizontal layout
function MiniCourseItem({ course }: { course: Course }) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-yellow-600";
      case "advanced":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
          <span className="text-sm font-medium truncate">{course.title}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
          <span>{course.platform}</span>
          <span>•</span>
          <span className={getLevelColor(course.level)}>{course.level}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {course.progress !== undefined && course.progress > 0 && (
          <span className="text-xs text-muted-foreground">
            {course.progress}% complete
          </span>
        )}
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function SkillCard({ skill }: SkillCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-1 h-8 rounded-full ${getPriorityColor(
                skill.priority
              )}`}
            ></div>
            <div>
              <CardTitle className="text-base font-semibold">
                {skill.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  Target: {skill.targetLevel}
                </span>
                <span className="text-xs text-muted-foreground">
                  Current: {skill.currentLevel}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{skill.progress}%</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>

        <div className="mt-3">
          <Progress value={skill.progress} className="h-2 bg-gray-200" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {skill.courses.map((course, index) => (
          <MiniCourseItem key={index} course={course} />
        ))}
      </CardContent>
    </Card>
  );
}

// Skill List Component
interface SkillListProps {
  selectedSkills: Skill[];
}

export function SkillList({ selectedSkills }: SkillListProps) {
  return (
    <div className="space-y-4">
      {selectedSkills.map((skill, index) => (
        <SkillCard key={index} skill={skill} />
      ))}
    </div>
  );
}
