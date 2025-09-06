import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ValidationResult {
  is_valid: boolean;
  overall_score: number;
  confidence_level: 'high' | 'medium' | 'low' | 'failed';
  failed_validations: string[];
  reasons: string[];
  suggestions: string[];
  individual_results?: {
    [key: string]: {
      is_valid: boolean;
      score: number;
      confidence_level: string;
      reasons?: string[];
      suggestions?: string[];
    };
  };
  validation_type?: string;
  fallback_used?: boolean;
  enhanced_validation?: boolean;
}

interface ValidationDisplayProps {
  validation: ValidationResult;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validation,
  showDetails = false,
  compact = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  if (!validation) {
    return null;
  }

  const getStatusIcon = () => {
    if (validation.is_valid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (validation.confidence_level === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (validation.is_valid) {
      return 'text-green-700 bg-green-50 border-green-200';
    } else if (validation.confidence_level === 'failed') {
      return 'text-red-700 bg-red-50 border-red-200';
    } else {
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-600';
    if (score >= 0.70) return 'text-blue-600';
    if (score >= 0.55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 0.85) return 'bg-green-500';
    if (score >= 0.70) return 'bg-blue-500';
    if (score >= 0.55) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatValidatorName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getScoreColor(validation.overall_score)}`}>
          {(validation.overall_score * 100).toFixed(0)}%
        </span>
        {validation.fallback_used && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Fallback
          </span>
        )}
        {validation.enhanced_validation && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Enhanced
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-sm">
              Response Validation
              {validation.enhanced_validation && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Enhanced
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`text-sm font-medium ${getScoreColor(validation.overall_score)}`}>
                Score: {(validation.overall_score * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600">
                Confidence: {validation.confidence_level}
              </span>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(validation.overall_score)}`}
            style={{ width: `${validation.overall_score * 100}%` }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Individual Validator Results */}
          {validation.individual_results && (
            <div>
              <h4 className="font-medium text-sm mb-2">Validation Components</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(validation.individual_results).map(([name, result]) => (
                  <div
                    key={name}
                    className="bg-white bg-opacity-50 rounded-md p-3 border border-opacity-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {formatValidatorName(name)}
                      </span>
                      <span className={`text-sm ${getScoreColor(result.score)}`}>
                        {(result.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${getProgressBarColor(result.score)}`}
                        style={{ width: `${result.score * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center mt-1">
                      {result.is_valid ? (
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-600">
                        {result.confidence_level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasons */}
          {validation.reasons && validation.reasons.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Analysis
              </h4>
              <ul className="space-y-1">
                {validation.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Suggestions for Improvement</h4>
              <ul className="space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Failed Validations */}
          {validation.failed_validations && validation.failed_validations.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 text-red-700">Failed Checks</h4>
              <div className="flex flex-wrap gap-2">
                {validation.failed_validations.map((validator, index) => (
                  <span
                    key={index}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full"
                  >
                    {formatValidatorName(validator)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fallback Warning */}
          {validation.fallback_used && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Fallback Mode Used
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    The enhanced validation system encountered an issue and fell back to legacy recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Metadata */}
          {validation.validation_type && (
            <div className="text-xs text-gray-500 border-t pt-2 mt-3">
              Validation Type: {validation.validation_type}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationDisplay;
