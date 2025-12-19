"""Prompt templates for LLM-based feedback and practice generation."""

from typing import Optional

# Version tracking for prompt templates
FEEDBACK_PROMPT_VERSION = "1.0.0"
PRACTICE_PROMPT_VERSION = "1.0.0"


def get_feedback_system_prompt() -> str:
    """Get the system prompt for feedback generation."""
    return """You are an expert interview coach with deep experience in technical and behavioral interviewing.
Your role is to provide constructive, actionable feedback on interview responses.

Guidelines:
- Be specific and provide concrete examples from the response
- Focus on both strengths and areas for improvement
- Provide actionable suggestions the candidate can implement
- Be encouraging while remaining honest about areas needing work
- Consider the role and skill targets when evaluating
- Score objectively based on the quality of the response

Always respond in the specified JSON format."""


def get_feedback_user_prompt(
    question: str,
    response_text: str,
    topic: str,
    difficulty: str,
    role: Optional[str] = None,
    skill_targets: Optional[list[str]] = None,
    rubric_criteria: Optional[list[dict]] = None,
) -> str:
    """Generate the user prompt for feedback generation."""
    context_parts = [
        f"Topic: {topic}",
        f"Difficulty: {difficulty}",
    ]

    if role:
        context_parts.append(f"Target Role: {role}")

    if skill_targets:
        context_parts.append(f"Skill Areas: {', '.join(skill_targets)}")

    context = "\n".join(context_parts)

    rubric_section = ""
    if rubric_criteria:
        criteria_text = "\n".join(
            [
                f"- {c['name']} (weight: {c['weight']}): {c['description']}"
                for c in rubric_criteria
            ]
        )
        rubric_section = f"""
Evaluation Rubric:
{criteria_text}
"""

    return f"""Please evaluate the following interview response and provide detailed feedback.

Context:
{context}
{rubric_section}
Interview Question:
{question}

Candidate's Response:
{response_text}

Provide your evaluation in the following JSON format:
{{
    "overall_score": <integer 0-100>,
    "criterion_scores": {{<criterion_name>: <score 0-100>, ...}},
    "strengths": [<list of specific strengths>],
    "weaknesses": [<list of specific areas for improvement>],
    "suggestions": [<list of actionable suggestions>],
    "detailed_feedback": "<comprehensive markdown feedback>"
}}

Ensure your response is valid JSON only, with no additional text."""


def get_practice_system_prompt() -> str:
    """Get the system prompt for practice generation."""
    return """You are an expert interview coach creating follow-up practice exercises.
Your role is to generate targeted practice questions that address specific weaknesses identified in interview feedback.

Guidelines:
- Create practice exercises that directly target identified weaknesses
- Vary the difficulty as requested
- Include clear, concise prompts
- Provide expected answers or key points to look for
- Include helpful hints that guide without giving away the answer

Always respond in the specified JSON format."""


def get_practice_generation_prompt(
    weaknesses: list[str],
    topic: str,
    count: int = 3,
    difficulty_ramp: bool = False,
    skill_targets: Optional[list[str]] = None,
) -> str:
    """Generate the prompt for practice generation."""
    weaknesses_text = "\n".join([f"- {w}" for w in weaknesses])

    difficulty_instruction = ""
    if difficulty_ramp:
        difficulty_instruction = """
For difficulty progression:
- First practice: Easy - foundational concept
- Middle practices: Medium - application of concept
- Final practice: Hard - complex scenario or edge cases
"""
    else:
        difficulty_instruction = "All practices should be medium difficulty."

    skills_context = ""
    if skill_targets:
        skills_context = f"\nTarget Skill Areas: {', '.join(skill_targets)}"

    return f"""Based on the following identified weaknesses from an interview response, generate {count} targeted practice exercises.

Topic: {topic}{skills_context}

Identified Weaknesses:
{weaknesses_text}
{difficulty_instruction}
Generate {count} practice exercises in the following JSON format:
{{
    "practices": [
        {{
            "title": "<concise title>",
            "prompt": "<the practice question or exercise>",
            "practice_type": "practice_question|code_exercise|concept_review|mock_scenario",
            "difficulty": "easy|medium|hard",
            "target_weakness": "<which weakness this addresses>",
            "target_skill": "<specific skill being practiced>",
            "expected_answer": "<key points or solution approach>",
            "hints": "<helpful hints without giving away the answer>"
        }},
        ...
    ]
}}

Ensure your response is valid JSON only, with no additional text."""


def get_transcription_prompt() -> str:
    """Get the prompt for audio transcription correction/enhancement."""
    return """You are a transcription assistant. Clean up and format the following speech-to-text transcription.
Fix obvious errors, add punctuation, and format for readability while preserving the original meaning and content.
Do not add or remove substantial content - only fix transcription errors."""


def generate_prompt_id(prompt_type: str, version: str) -> str:
    """Generate a unique prompt ID for tracking."""
    import hashlib
    import time

    timestamp = str(int(time.time()))
    content = f"{prompt_type}:{version}:{timestamp}"
    hash_suffix = hashlib.sha256(content.encode()).hexdigest()[:8]

    return f"{prompt_type}-{version}-{hash_suffix}"
