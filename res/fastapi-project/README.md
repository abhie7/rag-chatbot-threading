# FastAPI Project

This is a FastAPI project designed to demonstrate the structure and functionality of a web application that interacts with the LMStudio API to extract skills from text.

## Project Structure

```
fastapi-project
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── lmstudio_client.py
│   ├── models
│   │   ├── __init__.py
│   │   └── skill_model.py
│   ├── utils
│   │   ├── __init__.py
│   │   └── skill_extractor.py
│   └── tests
│       ├── __init__.py
│       ├── test_main.py
│       └── test_skill_extractor.py
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd fastapi-project
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. **Install the required dependencies:**
   ```
   pip install -r requirements.txt
   ```

## Usage

To run the FastAPI application, execute the following command:

```
uvicorn app.main:app --reload
```

You can access the API documentation at `http://127.0.0.1:8000/docs`.

## Testing

To run the unit tests, use the following command:

```
pytest app/tests
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.