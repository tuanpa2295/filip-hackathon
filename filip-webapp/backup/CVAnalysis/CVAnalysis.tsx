import { useState } from "react";
import { Button } from "@/backup/components/ui/button";
import HeaderCard from "./HeaderCard";

import { Brain, Zap, FileUser } from "lucide-react";
import { SkillsList } from "./SkillProgress";
import { RecommendedSkillsList } from "./RecommendSkill";
import ExperienceSummaryCard from "./ExperienceCard";
import EducationTimeline from "./EducationTimeline";
import LearningPathReviewModal from "@/backup/components/layout/LearningPathReviewModal";

interface CVAnalysisCompleteProps {
  fileData?: {
    file: File | null;
    targetRole: string;
    timeline: string;
  };
  onBack: () => void;
  onCreatePath: (currentSkills: string[], newSkills: string[]) => void;
}

// Main Component using the new components
const CVAnalysisComplete: React.FC<CVAnalysisCompleteProps> = ({
  fileData,
  onBack,
  onCreatePath,
}) => {
  const [selectedCurrentSkills, setSelectedCurrentSkills] = useState<any>([]);
  const [selectedRecommendedSkills, setSelectedRecommendedSkills] =
    useState<any>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Advanced":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Beginner":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const handleCreateLearningPath = () => {
    // Create learning path with selected skills
    console.log("Creating learning path with:", {
      currentSkills: selectedCurrentSkills,
      newSkills: selectedRecommendedSkills,
    });

    // Close modal if open
    setIsReviewModalOpen(false);

    // Navigate to dashboard with the selected skills
    onCreatePath(selectedCurrentSkills, selectedRecommendedSkills);
  };

  // Mock data
  const uploadedFileName = fileData?.file?.name || "John_Doe_CV.pdf";
  const targetRole =
    fileData?.targetRole ||
    "Senior Full Stack Developer specializing in React and Node.js, with expertise in cloud architecture and team leadership responsibilities";
  const timeline = fileData?.timeline || "6-months";

  const analysisResults = {
    extractedSkills: [
      {
        name: "JavaScript",
        level: "Advanced" as "Advanced",
        confidence: 92,
        category: "Programming",
      },
      {
        name: "React",
        level: "Intermediate" as "Intermediate",
        confidence: 87,
        category: "Frontend",
      },
      {
        name: "Python",
        level: "Intermediate" as "Intermediate",
        confidence: 85,
        category: "Programming",
      },
      {
        name: "Machine Learning",
        level: "Beginner" as "Beginner",
        confidence: 78,
        category: "AI/ML",
      },
      {
        name: "SQL",
        level: "Advanced" as "Advanced",
        confidence: 91,
        category: "Database",
      },
      {
        name: "Docker",
        level: "Beginner" as "Beginner",
        confidence: 82,
        category: "DevOps",
      },
    ],
    skillsGap: [
      {
        skill: "Kubernetes",
        priority: "High" as "High",
        marketDemand: 95,
        salaryImpact: "+15%",
        relevance: "Critical for Senior Full Stack Developer roles",
        description:
          "Container orchestration is essential for modern cloud deployments and DevOps practices",
      },
      {
        skill: "TensorFlow",
        priority: "Medium" as "Medium",
        marketDemand: 88,
        salaryImpact: "+12%",
        relevance: "Emerging requirement for AI-enhanced applications",
        description:
          "Machine learning integration becoming standard in full-stack development",
      },
      {
        skill: "GraphQL",
        priority: "Medium" as "Medium",
        marketDemand: 76,
        salaryImpact: "+8%",
        relevance: "Modern API development standard",
        description:
          "Replaces REST APIs in many enterprise applications, improves data fetching efficiency",
      },
      {
        skill: "Cloud Architecture",
        priority: "High" as "High",
        marketDemand: 93,
        salaryImpact: "+18%",
        relevance: "Essential for senior-level system design",
        description:
          "Required for scalable application design and infrastructure planning",
      },
    ],
    experience: {
      totalYears: 5,
      currentRole: "Full Stack Developer",
      industry: "Technology",
      companies: ["TechCorp", "StartupXYZ", "InnovateCo"],
    },
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "Tech University",
        year: 2019,
        type: "degree" as "degree",
      },
      {
        degree: "AWS Certified Developer",
        institution: "Amazon Web Services",
        year: 2023,
        type: "certification" as "certification",
      },
      {
        degree: "Google Cloud Professional",
        institution: "Google Cloud",
        year: 2022,
        type: "certification" as "certification",
      },
      {
        degree: "Master of Science in Software Engineering",
        institution: "Advanced Tech Institute",
        year: 2021,
        type: "degree" as "degree",
      },
    ],
    overallScore: 78,
  };

  // Might chang this later to use a more complex state management solution
  const handleCurrentSkillSelect = (skillName: string) => {
    setSelectedCurrentSkills((prev: string[]) =>
      prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName]
    );
  };

  const handleRecommendedSkillSelect = (skillName: string) => {
    setSelectedRecommendedSkills((prev: string[]) =>
      prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName]
    );
  };

  return (
    <div className="min-h-screen rounded-2xl bg-gray-50">
      <div className="w-full space-y-6 p-4 md:p-6">
        {/* Header Section */}
        <HeaderCard
          fileName={uploadedFileName}
          targetRole={targetRole}
          timeline={timeline}
          overallScore={analysisResults.overallScore}
          onUploadNew={() => console.log("Upload new CV")}
          onDownloadReport={() => console.log("Download report")}
        />

        {/* Main Content Tabs */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Combined Skills Analysis */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Skills Analysis</h2>
                <span className="text-sm text-gray-500">
                  Current skills and growth opportunities
                </span>
              </div>

              {/* Current Skills Section */}
              <div className="mb-6">
                <SkillsList
                  skills={analysisResults.extractedSkills}
                  selectedSkills={selectedCurrentSkills}
                  onToggleSkill={handleCurrentSkillSelect}
                  getSkillLevelColor={getSkillLevelColor}
                />
                <RecommendedSkillsList
                  skills={analysisResults.skillsGap}
                  selectedSkills={selectedRecommendedSkills}
                  onToggleSkill={handleRecommendedSkillSelect}
                  getPriorityColor={getPriorityColor}
                />
              </div>
            </div>
            {/* Profile Summary */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileUser className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Profile Summary</h2>
              </div>
              <div className="space-y-6">
                <ExperienceSummaryCard
                  experience={analysisResults.experience}
                />
                <EducationTimeline education={analysisResults.education} />
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path Summary */}
        {(selectedCurrentSkills.length > 0 ||
          selectedRecommendedSkills.length > 0) && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>
                Review Selected Skills (
                {selectedCurrentSkills.length +
                  selectedRecommendedSkills.length}
                )
              </span>
            </Button>
          </div>
        )}

        <LearningPathReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onCreatePath={handleCreateLearningPath}
          selectedCurrentSkills={selectedCurrentSkills}
          selectedRecommendedSkills={selectedRecommendedSkills}
          extractedSkills={analysisResults.extractedSkills}
          skillsGap={analysisResults.skillsGap}
          getSkillLevelColor={getSkillLevelColor}
          getPriorityColor={getPriorityColor}
        />
      </div>
    </div>
  );
};

export default CVAnalysisComplete;
