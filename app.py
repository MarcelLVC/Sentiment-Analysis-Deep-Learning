import streamlit as st
import tensorflow as stf
import tensorflow_hub as hub
import tensorflow_text as text
import numpy as np

# 1. PAGE CONFIGURATION & VISUALS
st.set_page_config(
    page_title="Hotel Sentiment AI",
    page_icon="🏨",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    /* 1. IMPORT POPPINS FONT */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

    /* 2. APPLY FONT GLOBALLY */
    html, body, [class*="css"] {
        font-family: 'Poppins', sans-serif;
    }

    /* 3. MAIN BACKGROUND & TEXT COLOR */
    .stApp {
        background-color: #Fdfcf0; /* Very light cream background for the page */
        color: #000000; /* Main text black */
    }
    
    /* 4. SIDEBAR (NAVBAR) STYLING */
    section[data-testid="stSidebar"] {
        background-color: #F0F6F6; /* Light pastel blue-grey */
    }
    
    /* Force all text in sidebar to be black */
    section[data-testid="stSidebar"] * {
        color: #000000 !important;
    }

    /* 5. INPUT TEXT AREA STYLING (Bright Box, Dark Border) */
    .stTextArea textarea {
        background-color: #FFFFFF !important; /* Bright White Background */
        color: #000000 !important; /* Black Text */
        border: 2px solid #000000 !important; /* Solid Dark Black Border */
        border-radius: 12px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05); /* Slight shadow for depth */
    }
    
    /* Style the placeholder text */
    .stTextArea textarea::placeholder {
        color: #888888; 
        font-style: italic;
    }

    /* Labels */
    .stTextArea label {
        color: #000000 !important;
        font-weight: 600;
        font-size: 16px;
    }

    /* 6. BUTTON STYLING */
    div.stButton > button {
        background-color: #4ECDC4;
        color: #000000;
        border-radius: 10px;
        border: none;
        font-weight: 600;
        width: 100%;
        padding: 10px;
        border: 1px solid #333333; /* Slight border on button too for consistency */
    }
    div.stButton > button:hover {
        background-color: #45B7AF;
        color: #FFFFFF;
        border: 1px solid #000000;
    }
    
    /* 7. HEADERS */
    h1, h2, h3 {
        color: #000000 !important;
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
    }
    
    /* 8. RESULT CARDS */
    .result-card {
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        margin-top: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: 'Poppins', sans-serif;
        background-color: #FFFFFF; /* White card background */
        border: 1px solid #DDDDDD;
    }
    </style>
    """, unsafe_allow_html=True)


# 2. MODEL LOADING

@st.cache_resource
def load_universal_encoder():
    module_url = "https://tfhub.dev/google/universal-sentence-encoder-multilingual-large/3"
    model = hub.load(module_url)
    return model

@st.cache_resource
def load_sentiment_model():
    model = stf.keras.models.load_model('lstm_model_3.h5', compile=False)
    return model

with st.spinner('Loading AI Models...'):
    try:
        encoder = load_universal_encoder()
        lstm_model = load_sentiment_model()
    except Exception as e:
        st.error(f"Error loading models. Please ensure 'lstm_model_3.h5' is in the directory. Error: {e}")
        st.stop()

# 3. PREDICTION LOGIC
def predict_sentiment(review_text):
    if not review_text:
        return None
    vectors = encoder(review_text)
    vectors_reshaped = np.reshape(vectors, (len(review_text), 1, 512))
    prediction = lstm_model.predict(vectors_reshaped)
    return prediction[0][0]

# 4. SIDEBAR NAVIGATION
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Hotel Review Checker", "About the Model"])

st.sidebar.markdown("---")
st.sidebar.success(
    "**System Status:** \n\n"
    "🟢 Model Loaded\n\n"
    "🟢 Encoder Ready"
)

# 5. PAGE: HOTEL REVIEW CHECKER
if page == "Hotel Review Checker":
    st.title("🏨 Senti  hotel")
    st.markdown("Enter a hotel review below to analyze instantly with advanced LSTM model")

    # Input with specific placeholder
    user_review = st.text_area("Paste the review here:", height=150, placeholder="type here...")

    if st.button("Analyze Sentiment"):
        if user_review:
            prediction_score = predict_sentiment([user_review])
            
            # Logic
            sentiment = "Positive" if prediction_score > 0.5 else "Negative"
            confidence = prediction_score if sentiment == "Positive" else 1 - prediction_score
            
            # Display
            if sentiment == "Positive":
                st.markdown(f"""
                <div class="result-card" style="background-color: #D4EDDA; color: #155724; border: 2px solid #C3E6CB;">
                    <h2>😊 Positive Experience</h2>
                    <p style="font-size: 18px;">Confidence: <b>{confidence:.2%}</b></p>
                    <p>This review indicates the guest enjoyed their stay.</p>
                </div>
                """, unsafe_allow_html=True)
                st.balloons()
            else:
                st.markdown(f"""
                <div class="result-card" style="background-color: #F8D7DA; color: #721C24; border: 2px solid #F5C6CB;">
                    <h2>☹️ Negative Experience</h2>
                    <p style="font-size: 18px;">Confidence: <b>{confidence:.2%}</b></p>
                    <p>This review indicates the guest had complaints.</p>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.warning("Please enter some text to analyze.")

# -------------------------------------------------------------------------
# 6. PAGE: ABOUT THE MODEL
# -------------------------------------------------------------------------
elif page == "About the Model":
    st.title("💡 About This AI")
    
    st.markdown("""
    ### How it Works
    This application uses a sophisticated Deep Learning architecture.
    """)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("1. The Encoder")
        st.markdown("**Google Universal Sentence Encoder**")
        st.caption("Multilingual Large V3")
        st.write("""
        Converts text into numbers (embeddings). Supports English, Spanish, French, Chinese, etc.
        """)
        
    with col2:
        st.subheader("2. The Brain")
        st.markdown("**LSTM (Long Short-Term Memory)**")
        st.write("""
        A Recurrent Neural Network that understands the sequence and context of words.
        """)
        
    st.markdown("---")
    st.subheader("✨ Benefits")
    st.info("⚡ **Instant Analysis**: Process thousands of reviews in seconds.")
    st.info("🌍 **Multilingual**: Understands multiple languages.")