"""
Validation Configuration Management System

Provides centralized configuration management for the LLM validation system
with support for different validation modes, custom configurations, and
environment-based settings.
"""

import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import time
import threading

logger = logging.getLogger(__name__)


class ValidationMode(Enum):
    """Predefined validation modes with different configurations"""
    BASIC = "basic"
    COMPREHENSIVE = "comprehensive"
    STRICT = "strict"
    DISABLED = "disabled"


@dataclass
class ValidationConfig:
    """Configuration for validation system"""
    # Validation mode
    mode: ValidationMode = ValidationMode.COMPREHENSIVE
    
    # Validator weights
    semantic_weight: float = 0.25
    contextual_weight: float = 0.30
    domain_weight: float = 0.20
    quality_weight: float = 0.25
    
    # Score thresholds
    semantic_threshold_high: float = 0.85
    semantic_threshold_medium: float = 0.70
    semantic_threshold_low: float = 0.55
    
    contextual_threshold_high: float = 0.85
    contextual_threshold_medium: float = 0.70
    contextual_threshold_low: float = 0.60
    
    domain_threshold_high: float = 0.80
    domain_threshold_medium: float = 0.65
    domain_threshold_low: float = 0.50
    
    quality_threshold_high: float = 0.85
    quality_threshold_medium: float = 0.70
    quality_threshold_low: float = 0.55
    
    # Overall validation thresholds
    min_validation_score: float = 0.60
    regeneration_threshold: float = 0.50
    
    # Regeneration settings
    max_regeneration_attempts: int = 2
    enable_regeneration: bool = True
    
    # Performance settings
    enable_async_validation: bool = True
    validation_timeout_seconds: int = 30
    enable_parallel_validation: bool = True
    
    # Logging settings
    log_validation_results: bool = True
    log_validation_details: bool = False
    log_performance_metrics: bool = True
    
    # Caching settings
    enable_validation_caching: bool = True
    cache_ttl_seconds: int = 3600  # 1 hour
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return asdict(self)
    
    def get_weights(self) -> Dict[str, float]:
        """Get validator weights as dictionary"""
        return {
            "semantic": self.semantic_weight,
            "contextual": self.contextual_weight,
            "domain": self.domain_weight,
            "quality": self.quality_weight
        }


