from django.contrib import admin

from api.models import (
    Course,
    CourseSkill,
    JobPost,
    LearningPath,
    LearningPathCourse,
    Skill,
)


# Skill Admin
@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


# Course Admin
class CourseSkillInline(admin.TabularInline):
    model = CourseSkill
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "instructors",
        "rating",
        "level",
    )
    list_filter = ("level",)
    search_fields = ("title", "instructors")
    inlines = [CourseSkillInline]


# JobPost Admin
@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ("id", "job_title", "category", "created_at")
    list_filter = ("category",)
    search_fields = ("job_title", "job_description", "skills")
    readonly_fields = ("embedding",)


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "start_date", "end_date", "status")
    search_fields = ("name",)
    list_filter = ("status", "target_level")


@admin.register(LearningPathCourse)
class LearningPathCourseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "learningpath",
        "course_title",
        "course_instructor",
        "course_rating",
        "course_status",
    )
    search_fields = ("course_title", "course_instructor")
    list_filter = ("course_status",)
    raw_id_fields = ("learningpath",)
