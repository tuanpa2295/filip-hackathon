import json
import os

from django.core.management.base import BaseCommand, CommandError

from api.models import Skill


class Command(BaseCommand):
    help = "Load skills from a JSON file and bulk create Skill entries (no embedding)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            required=True,
            help="Path to the JSON file containing a list of skill names.",
        )

    def handle(self, *args, **options):
        file_path = options["file"]

        if not os.path.exists(file_path):
            raise CommandError(f"File does not exist: {file_path}")

        try:
            with open(file_path, "r") as f:
                data = json.load(f)
        except Exception as e:
            raise CommandError(f"Failed to read JSON file: {e}")

        if not isinstance(data, list) or not all(isinstance(s, str) for s in data):
            raise CommandError(
                "JSON file must contain a list of strings (skill names)."
            )

        skill_names = [name.strip() for name in data if name.strip()]
        existing = set(
            Skill.objects.filter(name__in=skill_names).values_list("name", flat=True)
        )
        new_skills = [Skill(name=name) for name in skill_names if name not in existing]

        Skill.objects.bulk_create(new_skills, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f"Created {len(new_skills)} new skills."))
