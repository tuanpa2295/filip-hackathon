import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/backup/components/ui/card";
import { Brain } from "lucide-react";

interface HeaderCardProps {
  name: string;
  title: string;
  streak: number;
  journeyLabel: string;
  journeyDates: string;
  onBack?: () => void;
}

const HeaderCard = ({
  name,
  title,
  streak,
  journeyLabel,
  journeyDates,
}: HeaderCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-left">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              Welcome back, <span className="font-bold">{name}</span>!
            </CardTitle>
            <CardDescription>
              {title} • <span className="font-bold">{streak}</span> day streak
              <span role="img" aria-label="fire">
                {" "}
                🔥
              </span>
            </CardDescription>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-primary">
            {journeyLabel}
          </div>
          <CardDescription>{journeyDates}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderCard;
