from .cv_parser import CVExtractionResult


def fetch_skills_from_akajob() -> CVExtractionResult:
    return {
        "education": [
            {
                "degree": "Bachelor of Engineering(CSE)",
                "institution": "FPP University",
                "year": 2023,
            }
        ],
        "experience": {
            "total_years": 2,
            "current_role": "Junior Nodejs Developer",
            "industry": "IT",
            "companies": ["FPT Software"],
        },
        "extracted_skills": [
            {
                "name": "JavaScript",
                "level": "intermediate",
                "confidence": 85,
                "category": "Web",
            },
            {
                "name": "Node.js",
                "level": "intermediate",
                "confidence": 80,
                "category": "Runtime",
            },
            {
                "name": "Express.js",
                "level": "intermediate",
                "confidence": 75,
                "category": "Framework",
            },
            {
                "name": "HTML5",
                "level": "intermediate",
                "confidence": 80,
                "category": "Web",
            },
            {
                "name": "CSS3",
                "level": "intermediate",
                "confidence": 75,
                "category": "Web",
            },
            {
                "name": "MongoDB",
                "level": "beginner",
                "confidence": 70,
                "category": "Database",
            },
            {
                "name": "Git",
                "level": "intermediate",
                "confidence": 80,
                "category": "DevOps",
            },
            {
                "name": "REST API Design",
                "level": "intermediate",
                "confidence": 75,
                "category": "Architecture",
            },
            {
                "name": "npm",
                "level": "intermediate",
                "confidence": 80,
                "category": "Tooling",
            },
            {
                "name": "Unit Testing (Jest)",
                "level": "beginner",
                "confidence": 60,
                "category": "Testing",
            },
        ],
        "llm_usage": {
            "extract_data_from_cv": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "cost": 0,
            },
        },
    }
