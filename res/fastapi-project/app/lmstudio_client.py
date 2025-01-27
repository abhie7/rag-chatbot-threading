from openai import OpenAI
import json

class LMStudioClient:
    def __init__(self, base_url: str, api_key: str):
        self.client = OpenAI(base_url=base_url, api_key=api_key)

    def extract_skills(self, jd_text: str):
        jd_text = jd_text.lower()
        try:
            completion = self.client.chat.completions.create(
                model="gemma-2-2b-instruct",
                messages=[
                    {"role": "system", "content": """
                    You are given a job description, and your task is to extract all technical skills:

                    Extract all the skills separately.
                    extract all the hard core skills from the job description.

                    Strictly follow these notes:
                    Do not add any additional words like "etc" or specific versions.

                    The output must be in JSON format without any instructions or explanations.
                    Use this output format:

                    json

                    {
                        "skills": ["List of skills"]
                    }
                    """},
                    {"role": "user", "content": jd_text},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "skill_response",
                        "strict": "true",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "skills": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                            },
                            "required": ["skills"],
                        },
                    },
                },
                temperature=0.3,
                top_p=1,
                stream=False,
            )

            skills = json.loads(completion.choices[0].message.content.strip())
            unique_skills = sorted(set(skill.lower() for skill in skills.get("skills", [])))
            return {"skills": unique_skills}
        except Exception as e:
            print(f"Error: {e}")
            return {"skills": []}
