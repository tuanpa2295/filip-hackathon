from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from api.views import (
    LearningPathAnalysisView,
    LearningPathViewSet,
    SkillAnalysisView,
    recommendations,
    validation_metrics,
)

router = DefaultRouter()
router.register(r"learning-paths", LearningPathViewSet, basename="learning-paths")

urlpatterns = [
    path("", include(router.urls)),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema")),
    path(
        "learning-paths/recommendations",
        recommendations.recommend_courses,
        name="learning_paths_recommendations",
    ),
    path(
        "learning-paths/analytics",
        LearningPathAnalysisView.as_view(),
        name="learning_paths_analytics",
    ),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("skill-analysis/", SkillAnalysisView.as_view(), name="skill-analysis"),
    
    # Validation endpoints
    path(
        "validation/metrics",
        validation_metrics.get_validation_metrics,
        name="validation_metrics",
    ),
    path(
        "validation/health",
        validation_metrics.validation_health_check,
        name="validation_health",
    ),
    path(
        "validation/test",
        validation_metrics.test_validation,
        name="validation_test",
    ),
]
