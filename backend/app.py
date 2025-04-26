from flask import Flask, render_template, request, jsonify
from apify_client import ApifyClient
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# API Keys
APIFY_API_KEY = os.getenv("APIFY_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Apify client
apify_client = ApifyClient(APIFY_API_KEY)

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

def generate_biographical_sketch(profile_data):
    prompt = f"""Generate an NIH Biographical Sketch format document based on the following LinkedIn profile information:
    {profile_data}
    
    Please format it according to the NIH Biographical Sketch guidelines, including sections for:
    1. Personal Statement
    2. Positions and Honors
    3. Contributions to Science
    4. Research Support
    
    Make it professional and well-structured."""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return f"Error generating content: {str(e)}"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    linkedin_url = request.form.get('linkedin_url')
    
    if not linkedin_url:
        return jsonify({'error': 'Please provide a LinkedIn URL'}), 400

    try:
        # Run Apify actor
        run_input = {
            "profileUrls": [linkedin_url],
            "maxItems": 1
        }
        
        run = apify_client.actor("2SyF0bVxmgGr8IVCZ").call(run_input=run_input)
        
        # Get profile data
        profile_data = next(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
        
        # Generate biographical sketch
        biographical_sketch = generate_biographical_sketch(profile_data)
        
        return jsonify({
            'success': True,
            'biographical_sketch': biographical_sketch
        })
        
    except Exception as e:
        print(f"Error in generate route: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 