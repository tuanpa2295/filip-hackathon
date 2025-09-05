export function getConfidenceBySkillName(skills: { name: string; confidence: number }[], skillName: string): number {
    const match = skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());
    return match ? match.confidence : 0;
}
