from flask import Flask, request, jsonify, render_template
import requests
import json

app = Flask(__name__)

# Hugging Face API configuration
HUGGINGFACE_API_KEY = "your-huggingface-api-key-here"  # Replace with your API key
MODEL_NAME = "your-username/your-model-name"  # Replace with your model name
HUGGINGFACE_URL = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    # Prepare the request to Hugging Face
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 100,
            "temperature": 0.7
        }
    }

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(HUGGINGFACE_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()

        # Hugging Face returns a list of generated text objects
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get('generated_text', '')
            # Remove the original prompt from the response
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
            return jsonify({'response': generated_text})
        else:
            return jsonify({'response': str(result)})
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to connect to model: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
