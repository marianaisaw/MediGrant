import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# Configure with your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# List all available models
for model in genai.list_models():
    print(f"Model Name: {model.name}")
    print(f"Display Name: {model.display_name}")
    print(f"Description: {model.description}")
    print(f"Supported Methods: {model.supported_generation_methods}")
    print("---") 