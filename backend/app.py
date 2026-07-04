from passlib.context import CryptContext
import json
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import re as regex_module
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import re
import os
import json
import uuid
import io
from datetime import datetime
from nltk.corpus import stopwords
from dotenv import load_dotenv
import qrcode
from fastapi.responses import StreamingResponse

from explain import fetch_related_articles, generate_explanation
from database import log_check, get_daily_stats

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title='Fake News Detector API')

model = joblib.load('models/fake_news_model.pkl')
vectorizer = joblib.load('models/vectorizer.pkl')
stop_words = set(stopwords.words('english'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NewsInput(BaseModel):
    text: str


class ArticleInput(BaseModel):
    title: str
    publisher: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = ' '.join([w for w in text.split() if w not in stop_words])
    return text


@app.get('/')
def health_check():
    return {'status': 'API is running'}


@app.post('/check-news')
def check_news(input: NewsInput):
    cleaned = clean_text(input.text)
    vec = vectorizer.transform([cleaned])

    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0]

    label = 'REAL' if prediction == 1 else 'FAKE'
    confidence = round(max(probability) * 100, 2)

    log_check(input.text, label, confidence)

    message = 'This news is likely ' + label + ' (' + str(confidence) + '% confidence)'

    return {
        'label': label,
        'confidence': confidence,
        'message': message
    }


@app.post('/explain')
def explain_news(input: NewsInput):
    cleaned = clean_text(input.text)
    vec = vectorizer.transform([cleaned])

    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0]
    label = 'REAL' if prediction == 1 else 'FAKE'
    confidence = round(max(probability) * 100, 2)

    log_check(input.text, label, confidence)

    articles = fetch_related_articles(input.text)
    explanation = generate_explanation(input.text, label, articles)

    return {
        'label': label,
        'explanation': explanation,
        'sources': articles
    }


@app.get('/dashboard-stats')
def dashboard_stats():
    return get_daily_stats()


verified_articles = {}


@app.post('/register-article')
def register_article(input: ArticleInput):
    article_id = str(uuid.uuid4())[:8]
    verified_articles[article_id] = {
        'title': input.title,
        'publisher': input.publisher,
        'verified': True
    }
    verify_url = 'http://127.0.0.1:8000/verify/' + article_id
    return {
        'article_id': article_id,
        'verify_url': verify_url
    }


@app.get('/qr/{article_id}')
def generate_qr(article_id: str):
    url = 'http://127.0.0.1:8000/verify/' + article_id
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return StreamingResponse(buf, media_type='image/png')


@app.get('/verify/{article_id}')
def verify_article(article_id: str):
    article = verified_articles.get(article_id)
    if not article:
        return {'error': 'Article not found or not registered'}
    return article


@app.post('/report')
def report_news(input: NewsInput):
    report_entry = {
        'text': input.text,
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'Reported for fact-checking review'
    }

    with open('data/reports.json', 'a') as f:
        f.write(json.dumps(report_entry) + '\n')

    return {
        'status': 'Report submitted successfully',
        'message': 'This claim has been logged for review by our fact-checking partners.',
        'report': report_entry
    }
def extract_video_id(url):
    match    = regex_module.search(r'(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})', url)
    return    match.group(1) if match else None

class VideoInput(BaseModel):
    url: str


@app.post('/check-video')
def check_video(input: VideoInput):
    video_id = extract_video_id(input.url)

    if not video_id:
        return {'error': 'Invalid YouTube URL'}

    youtube_api_key = os.getenv('YOUTUBE_API_KEY')
    youtube = build('youtube', 'v3', developerKey=youtube_api_key)

    request = youtube.videos().list(part='snippet', id=video_id)
    response = request.execute()

    if not response.get('items'):
        return {'error': 'Video not found'}

    snippet = response['items'][0]['snippet']
    title = snippet.get('title', '')
    description = snippet.get('description', '')

    transcript_text = ''
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ' '.join([t['text'] for t in transcript])
    except Exception:
        transcript_text = ''

    combined_text = title + ' ' + description + ' ' + transcript_text[:2000]

    cleaned = clean_text(combined_text)
    vec = vectorizer.transform([cleaned])
    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0]
    label = 'REAL' if prediction == 1 else 'FAKE'
    confidence = round(max(probability) * 100, 2)

    log_check(title, label, confidence)

    return {
        'video_title': title,
        'label': label,
        'confidence': confidence,
        'has_transcript': bool(transcript_text)
    }

@app.post("/register")
def register(user: UserRegister):
    try:
        with open("users.json", "r") as file:
            users = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        users = []

    for existing_user in users:
        if existing_user["email"] == user.email:
            return {
                "success": False,
                "message": "Email already registered"
            }

    hashed_password = pwd_context.hash(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    users.append(new_user)

    with open("users.json", "w") as file:
        json.dump(users, file, indent=4)

    return {
        "success": True,
        "message": "Registration successful"
    }

@app.post("/login")
def login(user: UserLogin):
    try:
        with open("users.json", "r") as file:
            users = json.load(file)
    except FileNotFoundError:
        return {
            "success": False,
            "message": "No users found"
        }

    for existing_user in users:
        if existing_user["email"] == user.email:
            if pwd_context.verify(user.password, existing_user["password"]):
                return {
                    "success": True,
                    "message": "Login successful",
                    "name": existing_user["name"],
                    "email": existing_user["email"]
                }
            else:
                return {
                    "success": False,
                    "message": "Incorrect password"
                }

    return {
        "success": False,
        "message": "User not found"
    }