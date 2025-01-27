from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_skill_extraction():
    response = client.post("/process-resume", json={"resume_text": "Python developer with Django experience"})
    assert response.status_code == 200
    assert "skills" in response.json()
    assert "python" in response.json()["skills"]
