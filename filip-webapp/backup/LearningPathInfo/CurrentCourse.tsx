import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/backup/components/ui/card";
import { Button } from "@/backup/components/ui/button";
import { Progress } from "@/backup/components/ui/progress";
import { Clock, Star, BarChart, Play } from "lucide-react";
import { Badge } from "@/backup/components/ui/badge";
import type { Key } from "react";

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

interface CurrentCourseProps {
  course: Course;
}

const getProviderLogo = (provider: string) => {
  const logos: Record<string, string> = {
    Udemy: "🎯",
    Coursera: "📚",
    Udacity: "🚀",
  };
  return logos[provider] || "📖";
};

export function CurrentCourse({ course }: CurrentCourseProps) {
  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getProviderLogo(course.platform)}</span>
          <CardTitle className="text-lg text-green-500">
            {course.platform}
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-green-600 text-white hover:text-white hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-0" /> Continue
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="items-center space-x-4 text-left">
          <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
          <CardDescription>by {course.instructor}</CardDescription>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{course.rating}</span>
            <span className="text-gray-500">
              ({course.students?.toLocaleString()} students)
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-green-500" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart className="w-4 h-4 text-blue-500" />
            <span>{course.level}</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <p>Progress</p>
          <p>{course.progress}%</p>
        </div>
        <Progress
          value={course.progress}
          className="h-2 rounded-full mb-3 bg-green-100 [&>div]:bg-green-600"
        />

        <div className="flex flex-wrap gap-4 ">
          {course.skills?.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-green-200 text-green-800 hover:bg-green-300 rounded-full"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CurrentCourseList {
  selectedSkills?: any[];
}
export function CurrentCourseList({ selectedSkills }: CurrentCourseList) {
  const activeCourses =
    selectedSkills?.flatMap(
      (skill) => skill?.courses?.filter((c: Course) => c.isActive) || []
    ) || [];

  return (
    <div className="space-y-4">
      {activeCourses.map((course: Course, index: Key | null | undefined) => (
        <CurrentCourse key={index} course={course} />
      ))}
    </div>
  );
}
