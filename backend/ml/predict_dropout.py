
import json
import sys
from pathlib import Path

import joblib
import pandas as pd


PROJECT_FEATURES = [
    'gender_code',
    'attendance_percentage',
    'assignment_completion',
    'current_cgpa',
    'previous_cgpa',
    'average_internal_marks',
    'average_total_marks',
    'subjects_enrolled',
    'subjects_evaluated',
    'subjects_passed',
    'subjects_credited',
    'age_at_enrollment',
    'debtor',
    'tuition_fees_up_to_date',
    'scholarship_holder',
    'educational_special_needs',
    'international',
    'course_code',
    'daytime_attendance',
    'displaced',
    'unemployment_rate',
    'inflation_rate',
    'gdp',
]

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / 'model_artifacts'
RISK_MODEL_PATH = ARTIFACTS / 'smart_ai_dropout_risk_model.pkl'
PERFORMANCE_MODEL_PATH = ARTIFACTS / 'smart_ai_performance_model.pkl'
DEFAULTS_PATH = ARTIFACTS / 'feature_defaults.json'
METADATA_PATH = ARTIFACTS / 'model_metadata.json'


def load_defaults():
    if DEFAULTS_PATH.exists():
        return json.loads(DEFAULTS_PATH.read_text())
    return {
        'gender_code': 0.0,
        'attendance_percentage': 72.0,
        'assignment_completion': 0.82,
        'current_cgpa': 6.1,
        'previous_cgpa': 6.1,
        'average_internal_marks': 61.0,
        'average_total_marks': 61.0,
        'subjects_enrolled': 6.0,
        'subjects_evaluated': 6.0,
        'subjects_passed': 5.0,
        'subjects_credited': 5.0,
        'age_at_enrollment': 20.0,
        'debtor': 0.0,
        'tuition_fees_up_to_date': 1.0,
        'scholarship_holder': 0.0,
        'educational_special_needs': 0.0,
        'international': 0.0,
        'course_code': 11.0,
        'daytime_attendance': 1.0,
        'displaced': 1.0,
        'unemployment_rate': 11.1,
        'inflation_rate': 1.4,
        'gdp': 0.32,
    }


DEFAULTS = load_defaults()


def safe_float(value, fallback):
    try:
        if value is None or value == '':
            return float(fallback)
        return float(value)
    except (TypeError, ValueError):
        return float(fallback)


def safe_int(value, fallback):
    try:
        if value is None or value == '':
            return int(round(float(fallback)))
        return int(round(float(value)))
    except (TypeError, ValueError):
        return int(round(float(fallback)))


def clamp(value, lower, upper):
    return max(lower, min(upper, value))


def map_gender_code(gender):
    value = str(gender or '').strip().lower()
    if value == 'male':
        return 1.0
    if value == 'female':
        return 0.0
    return float(DEFAULTS['gender_code'])


def grade_from_cgpa(cgpa):
    if cgpa >= 9.0:
        return 'O'
    if cgpa >= 8.0:
        return 'A+'
    if cgpa >= 7.0:
        return 'A'
    if cgpa >= 6.0:
        return 'B+'
    if cgpa >= 5.0:
        return 'B'
    if cgpa >= 4.0:
        return 'C'
    return 'F'


