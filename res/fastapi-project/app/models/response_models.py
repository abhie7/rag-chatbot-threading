from pydantic import BaseModel
from typing import List, Optional


class Skill(BaseModel):
    skill_name: str
    years_experience: Optional[int]

class Education(BaseModel):
    degree: str
    start_date: Optional[str]
    end_date: Optional[str]
    institution: str
    location: str

class Language(BaseModel):
    language: str
    proficiency: str

class MatchReason(BaseModel):
    name: str
    text: str

class MatchResult(BaseModel):
    summary: str
    percentage: int
    reasons_suit: List[MatchReason]
    reasons_notsuit: List[MatchReason]

class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    title: str
    summary: str
    location: str
    years_experience: int
    relocation_preference: Optional[str]
    work_sponsorship_needed: Optional[str]

class WorkExperience(BaseModel):
    company: str
    job_title: str
    location: str
    start_date: Optional[str]
    end_date: Optional[str]
    activities: Optional[List[str]]
    achievements: Optional[List[str]]
    technologies: Optional[List[str]]
    years_experience: Optional[int]

class ResumeOutput(BaseModel):
    links: List[str]
    skills: List[Skill]
    education: List[Education]
    languages: List[Language]
    match_result: MatchResult
    personal_info: PersonalInfo
    work_experience: List[WorkExperience]