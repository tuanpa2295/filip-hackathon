// import { Card, CardContent } from "@/backup/components/ui/card";
// import type { LucideIcon } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Flame, Clock, BookOpen, Target } from "lucide-react";

// interface MetricCardProps {
//   icon: LucideIcon;
//   iconBg: string;
//   value: string | number;
//   label: string;
// }

// export function MetricCard({
//   icon: Icon,
//   iconBg,
//   value,
//   label,
// }: MetricCardProps) {
//   return (
//     <Card>
//       <CardContent>
//         <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
//           <div
//             className={cn(
//               "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center",
//               iconBg
//             )}
//           >
//             <Icon className="w-4 h-4 md:w-5 md:h-5 text-current" />
//           </div>
//           <div className="text-center md:text-left">
//             <div className="text-xl md:text-2xl font-bold text-gray-900">
//               {value}
//             </div>
//             <div className="text-xs md:text-sm text-gray-600">{label}</div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// interface StatsOverviewProps {
//   streak: number;
//   hours: number;
//   coursesCompleted: number;
//   skillsLearning: number;
// }

// export function StatsOverview({
//   streak,
//   hours,
//   coursesCompleted,
//   skillsLearning,
// }: StatsOverviewProps) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-4 md:gap-4 gap-2 mb-6">
//       <MetricCard
//         icon={Flame}
//         iconBg="bg-blue-100 text-blue-600"
//         value={streak}
//         label="Day Streak"
//       />
//       <MetricCard
//         icon={Clock}
//         iconBg="bg-green-100 text-green-600"
//         value={`${hours}h`}
//         label="Hours Completed"
//       />
//       <MetricCard
//         icon={BookOpen}
//         iconBg="bg-purple-100 text-purple-600"
//         value={coursesCompleted}
//         label="Courses Completed"
//       />
//       <MetricCard
//         icon={Target}
//         iconBg="bg-orange-100 text-orange-600"
//         value={skillsLearning}
//         label="Skills Learning"
//       />
//     </div>
//   );
// }