class ValidationConfigManager:
    """Manages validation configurations and provides factory methods"""
    
    _configs = {}
    _default_config = None
    _lock = threading.Lock()
    
    @classmethod
    def get_config(cls, mode: ValidationMode) -> ValidationConfig:
        """Get configuration for specified validation mode"""
        with cls._lock:
            if mode not in cls._configs:
                cls._configs[mode] = cls._create_config_for_mode(mode)
            return cls._configs[mode]
    
    @classmethod
    def get_default_config(cls) -> ValidationConfig:
        """Get default configuration"""
        if cls._default_config is None:
            cls._default_config = cls.get_config(ValidationMode.COMPREHENSIVE)
        return cls._default_config
    
    @classmethod
    def set_default_mode(cls, mode: ValidationMode):
        """Set default validation mode"""
        cls._default_config = cls.get_config(mode)
    
    @classmethod
    def create_custom_config(cls, **kwargs) -> ValidationConfig:
        """Create custom configuration with overrides"""
        base_config = cls.get_default_config()
        config_dict = base_config.to_dict()
        config_dict.update(kwargs)
        
        # Create new config with updated values
        return ValidationConfig(**config_dict)
    
    @classmethod
    def _create_config_for_mode(cls, mode: ValidationMode) -> ValidationConfig:
        """Create configuration for specific mode"""
        if mode == ValidationMode.BASIC:
            return ValidationConfig(
                mode=mode,
                # Lower thresholds for faster validation
                semantic_threshold_high=0.75,
                semantic_threshold_medium=0.60,
                semantic_threshold_low=0.45,
                contextual_threshold_high=0.75,
                contextual_threshold_medium=0.60,
                contextual_threshold_low=0.50,
                domain_threshold_high=0.70,
                domain_threshold_medium=0.55,
                domain_threshold_low=0.40,
                quality_threshold_high=0.75,
                quality_threshold_medium=0.60,
                quality_threshold_low=0.45,
                # Lower overall threshold
                min_validation_score=0.50,
                regeneration_threshold=0.40,
                # Reduced regeneration
                max_regeneration_attempts=1,
                # Simplified logging
                log_validation_details=False,
                # Shorter timeout
                validation_timeout_seconds=15
            )
        
        elif mode == ValidationMode.COMPREHENSIVE:
            return ValidationConfig(
                mode=mode,
                # Balanced thresholds
                semantic_threshold_high=0.85,
                semantic_threshold_medium=0.70,
                semantic_threshold_low=0.55,
                contextual_threshold_high=0.85,
                contextual_threshold_medium=0.70,
                contextual_threshold_low=0.60,
                domain_threshold_high=0.80,
                domain_threshold_medium=0.65,
                domain_threshold_low=0.50,
                quality_threshold_high=0.85,
                quality_threshold_medium=0.70,
                quality_threshold_low=0.55,
                # Standard thresholds
                min_validation_score=0.60,
                regeneration_threshold=0.50,
                # Standard regeneration
                max_regeneration_attempts=2,
                # Detailed logging
                log_validation_details=True,
                # Standard timeout
                validation_timeout_seconds=30
            )
        
        elif mode == ValidationMode.STRICT:
            return ValidationConfig(
                mode=mode,
                # Higher thresholds for maximum quality
                semantic_threshold_high=0.90,
                semantic_threshold_medium=0.80,
                semantic_threshold_low=0.70,
                contextual_threshold_high=0.90,
                contextual_threshold_medium=0.80,
                contextual_threshold_low=0.70,
                domain_threshold_high=0.85,
                domain_threshold_medium=0.75,
                domain_threshold_low=0.65,
                quality_threshold_high=0.90,
                quality_threshold_medium=0.80,
                quality_threshold_low=0.70,
                # Higher overall threshold
                min_validation_score=0.75,
                regeneration_threshold=0.65,
                # More regeneration attempts
                max_regeneration_attempts=3,
                # Maximum logging
                log_validation_details=True,
                log_performance_metrics=True,
                # Longer timeout for thorough validation
                validation_timeout_seconds=60
            )
        
        elif mode == ValidationMode.DISABLED:
            return ValidationConfig(
                mode=mode,
                # Minimal thresholds (validation always passes)
                semantic_threshold_high=0.01,
                semantic_threshold_medium=0.01,
                semantic_threshold_low=0.01,
                contextual_threshold_high=0.01,
                contextual_threshold_medium=0.01,
                contextual_threshold_low=0.01,
                domain_threshold_high=0.01,
                domain_threshold_medium=0.01,
                domain_threshold_low=0.01,
                quality_threshold_high=0.01,
                quality_threshold_medium=0.01,
                quality_threshold_low=0.01,
                # Minimal overall threshold
                min_validation_score=0.01,
                regeneration_threshold=0.01,
                # No regeneration
                max_regeneration_attempts=0,
                enable_regeneration=False,
                # Minimal logging
                log_validation_results=False,
                log_validation_details=False,
                log_performance_metrics=False,
                # No caching needed
                enable_validation_caching=False,
                # Quick timeout
                validation_timeout_seconds=5
            )
        
        else:
            # Default to comprehensive
            return cls._create_config_for_mode(ValidationMode.COMPREHENSIVE)


