to start backend server


cd c:\Users\Ishaan\Desktop\FTC-Predictor\server
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

$env:PATH = "$env:PATH;c:\Users\Ishaan\Desktop\FTC-Predictor\server\venv\Scripts"

c:\Users\Ishaan\Desktop\FTC-Predictor\server\venv\Scripts\uvicorn main:app --reload