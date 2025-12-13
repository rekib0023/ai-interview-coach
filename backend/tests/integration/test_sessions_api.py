"""Integration tests for sessions API endpoints."""

from fastapi import status


class TestSessionsAPI:
    """Tests for /sessions endpoints."""

    def test_create_session(self, authenticated_client, db_session):
        """Test creating a new interview session."""
        response = authenticated_client.post(
            "/api/v1/sessions",
            json={
                "topic": "Data Structures",
                "difficulty": "Medium",
                "role": "Software Engineer",
                "skill_targets": ["arrays", "linked_lists"],
                "question": "Explain the difference between arrays and linked lists.",
            },
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["topic"] == "Data Structures"
        assert data["difficulty"] == "Medium"
        assert data["role"] == "Software Engineer"
        assert data["status"] == "created"
        assert "id" in data

    def test_create_session_minimal(self, authenticated_client, db_session):
        """Test creating a session with minimal fields."""
        response = authenticated_client.post(
            "/api/v1/sessions",
            json={
                "topic": "Python Basics",
            },
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["topic"] == "Python Basics"
        assert data["difficulty"] == "Medium"  # Default

    def test_create_session_unauthenticated(self, client, db_session):
        """Test that unauthenticated users cannot create sessions."""
        response = client.post(
            "/api/v1/sessions",
            json={"topic": "Test"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_sessions(self, authenticated_client, test_session):
        """Test listing user sessions."""
        response = authenticated_client.get("/api/v1/sessions")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert "sessions" in data
        assert "total" in data
        assert data["total"] >= 1

    def test_list_sessions_pagination(self, authenticated_client, test_session):
        """Test session listing with pagination."""
        response = authenticated_client.get("/api/v1/sessions?page=1&page_size=10")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["page"] == 1
        assert data["page_size"] == 10

    def test_get_session(self, authenticated_client, test_session):
        """Test getting a specific session."""
        response = authenticated_client.get(f"/api/v1/sessions/{test_session.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == test_session.id
        assert data["topic"] == test_session.topic

    def test_get_session_not_found(self, authenticated_client, db_session):
        """Test getting a non-existent session."""
        response = authenticated_client.get("/api/v1/sessions/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_session(self, authenticated_client, test_session):
        """Test updating a session."""
        response = authenticated_client.patch(
            f"/api/v1/sessions/{test_session.id}",
            json={"topic": "Updated Topic"},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["topic"] == "Updated Topic"

    def test_submit_response_text(self, authenticated_client, test_session):
        """Test submitting a text response."""
        response = authenticated_client.post(
            f"/api/v1/sessions/{test_session.id}/submit",
            json={
                "response_text": "Here is my answer to the question...",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["response_text"] == "Here is my answer to the question..."
        assert data["status"] == "awaiting_feedback"

    def test_submit_response_requires_content(self, authenticated_client, test_session):
        """Test that submitting empty response fails."""
        response = authenticated_client.post(
            f"/api/v1/sessions/{test_session.id}/submit",
            json={},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_complete_session(self, authenticated_client, test_session):
        """Test completing a session."""
        response = authenticated_client.post(
            f"/api/v1/sessions/{test_session.id}/complete?score=85"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["status"] == "completed"
        assert data["score"] == 85

    def test_delete_session(self, authenticated_client, test_session):
        """Test deleting a session."""
        response = authenticated_client.delete(f"/api/v1/sessions/{test_session.id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify it's deleted
        get_response = authenticated_client.get(f"/api/v1/sessions/{test_session.id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
