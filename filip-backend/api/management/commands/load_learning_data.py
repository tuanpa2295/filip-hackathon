import json
import os

from django.core.management.base import BaseCommand

from api.models import Course, CourseSkill, LearningPath, PathCourse, Skill


class Command(BaseCommand):
    help = "Load predefined learning paths, courses, and skills from JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file", type=str, required=True, help="Path to the JSON file."
        )

    def handle(self, *args, **options):
        file_path = options["file"]

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, "r") as f:
            data = json.load(f)

        for path_index, item in enumerate(data):
            path, _ = LearningPath.objects.get_or_create(
                name=item["name"],
                defaults={
                    "priority": item["priority"],
                    "current_level": item["currentLevel"],
                    "target_level": item["targetLevel"],
                    "progress": item["progress"],
                },
            )

            for position, course_data in enumerate(item["courses"]):
                course, _ = Course.objects.get_or_create(
                    id=course_data["id"],
                    defaults={
                        "title": course_data["title"],
                        "provider": course_data["provider"],
                        "instructor": course_data["instructor"],
                        "rating": course_data["rating"],
                        "students": course_data["students"],
                        "duration": course_data["duration"],
                        "price": course_data["price"],
                        "level": course_data["level"],
                        "is_active": course_data["isActive"],
                        "progress": course_data["progress"],
                    },
                )

                for skill_name in course_data["skills"]:
                    skill, _ = Skill.objects.get_or_create(name=skill_name)
                    CourseSkill.objects.get_or_create(course=course, skill=skill)

                PathCourse.objects.get_or_create(
                    path=path, course=course, position=position
                )

        self.stdout.write(self.style.SUCCESS("Learning data loaded successfully."))
