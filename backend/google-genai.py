import os

from google import genai
from google.genai import types

system_prompt = """Role: You are an expert technical interviewer with 15 years of experience at top-tier tech companies (e.g., Google, Meta, Netflix). Your goal is to conduct a realistic, challenging, yet supportive mock interview.
Session Configuration:
Topic: System Design
Target Role: Software Engineer
Difficulty Level: Easy
Focus Skills: Python, AWS, Backend, Cloud
User's Specific Request: {{custom_question}}

Operational Guidelines:
Opening: If this is the start, introduce yourself and present the first question clearly using the interviewer_intro and interview_question fields.
Interaction Style: Ask only one question at a time. * System Design: Focus on the \"Focus Skills.\" If AWS is mentioned, push for specific services (e.g., S3, RDS, Lambda, DynamoDB).
Output Control (State-Based Schema Logic): You must operate in one of two distinct states. Do not mix fields from State A and State B.

State A: Interview In-Progress (Active Deep Dive)
Required Fields: You must include feedback (brief assessment of the candidate's last answer) and follow_up_question (the next challenge).
Status: The interview_summary.status must be \"In Progress\".
Forbidden Fields: Do not include final_remarks, strengths, areas_for_growth, or overall_rating. Including these will incorrectly terminate the session.

State B: Interview Completed (Final Wrap-up)
Trigger: Use this state only when the user has answered all questions or you have sufficient signal to finish.
Required Fields: You must include final_remarks and the full interview_summary (including strengths, areas_for_growth, and overall_rating).

Status: The interview_summary.status must be \"Completed\".
Forbidden Fields: Do not include follow_up_question or interview_question.

General JSON Formatting Rules:
Omit Unused Fields: If a field is not explicitly required for the current State (A or B), remove the key entirely from the JSON response.
Schema Compliance: Ensure all output strictly follows the provided JSON schema."""


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-3-flash-preview"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    tools = [
        types.Tool(googleSearch=types.GoogleSearch()),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="HIGH",
        ),
        tools=tools,
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type=genai.types.Type.OBJECT,
            properties={
                "interviewer_intro": genai.types.Schema(
                    type=genai.types.Type.STRING,
                    description="The introductory message from the interviewer.",
                ),
                "interview_question": genai.types.Schema(
                    type=genai.types.Type.STRING,
                    description="The primary technical problem. Provide only if a new question is being asked.",
                ),
                "focus_areas": genai.types.Schema(
                    type=genai.types.Type.ARRAY,
                    description="High-level topics for the session.",
                    items=genai.types.Schema(
                        type=genai.types.Type.STRING,
                    ),
                ),
                "feedback": genai.types.Schema(
                    type=genai.types.Type.STRING,
                    description="Qualitative assessment of the candidate's last answer.",
                ),
                "follow_up_question": genai.types.Schema(
                    type=genai.types.Type.STRING,
                    description="A secondary question building upon the previous answer.",
                ),
                "focus_skills_addressed": genai.types.Schema(
                    type=genai.types.Type.ARRAY,
                    description="Specific tech stack components evaluated.",
                    items=genai.types.Schema(
                        type=genai.types.Type.STRING,
                    ),
                ),
                "interview_summary": genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    properties={
                        "status": genai.types.Schema(
                            type=genai.types.Type.STRING,
                            enum=["In Progress", "Completed", "Cancelled"],
                        ),
                        "overall_rating": genai.types.Schema(
                            type=genai.types.Type.STRING,
                        ),
                        "strengths": genai.types.Schema(
                            type=genai.types.Type.ARRAY,
                            items=genai.types.Schema(
                                type=genai.types.Type.STRING,
                            ),
                        ),
                        "areas_for_growth": genai.types.Schema(
                            type=genai.types.Type.ARRAY,
                            items=genai.types.Schema(
                                type=genai.types.Type.STRING,
                            ),
                        ),
                    },
                ),
                "final_remarks": genai.types.Schema(
                    type=genai.types.Type.STRING,
                    description="Closing statement.",
                ),
            },
        ),
        system_instruction=[
            types.Part.from_text(text=system_prompt),
        ],
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")


if __name__ == "__main__":
    generate()
