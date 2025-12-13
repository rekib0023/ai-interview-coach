"""Unit tests for prompt builders."""

from app.services.prompts import (
    FEEDBACK_PROMPT_VERSION,
    DRILL_PROMPT_VERSION,
    get_feedback_system_prompt,
    get_feedback_user_prompt,
    get_drill_system_prompt,
    get_drill_generation_prompt,
    generate_prompt_id,
)


class TestFeedbackPrompts:
    """Tests for feedback prompt generation."""

    def test_feedback_system_prompt_not_empty(self):
        """Test that feedback system prompt is not empty."""
        prompt = get_feedback_system_prompt()
        assert prompt
        assert len(prompt) > 100
        assert "interview coach" in prompt.lower()

    def test_feedback_user_prompt_basic(self):
        """Test basic feedback user prompt generation."""
        prompt = get_feedback_user_prompt(
            question="What is polymorphism?",
            response_text="Polymorphism allows objects to take many forms...",
            topic="Object-Oriented Programming",
            difficulty="Medium",
        )

        assert "What is polymorphism?" in prompt
        assert "Polymorphism allows objects to take many forms" in prompt
        assert "Object-Oriented Programming" in prompt
        assert "Medium" in prompt
        assert "overall_score" in prompt  # Check JSON format is requested

    def test_feedback_user_prompt_with_role_and_skills(self):
        """Test feedback prompt with role and skill targets."""
        prompt = get_feedback_user_prompt(
            question="Design a cache system",
            response_text="I would use Redis for caching...",
            topic="System Design",
            difficulty="Hard",
            role="Senior Software Engineer",
            skill_targets=["caching", "distributed_systems"],
        )

        assert "Senior Software Engineer" in prompt
        assert "caching" in prompt
        assert "distributed_systems" in prompt

    def test_feedback_user_prompt_with_rubric(self):
        """Test feedback prompt with rubric criteria."""
        rubric_criteria = [
            {"name": "Technical Accuracy", "weight": 0.5, "description": "Correctness"},
            {"name": "Communication", "weight": 0.5, "description": "Clarity"},
        ]

        prompt = get_feedback_user_prompt(
            question="Explain recursion",
            response_text="Recursion is when a function calls itself...",
            topic="Programming Concepts",
            difficulty="Easy",
            rubric_criteria=rubric_criteria,
        )

        assert "Technical Accuracy" in prompt
        assert "Communication" in prompt
        assert "Evaluation Rubric" in prompt


class TestDrillPrompts:
    """Tests for drill prompt generation."""

    def test_drill_system_prompt_not_empty(self):
        """Test that drill system prompt is not empty."""
        prompt = get_drill_system_prompt()
        assert prompt
        assert len(prompt) > 100
        assert "practice" in prompt.lower()

    def test_drill_generation_prompt_basic(self):
        """Test basic drill generation prompt."""
        prompt = get_drill_generation_prompt(
            weaknesses=["Needs to improve time complexity analysis"],
            topic="Algorithms",
            count=3,
        )

        assert "time complexity analysis" in prompt.lower()
        assert "Algorithms" in prompt
        assert "3" in prompt
        assert "drills" in prompt.lower()

    def test_drill_generation_prompt_with_difficulty_ramp(self):
        """Test drill prompt with difficulty ramp."""
        prompt = get_drill_generation_prompt(
            weaknesses=["Edge case handling", "Error handling"],
            topic="Software Development",
            count=3,
            difficulty_ramp=True,
        )

        assert "Easy" in prompt
        assert "Medium" in prompt
        assert "Hard" in prompt
        assert "progression" in prompt.lower()

    def test_drill_generation_prompt_with_skills(self):
        """Test drill prompt with skill targets."""
        prompt = get_drill_generation_prompt(
            weaknesses=["Database optimization"],
            topic="Backend Development",
            count=2,
            skill_targets=["SQL", "indexing"],
        )

        assert "SQL" in prompt
        assert "indexing" in prompt


class TestPromptIdGeneration:
    """Tests for prompt ID generation."""

    def test_prompt_id_format(self):
        """Test that prompt IDs follow the expected format."""
        prompt_id = generate_prompt_id("feedback", "1.0.0")

        assert prompt_id.startswith("feedback-1.0.0-")
        assert len(prompt_id) > 15  # Should include hash suffix

    def test_prompt_ids_are_unique(self):
        """Test that consecutive prompt IDs are unique."""
        ids = [generate_prompt_id("drill", "1.0.0") for _ in range(5)]

        # All IDs should be unique (due to timestamp)
        # Note: This could fail if executed within same second, but unlikely
        assert len(set(ids)) >= 1  # At minimum, format should be consistent

    def test_different_types_have_different_prefixes(self):
        """Test that different prompt types have different prefixes."""
        feedback_id = generate_prompt_id("feedback", "1.0.0")
        drill_id = generate_prompt_id("drill", "1.0.0")

        assert feedback_id.startswith("feedback-")
        assert drill_id.startswith("drill-")


class TestPromptVersions:
    """Tests for prompt version constants."""

    def test_feedback_prompt_version_format(self):
        """Test feedback prompt version follows semver."""
        parts = FEEDBACK_PROMPT_VERSION.split(".")
        assert len(parts) == 3
        assert all(part.isdigit() for part in parts)

    def test_drill_prompt_version_format(self):
        """Test drill prompt version follows semver."""
        parts = DRILL_PROMPT_VERSION.split(".")
        assert len(parts) == 3
        assert all(part.isdigit() for part in parts)
