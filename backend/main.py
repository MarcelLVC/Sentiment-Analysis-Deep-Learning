import os
from flask import Flask, request, jsonify
import tensorflow as tf
import tensorflow_hub as hub
import tensorflow_text as text  
import numpy as np

app = Flask(__name__)

use_model = None
sentiment_model = None

def load_models():
    global use_model, sentiment_model
    print("Loading Universal Sentence Encoder...")
    use_model = hub.load("https://tfhub.dev/google/universal-sentence-encoder-multilingual-large/3")
    
    print("Loading Custom Sentiment Model...")
    sentiment_model = tf.keras.models.load_model(
        './lstm_sentiment_model.h5',
        custom_objects={'KerasLayer': hub.KerasLayer}
    )
    print("Models loaded successfully.")

load_models()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        review = data.get('review', '')

        if not review:
            return jsonify({'error': 'No review provided'}), 400

        embedding = use_model([review])

        input_data = embedding.numpy()

        expected_shape = sentiment_model.input_shape
        
        if len(expected_shape) == 3:
            input_data = np.reshape(input_data, (1, 1, 512))
        
        prediction = sentiment_model.predict(input_data)
        score = float(prediction[0][0])

        if score > 0.6:
            sentiment = 'positive'
            confidence = score
        elif score < 0.4:
            sentiment = 'negative'
            confidence = 1 - score
        else:
            sentiment = 'neutral'
            confidence = 1 - abs(score - 0.5) * 2

        return jsonify({
            'sentiment': sentiment,
            'confidence': confidence
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run()
