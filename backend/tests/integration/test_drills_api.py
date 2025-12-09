"""Integration tests for drills API endpoints."""

import pytest
from fastapi import status
from unittest.mock import patch


class TestDrillsAPI:
    """Tests for /drills endpoints."""

    def test_generate_drills_returns_accepted(
        self, authenticated_client, completed_feedback_run
    ):
        """Test generating drills returns 202 Accepted."""
        with patch("app.api.v1.endpoints.drills.generate_drills_async"):
            response = authenticated_client.post(
                f"/api/v1/drills/feedback/{completed_feedback_run.id}/drills",
                json={"count": 3},
            )

        assert response.status_code == status.HTTP_202_ACCEPTED
        data = response.json()

        assert "message" in data
        assert data["feedback_run_id"] == completed_feedback_run.id
        assert data["requested_count"] == 3

    def test_generate_drills_with_difficulty_ramp(
        self, authenticated_client, completed_feedback_run
    ):
        """Test generating drills with difficulty ramp."""
        with patch("app.api.v1.endpoints.drills.generate_drills_async"):
            response = authenticated_client.post(
                f"/api/v1/drills/feedback/{completed_feedback_run.id}/drills",
                json={"count": 3, "difficulty_ramp": True},
            )

        assert response.status_code == status.HTTP_202_ACCEPTED

    def test_generate_drills_incomplete_feedback(
        self, authenticated_client, test_feedback_run
    ):
        """Test that generating drills fails for incomplete feedback."""
        response = authenticated_client.post(
            f"/api/v1/drills/feedback/{test_feedback_run.id}/drills"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_drills_for_feedback(
        self, authenticated_client, completed_feedback_run, test_drills
    ):
        """Test getting drills for a feedback run."""
        response = authenticated_client.get(
            f"/api/v1/drills/feedback/{completed_feedback_run.id}"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert "drills" in data
        assert data["feedback_run_id"] == completed_feedback_run.id
        assert len(data["drills"]) == 2

    def test_list_drills(self, authenticated_client, test_drills):
        """Test listing user's drills."""
        response = authenticated_client.get("/api/v1/drills")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert "drills" in data
        assert "total" in data
        assert data["total"] >= 2

    def test_list_drills_with_status_filter(
        self, authenticated_client, test_drills
    ):
        """Test listing drills with status filter."""
        response = authenticated_client.get("/api/v1/drills?status=pending")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # All test drills are pending
        assert all(d["status"] == "pending" for d in data["drills"])

    def test_get_pending_drills(self, authenticated_client, test_drills):
        """Test getting pending drills."""
        response = authenticated_client.get("/api/v1/drills/pending")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert "drills" in data
        assert all(d["status"] == "pending" for d in data["drills"])

    def test_get_drill(self, authenticated_client, test_drills):
        """Test getting a specific drill."""
        drill = test_drills[0]

        response = authenticated_client.get(f"/api/v1/drills/{drill.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == drill.id
        assert data["title"] == drill.title
        assert data["is_delivered"] is True  # Should be marked as delivered

    def test_get_drill_not_found(self, authenticated_client, db_session):
        """Test getting non-existent drill."""
        response = authenticated_client.get("/api/v1/drills/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_drill_with_hints(self, authenticated_client, test_drills):
        """Test getting drill with hints."""
        drill = test_drills[0]

        response = authenticated_client.get(f"/api/v1/drills/{drill.id}/hints")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == drill.id
        # hints field should be present (even if None)
        assert "hints" in data

    def test_start_drill(self, authenticated_client, test_drills):
        """Test starting a drill."""
        drill = test_drills[0]

        response = authenticated_client.post(f"/api/v1/drills/{drill.id}/start")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["status"] == "in_progress"
        assert data["started_at"] is not None

    def test_submit_drill_response(self, authenticated_client, test_drills):
        """Test submitting a drill response."""
        drill = test_drills[0]

        response = authenticated_client.post(
            f"/api/v1/drills/{drill.id}/submit",
            json={"user_response": "Here is my answer to the drill..."},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["user_response"] == "Here is my answer to the drill..."

    def test_complete_drill(self, authenticated_client, test_drills):
        """Test completing a drill."""
        drill = test_drills[0]

        response = authenticated_client.post(
            f"/api/v1/drills/{drill.id}/complete?score=90"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["status"] == "completed"
        assert data["score"] == 90

    def test_skip_drill(self, authenticated_client, test_drills):
        """Test skipping a drill."""
        drill = test_drills[1]  # Use second drill

        response = authenticated_client.post(f"/api/v1/drills/{drill.id}/skip")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["status"] == "skipped"
