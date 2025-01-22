from flask import Flask, render_template, request, send_file, jsonify
import os
from rfp_summarizer import process_rfp  
import uuid  
from pathlib import Path

app = Flask(__name__, static_folder='static')

# Define relative paths for uploads and outputs
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
BASE_DIR = Path(__file__).resolve().parent  # Get the base directory where the script is located
UPLOAD_DIR = BASE_DIR / UPLOAD_FOLDER
OUTPUT_DIR = BASE_DIR / OUTPUT_FOLDER

# Ensure the upload and output directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
app.config['OUTPUT_FOLDER'] = OUTPUT_DIR

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/process_rfp", methods=["POST"])
def process_rfp_route():
    try:
        # Save uploaded file
        pdf_file = request.files["pdf_file"]
        if not pdf_file:
            return jsonify({"error": "No file uploaded"}), 400

        # Save PDF file temporarily in the uploads folder
        pdf_path = UPLOAD_DIR / pdf_file.filename
        pdf_file.save(pdf_path)
        print(f"Saved PDF file to: {pdf_path}")

        # Process the RFP
        output_dir = OUTPUT_DIR / "processed"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Call your process_rfp function
        summary, docx_filename = process_rfp(str(pdf_path), str(output_dir))
        # print(f"Generated summary: {summary}")
        print(f"Generated .docx file: {docx_filename}")

        # Path to the generated .docx file
        docx_path = output_dir / docx_filename
        print(f"docx_path: {docx_path}")

        # Ensure the docx file is actually generated before proceeding
        if not docx_path.exists():
            return jsonify({"error": "Generated .docx file not found"}), 500

        # Respond with only the download URL and an empty summary
        return jsonify({
            "summary": "",
            "download_url": f"/download/{docx_filename}"
        })

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log any error
        return jsonify({"error": str(e)}), 500



@app.route("/download/<filename>")
def download_file(filename):
    file_path = OUTPUT_DIR / "processed" / filename
    print(f"Download filepath: {file_path}")
    if not file_path.exists():
        return "File not found", 404
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4201)

