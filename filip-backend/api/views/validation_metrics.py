"""
Validation Metrics and Health Check API

Provides API endpoints for monitoring validation system performance,
health checks, and testing validation functionality.
"""

import logging
from typing import Dict, Any
import time

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from filip import settings

# Import validation system
try:
    from api.ai.response_validation import ResponseValidator
    from api.ai.validation_config import (
        ValidationConfigManager, ValidationMode, validation_metrics,
        get_validation_config_for_request
    )
    from api.ai.agent_rag_course import get_validated_recommendations_for_skills
    from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
    from langchain_postgres.vectorstores import PGVector
    VALIDATION_AVAILABLE = True
except ImportError as e:
    VALIDATION_AVAILABLE = False

logger = logging.getLogger(__name__)


@extend_schema(
    summary="Get validation system metrics",
    description="Returns comprehensive metrics about validation system performance",
    responses={
        200: {
            "type": "object",
            "properties": {
                "validation_metrics": {
                    "type": "object",
                    "properties": {
                        "total_validations": {"type": "integer"},
                        "success_rate": {"type": "number"},
                        "average_score": {"type": "number"},
                        "average_duration": {"type": "number"},
                        "regeneration_rate": {"type": "number"}
                    }
                },
                "system_info": {
                    "type": "object",
                    "properties": {
                        "validation_available": {"type": "boolean"},
                        "supported_modes": {"type": "array", "items": {"type": "string"}},
                        "default_mode": {"type": "string"}
                    }
                }
            }
        }
    }
)
@api_view(["GET"])
def get_validation_metrics(request):
    """Get validation system metrics and information"""
    try:
        if not VALIDATION_AVAILABLE:
            return Response({
                "validation_metrics": {
                    "total_validations": 0,
                    "success_rate": 0.0,
                    "average_score": 0.0,
                    "average_duration": 0.0,
                    "regeneration_rate": 0.0
                },
                "system_info": {
                    "validation_available": False,
                    "supported_modes": [],
                    "default_mode": "disabled",
                    "error": "Validation system not available"
                }
            }, status=status.HTTP_200_OK)
        
        # Get metrics from validation system
        metrics_summary = validation_metrics.get_metrics_summary()
        
        # Get system information
        system_info = {
            "validation_available": True,
            "supported_modes": [mode.value for mode in ValidationMode],
            "default_mode": ValidationConfigManager.get_default_config().mode.value,
            "azure_openai_configured": _check_azure_config(),
            "vector_store_configured": _check_vector_store_config()
        }
        
        return Response({
            "validation_metrics": metrics_summary,
            "system_info": system_info
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Failed to get validation metrics: {str(e)}")
        return Response({
            "error": f"Failed to retrieve metrics: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    summary="Validation system health check",
    description="Performs comprehensive health check of all validation components",
    responses={
        200: {
            "type": "object",
            "properties": {
                "overall_status": {"type": "string", "enum": ["healthy", "degraded", "unhealthy"]},
                "components": {
                    "type": "object",
                    "properties": {
                        "configuration": {"type": "object"},
                        "metrics": {"type": "object"},
                        "validation_core": {"type": "object"},
                        "azure_openai": {"type": "object"},
                        "vector_store": {"type": "object"}
                    }
                },
                "timestamp": {"type": "number"}
            }
        }
    }
)
@api_view(["POST"])
def validation_health_check(request):
    """Perform comprehensive health check of validation system"""
    try:
        health_results = {}
        overall_healthy = True
        
        # Check if validation system is available
        if not VALIDATION_AVAILABLE:
            return Response({
                "overall_status": "unhealthy",
                "components": {
                    "validation_system": {
                        "status": "unhealthy",
                        "error": "Validation system not available"
                    }
                },
                "timestamp": time.time()
            }, status=status.HTTP_200_OK)
        
        # Check configuration
        try:
            config = ValidationConfigManager.get_default_config()
            health_results["configuration"] = {
                "status": "healthy",
                "mode": config.mode.value,
                "validation_score_threshold": config.min_validation_score
            }
        except Exception as e:
            health_results["configuration"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            overall_healthy = False
        
        # Check metrics system
        try:
            metrics_summary = validation_metrics.get_metrics_summary()
            health_results["metrics"] = {
                "status": "healthy",
                "total_validations": metrics_summary["total_validations"],
                "success_rate": metrics_summary["success_rate"]
            }
        except Exception as e:
            health_results["metrics"] = {
                "status": "degraded",
                "error": str(e)
            }
        
        # Check Azure OpenAI connectivity
        azure_status = _check_azure_openai_health()
        health_results["azure_openai"] = azure_status
        if azure_status["status"] != "healthy":
            overall_healthy = False
        
        # Check vector store connectivity
        vector_status = _check_vector_store_health()
        health_results["vector_store"] = vector_status
        if vector_status["status"] != "healthy":
            overall_healthy = False
        
        # Check validation core functionality
        try:
            validation_status = _test_validation_core()
            health_results["validation_core"] = validation_status
            if validation_status["status"] != "healthy":
                overall_healthy = False
        except Exception as e:
            health_results["validation_core"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            overall_healthy = False
        
        # Determine overall status
        if overall_healthy:
            overall_status = "healthy"
        elif any(comp.get("status") == "healthy" for comp in health_results.values()):
            overall_status = "degraded"
        else:
            overall_status = "unhealthy"
        
        return Response({
            "overall_status": overall_status,
            "components": health_results,
            "timestamp": time.time()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return Response({
            "overall_status": "unhealthy",
            "components": {
                "system": {
                    "status": "unhealthy",
                    "error": f"Health check failed: {str(e)}"
                }
            },
            "timestamp": time.time()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    summary="Test validation system",
    description="Test the validation system with custom input",
    request={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Test query"},
            "response": {"type": "string", "description": "Test response"},
            "domain": {"type": "string", "default": "courses"},
            "validation_mode": {"type": "string", "default": "comprehensive"}
        },
        "required": ["query", "response"]
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "test_metadata": {"type": "object"},
                "validation_result": {"type": "object"}
            }
        }
    }
)
@api_view(["POST"])
def test_validation(request):
    """Test validation system with custom input"""
    try:
        if not VALIDATION_AVAILABLE:
            return Response({
                "error": "Validation system not available"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Extract test parameters
        query = request.data.get("query")
        response = request.data.get("response")
        domain = request.data.get("domain", "courses")
        validation_mode = request.data.get("validation_mode", "comprehensive")
        
        if not query or not response:
            return Response({
                "error": "Both 'query' and 'response' are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        start_time = time.time()
        
        # Get validation configuration
        config = ValidationConfigManager.get_config(ValidationMode(validation_mode.lower()))
        
        # Initialize validation components
        embeddings = AzureOpenAIEmbeddings(
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        )
        
        llm = AzureChatOpenAI(
            model=settings.AZURE_OPENAI_CHAT_MODEL,
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
            temperature=0,
        )
        
        vectorstore = PGVector.from_existing_index(
            embedding=embeddings,
            connection=settings.PGVECTOR_CONNECTION,
            collection_name="course",
        )
        
        # Create validator and run test
        validator = ResponseValidator(embeddings, llm, vectorstore)
        
        # Run validation asynchronously
        import asyncio
        validation_result = asyncio.run(
            validator.validate_response(
                query=query,
                response=response,
                domain=domain,
                weights=config.get_weights()
            )
        )
        
        duration = time.time() - start_time
        
        # Prepare test metadata
        test_metadata = {
            "query": query,
            "response_preview": response[:100] + "..." if len(response) > 100 else response,
            "domain": domain,
            "validation_mode": validation_mode,
            "duration_seconds": duration,
            "config_used": config.mode.value
        }
        
        return Response({
            "test_metadata": test_metadata,
            "validation_result": validation_result
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({
            "error": f"Invalid validation mode: {validation_mode}"
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Validation test failed: {str(e)}")
        return Response({
            "error": f"Validation test failed: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _check_azure_config() -> bool:
    """Check if Azure OpenAI is properly configured"""
    required_settings = [
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_CHAT_API_KEY',
        'AZURE_OPENAI_EMBEDDING_API_KEY',
        'AZURE_OPENAI_CHAT_MODEL',
        'AZURE_OPENAI_EMBEDDING_MODEL'
    ]
    
    return all(hasattr(settings, setting) and getattr(settings, setting) for setting in required_settings)


def _check_vector_store_config() -> bool:
    """Check if vector store is properly configured"""
    return hasattr(settings, 'PGVECTOR_CONNECTION') and settings.PGVECTOR_CONNECTION


def _check_azure_openai_health() -> Dict[str, Any]:
    """Check Azure OpenAI connectivity and health"""
    try:
        if not _check_azure_config():
            return {
                "status": "unhealthy",
                "error": "Azure OpenAI not properly configured"
            }
        
        # Test embeddings
        embeddings = AzureOpenAIEmbeddings(
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        )
        
        # Test with simple query
        test_embedding = embeddings.embed_query("test")
        if not test_embedding or len(test_embedding) == 0:
            return {
                "status": "unhealthy",
                "error": "Embeddings API not responding correctly"
            }
        
        # Test LLM
        llm = AzureChatOpenAI(
            model=settings.AZURE_OPENAI_CHAT_MODEL,
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
            temperature=0,
        )
        
        test_response = llm.invoke("Say 'OK' if you can respond")
        if not test_response or not test_response.content:
            return {
                "status": "unhealthy",
                "error": "Chat API not responding correctly"
            }
        
        return {
            "status": "healthy",
            "embeddings_model": settings.AZURE_OPENAI_EMBEDDING_MODEL,
            "chat_model": settings.AZURE_OPENAI_CHAT_MODEL,
            "embedding_dimension": len(test_embedding)
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": f"Azure OpenAI connectivity failed: {str(e)}"
        }


def _check_vector_store_health() -> Dict[str, Any]:
    """Check vector store connectivity and health"""
    try:
        if not _check_vector_store_config():
            return {
                "status": "unhealthy",
                "error": "Vector store not properly configured"
            }
        
        embeddings = AzureOpenAIEmbeddings(
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        )
        
        vectorstore = PGVector.from_existing_index(
            embedding=embeddings,
            connection=settings.PGVECTOR_CONNECTION,
            collection_name="course",
        )
        
        # Test search
        test_results = vectorstore.similarity_search("test query", k=1)
        
        return {
            "status": "healthy",
            "collection_name": "course",
            "test_results_count": len(test_results)
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": f"Vector store connectivity failed: {str(e)}"
        }


def _test_validation_core() -> Dict[str, Any]:
    """Test core validation functionality"""
    try:
        # Test with simple validation
        test_query = "I want to learn Python programming"
        test_response = "Here are some Python courses for beginners"
        
        embeddings = AzureOpenAIEmbeddings(
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        )
        
        llm = AzureChatOpenAI(
            model=settings.AZURE_OPENAI_CHAT_MODEL,
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
            temperature=0,
        )
        
        vectorstore = PGVector.from_existing_index(
            embedding=embeddings,
            connection=settings.PGVECTOR_CONNECTION,
            collection_name="course",
        )
        
        validator = ResponseValidator(embeddings, llm, vectorstore)
        
        # Run quick validation test
        import asyncio
        validation_result = asyncio.run(
            validator.validate_response(
                query=test_query,
                response=test_response,
                domain="courses"
            )
        )
        
        if "overall_score" in validation_result:
            return {
                "status": "healthy",
                "test_score": validation_result["overall_score"],
                "test_valid": validation_result.get("is_valid", False)
            }
        else:
            return {
                "status": "degraded",
                "error": "Validation completed but returned unexpected format"
            }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": f"Validation core test failed: {str(e)}"
        }