class ValidationMetrics:
    """Collects and manages validation metrics"""
    
    def __init__(self):
        self._metrics = {
            "total_validations": 0,
            "successful_validations": 0,
            "failed_validations": 0,
            "total_score": 0.0,
            "total_duration": 0.0,
            "regenerations": 0,
            "validator_performances": {
                "semantic": {"count": 0, "total_score": 0.0, "total_duration": 0.0},
                "contextual": {"count": 0, "total_score": 0.0, "total_duration": 0.0},
                "domain": {"count": 0, "total_score": 0.0, "total_duration": 0.0},
                "quality": {"count": 0, "total_score": 0.0, "total_duration": 0.0}
            },
            "recent_errors": []
        }
        self._lock = threading.Lock()
    
    def record_validation(self, validation_result: Dict[str, Any]):
        """Record validation result metrics"""
        with self._lock:
            self._metrics["total_validations"] += 1
            
            if validation_result.get("is_valid", False):
                self._metrics["successful_validations"] += 1
            else:
                self._metrics["failed_validations"] += 1
            
            # Record scores and duration
            score = validation_result.get("overall_score", 0.0)
            self._metrics["total_score"] += score
            
            metadata = validation_result.get("validation_metadata", {})
            duration = metadata.get("duration_seconds", 0.0)
            self._metrics["total_duration"] += duration
            
            # Record individual validator performances
            individual_results = validation_result.get("individual_results", {})
            for validator_name, result in individual_results.items():
                if validator_name in self._metrics["validator_performances"]:
                    perf = self._metrics["validator_performances"][validator_name]
                    perf["count"] += 1
                    perf["total_score"] += result.get("score", 0.0)
                    perf["total_duration"] += result.get("metadata", {}).get("duration_seconds", 0.0)
            
            # Record errors
            if "error" in metadata:
                self._add_recent_error(metadata["error"])
    
    def record_regeneration(self):
        """Record a regeneration event"""
        with self._lock:
            self._metrics["regenerations"] += 1
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get summary of validation metrics"""
        with self._lock:
            total = self._metrics["total_validations"]
            if total == 0:
                return {
                    "total_validations": 0,
                    "success_rate": 0.0,
                    "average_score": 0.0,
                    "average_duration": 0.0,
                    "regeneration_rate": 0.0,
                    "validator_performances": {},
                    "recent_errors": []
                }
            
            # Calculate averages
            success_rate = self._metrics["successful_validations"] / total
            average_score = self._metrics["total_score"] / total
            average_duration = self._metrics["total_duration"] / total
            regeneration_rate = self._metrics["regenerations"] / total
            
            # Calculate validator performances
            validator_perfs = {}
            for name, perf in self._metrics["validator_performances"].items():
                if perf["count"] > 0:
                    validator_perfs[name] = {
                        "average_score": perf["total_score"] / perf["count"],
                        "average_duration": perf["total_duration"] / perf["count"],
                        "validation_count": perf["count"]
                    }
                else:
                    validator_perfs[name] = {
                        "average_score": 0.0,
                        "average_duration": 0.0,
                        "validation_count": 0
                    }
            
            return {
                "total_validations": total,
                "success_rate": success_rate,
                "average_score": average_score,
                "average_duration": average_duration,
                "regeneration_rate": regeneration_rate,
                "validator_performances": validator_perfs,
                "recent_errors": self._metrics["recent_errors"][-10:]  # Last 10 errors
            }
    
    def _add_recent_error(self, error: str):
        """Add error to recent errors list"""
        self._metrics["recent_errors"].append({
            "error": error,
            "timestamp": time.time()
        })
        # Keep only last 50 errors
        if len(self._metrics["recent_errors"]) > 50:
            self._metrics["recent_errors"] = self._metrics["recent_errors"][-50:]
    
    def reset_metrics(self):
        """Reset all metrics"""
        with self._lock:
            self._metrics = {
                "total_validations": 0,
                "successful_validations": 0,
                "failed_validations": 0,
                "total_score": 0.0,
                "total_duration": 0.0,
                "regenerations": 0,
                "validator_performances": {
                    "semantic": {"count": 0, "total_score": 0.0, "total_duration": 0.0},
                    "contextual": {"count": 0, "total_score": 0.0, "total_duration": 0.0},
                    "domain": {"count": 0, "total_score": 0.0, "total_duration": 0.0},
                    "quality": {"count": 0, "total_score": 0.0, "total_duration": 0.0}
                },
                "recent_errors": []
            }


# Global metrics instance
validation_metrics = ValidationMetrics()


def get_validation_mode(request_data: Dict[str, Any]) -> ValidationMode:
    """Get validation mode from request data"""
    mode_str = request_data.get("validation_mode", "comprehensive").lower()
    
    try:
        return ValidationMode(mode_str)
    except ValueError:
        logger.warning(f"Unknown validation mode: {mode_str}, using comprehensive")
        return ValidationMode.COMPREHENSIVE


def should_use_validation(request_data: Dict[str, Any]) -> bool:
    """Determine if validation should be used based on request"""
    # Check explicit flag
    use_validation = request_data.get("use_validation")
    if use_validation is not None:
        return bool(use_validation)
    
    # Check validation mode
    mode = get_validation_mode(request_data)
    return mode != ValidationMode.DISABLED


def get_validation_config_for_request(request_data: Dict[str, Any]) -> ValidationConfig:
    """Get appropriate validation configuration for request"""
    mode = get_validation_mode(request_data)
    config = ValidationConfigManager.get_config(mode)
    
    # Apply any custom overrides from request
    overrides = {}
    
    # Check for custom thresholds
    if "min_validation_score" in request_data:
        overrides["min_validation_score"] = float(request_data["min_validation_score"])
    
    if "max_regeneration_attempts" in request_data:
        overrides["max_regeneration_attempts"] = int(request_data["max_regeneration_attempts"])
    
    # Apply overrides if any
    if overrides:
        return ValidationConfigManager.create_custom_config(**overrides)
    
    return config


def log_validation_result(validation_result: Dict[str, Any], config: ValidationConfig):
    """Log validation result based on configuration"""
    if not config.log_validation_results:
        return
    
    is_valid = validation_result.get("is_valid", False)
    score = validation_result.get("overall_score", 0.0)
    
    if is_valid:
        logger.info(f"Validation passed with score: {score:.3f}")
    else:
        failed = validation_result.get("failed_validations", [])
        logger.warning(f"Validation failed (score: {score:.3f}, failed: {failed})")
    
    if config.log_validation_details:
        reasons = validation_result.get("reasons", [])
        suggestions = validation_result.get("suggestions", [])
        logger.debug(f"Validation details - Reasons: {reasons}, Suggestions: {suggestions}")
    
    # Record metrics
    validation_metrics.record_validation(validation_result)
