from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from app.core.config import settings


class AssessmentAgent:
    def __init__(self):
        self._agent = LlmAgent(
            model=settings.LLM_MODEL,
            session_service=InMemorySessionService(),
            runner=Runner(),
        )
