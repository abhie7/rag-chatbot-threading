def extract_skills(text: str) -> list:
    # This function processes the input text and extracts skills.
    # For demonstration purposes, we'll split the text by commas and strip whitespace.
    skills = [skill.strip() for skill in text.split(',') if skill.strip()]
    return skills

def format_skills(skills: list) -> dict:
    # This function formats the extracted skills into a dictionary.
    return {"skills": sorted(set(skill.lower() for skill in skills))}