def build_feature_row(student):
    attendance_percentage = clamp(
        safe_float(student.get('attendancePercentage'), DEFAULTS['attendance_percentage']),
        0.0,
        100.0,
    )

    assignment_completion = clamp(
        safe_float(student.get('assignmentCompletion'), DEFAULTS['assignment_completion']),
        0.0,
        1.0,
    )

    current_cgpa = clamp(
        safe_float(student.get('currentCGPA'), DEFAULTS['current_cgpa']),
        0.0,
        10.0,
    )

    previous_cgpa = clamp(
        safe_float(student.get('previousCGPA'), current_cgpa),
        0.0,
        10.0,
    )

    average_internal_marks = clamp(
        safe_float(student.get('averageInternalMarks'), current_cgpa * 10.0),
        0.0,
        100.0,
    )

    average_total_marks = clamp(
        safe_float(student.get('averageTotalMarks'), average_internal_marks),
        0.0,
        100.0,
    )

    subjects_enrolled = max(1, safe_int(student.get('subjectsEnrolled'), DEFAULTS['subjects_enrolled']))
    subjects_evaluated = clamp(
        safe_int(student.get('subjectsEvaluated'), DEFAULTS['subjects_evaluated']),
        0,
        subjects_enrolled,
    )
    subjects_passed = clamp(
        safe_int(student.get('subjectsPassed'), DEFAULTS['subjects_passed']),
        0,
        subjects_enrolled,
    )
    subjects_credited = clamp(
        safe_int(student.get('subjectsCredited'), DEFAULTS['subjects_credited']),
        0,
        subjects_enrolled,
    )

    row = {
        'gender_code': map_gender_code(student.get('gender')),
        'attendance_percentage': attendance_percentage,
        'assignment_completion': assignment_completion,
        'current_cgpa': current_cgpa,
        'previous_cgpa': previous_cgpa,
        'average_internal_marks': average_internal_marks,
        'average_total_marks': average_total_marks,
        'subjects_enrolled': float(subjects_enrolled),
        'subjects_evaluated': float(subjects_evaluated),
        'subjects_passed': float(subjects_passed),
        'subjects_credited': float(subjects_credited),
        'age_at_enrollment': clamp(
            safe_float(student.get('ageAtEnrollment'), DEFAULTS['age_at_enrollment']),
            16.0,
            65.0,
        ),
        'debtor': 1.0 if safe_int(student.get('debtor', 0), DEFAULTS['debtor']) else 0.0,
        'tuition_fees_up_to_date': 1.0 if safe_int(student.get('tuitionFeesUpToDate', 1), DEFAULTS['tuition_fees_up_to_date']) else 0.0,
        'scholarship_holder': 1.0 if safe_int(student.get('scholarshipHolder', 0), DEFAULTS['scholarship_holder']) else 0.0,
        'educational_special_needs': 1.0 if safe_int(student.get('educationalSpecialNeeds', 0), DEFAULTS['educational_special_needs']) else 0.0,
        'international': 1.0 if safe_int(student.get('international', 0), DEFAULTS['international']) else 0.0,
        'course_code': safe_float(student.get('courseCode'), DEFAULTS['course_code']),
        'daytime_attendance': 1.0 if safe_int(student.get('daytimeAttendance', 1), DEFAULTS['daytime_attendance']) else 0.0,
        'displaced': 1.0 if safe_int(student.get('displaced', 1), DEFAULTS['displaced']) else 0.0,
        'unemployment_rate': safe_float(student.get('unemploymentRate'), DEFAULTS['unemployment_rate']),
        'inflation_rate': safe_float(student.get('inflationRate'), DEFAULTS['inflation_rate']),
        'gdp': safe_float(student.get('gdp'), DEFAULTS['gdp']),
    }

    return row


def impact_from_score(value, low_threshold, mid_threshold):
    if value >= mid_threshold:
        return 'High'
    if value >= low_threshold:
        return 'Medium'
    return 'Low'


def build_factor_details(features, dropout_prob):
    attendance_signal = 1 - (features['attendance_percentage'] / 100.0)
    academic_signal = 1 - (features['current_cgpa'] / 10.0)
    assignment_signal = 1 - features['assignment_completion']
    previous_signal = 1 - (features['previous_cgpa'] / 10.0)

    return {
        'attendance': {
            'score': round(float(attendance_signal), 4),
            'impact': impact_from_score(attendance_signal, 0.2, 0.4),
        },
        'academics': {
            'score': round(float(academic_signal), 4),
            'impact': impact_from_score(academic_signal, 0.25, 0.45),
        },
        'assignments': {
            'score': round(float(assignment_signal), 4),
            'impact': impact_from_score(assignment_signal, 0.15, 0.35),
        },
        'previousPerformance': {
            'score': round(float(previous_signal), 4),
            'impact': impact_from_score(previous_signal, 0.25, 0.45),
        },
        'model': {
            'score': round(float(dropout_prob), 4),
            'impact': impact_from_score(dropout_prob, 0.35, 0.65),
        },
    }


def build_recommendations(features, dropout_prob, predicted_cgpa):
    items = []

    if features['attendance_percentage'] < 75:
        items.append('Increase attendance and review missed classes every week.')
    if features['assignment_completion'] < 0.8:
        items.append('Submit assignments before internal deadlines and track completion subject-wise.')
    if features['current_cgpa'] < 6.5:
        items.append('Plan remedial support for low-scoring subjects and schedule faculty mentoring.')
    if features['subjects_passed'] < max(3, round(features['subjects_enrolled'] * 0.65)):
        items.append('Focus on backlog-prone subjects and weekly revision goals.')
    if features['debtor'] > 0 or features['tuition_fees_up_to_date'] == 0:
        items.append('Flag this student for financial counselling and fee-support review.')
    if dropout_prob >= 0.65:
        items.append('Keep the student on high-priority monitoring with monthly intervention reviews.')
    elif dropout_prob >= 0.4:
        items.append('Track progress fortnightly and provide nudges through faculty/advisor follow-up.')
    if predicted_cgpa >= 8.0:
        items.append('Maintain the current momentum and give advanced academic opportunities.')
    if not items:
        items.append('Current academic trend looks stable. Maintain the same discipline and monitoring cadence.')

    return items[:5]


def read_metadata():
    if METADATA_PATH.exists():
        try:
            return json.loads(METADATA_PATH.read_text())
        except json.JSONDecodeError:
            return None
    return None


def main():
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}
    student = payload.get('student') or payload

    risk_model = joblib.load(RISK_MODEL_PATH)
    performance_model = joblib.load(PERFORMANCE_MODEL_PATH)

    features = build_feature_row(student)
    frame = pd.DataFrame([[features[name] for name in PROJECT_FEATURES]], columns=PROJECT_FEATURES)

    probs = risk_model.predict_proba(frame)[0]
    dropout_probability = float(probs[1])
    continue_probability = float(probs[0])

    predicted_cgpa = float(clamp(performance_model.predict(frame)[0], 0.0, 10.0))
    predicted_grade = grade_from_cgpa(predicted_cgpa)

    if dropout_probability >= 0.65:
        risk_level = 'high'
    elif dropout_probability >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    metadata = read_metadata()
    factors = build_factor_details(features, dropout_probability)
    recommendations = build_recommendations(features, dropout_probability, predicted_cgpa)

    weak_areas = []
    strong_areas = []

    if features['attendance_percentage'] < 75:
        weak_areas.append('Attendance')
    if features['current_cgpa'] < 6.5:
        weak_areas.append('Academic Performance')
    if features['assignment_completion'] < 0.8:
        weak_areas.append('Assignment Discipline')
    if features['subjects_passed'] < max(3, round(features['subjects_enrolled'] * 0.65)):
        weak_areas.append('Subject Clearance')

    if features['attendance_percentage'] >= 90:
        strong_areas.append('Excellent Attendance')
    if features['current_cgpa'] >= 8:
        strong_areas.append('Strong Academics')
    if features['assignment_completion'] >= 0.95:
        strong_areas.append('Consistent Assignment Completion')
    if features['subjects_passed'] >= max(5, round(features['subjects_enrolled'] * 0.85)):
        strong_areas.append('Subject Completion')

    confidence = max(dropout_probability, continue_probability)

    result = {
        'success': True,
        'graduateProbability': round(continue_probability, 6),
        'dropoutProbability': round(dropout_probability, 6),
        'riskScore': round(dropout_probability, 6),
        'riskLevel': risk_level,
        'confidence': round(float(confidence), 6),
        'threshold': 0.65,
        'predictionLabel': 'dropout' if dropout_probability >= 0.65 else 'continue',
        'factors': factors,
        'recommendations': recommendations,
        'featureSnapshot': {
            'attendancePercentage': round(features['attendance_percentage'], 2),
            'currentCGPA': round(features['current_cgpa'], 2),
            'assignmentCompletion': round(features['assignment_completion'], 4),
            'subjectsPassed': int(features['subjects_passed']),
            'subjectsEnrolled': int(features['subjects_enrolled']),
        },
        'performancePrediction': {
            'predictedCGPA': round(predicted_cgpa, 2),
            'predictedGrade': predicted_grade,
            'confidence': round(float(confidence), 6),
            'weakAreas': weak_areas,
            'strongAreas': strong_areas,
            'suggestions': recommendations,
        },
        'modelMetadata': {
            'modelName': metadata.get('modelName') if metadata else 'Smart AI Academic Intelligence Model Suite',
            'riskMetrics': metadata.get('riskModel', {}).get('metrics') if metadata else None,
            'performanceMetrics': metadata.get('performanceModel', {}).get('metrics') if metadata else None,
        },
    }

    print(json.dumps(result))


if __name__ == '__main__':
    main()
