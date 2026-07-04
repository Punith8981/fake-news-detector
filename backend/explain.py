import os
import requests
from dotenv import load_dotenv
import anthropic

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def fetch_related_articles(query, max_articles=3):
    """Fetch real articles related to the claim using NewsAPI"""
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "apiKey": NEWS_API_KEY,
        "sortBy": "relevancy",
        "pageSize": max_articles,
        "language": "en"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        articles = data.get("articles", [])

        results = []
        for a in articles:
            results.append({
                "title": a.get("title"),
                "source": a.get("source", {}).get("name"),
                "url": a.get("url"),
                "description": a.get("description")
            })
        return results
    except Exception as e:
        print("News fetch error:", e)
        return []


def generate_explanation(claim, label, articles):
    """Use Claude to explain why the claim is likely true/false, based on fetched articles"""

    if not articles:
        sources_text = "No related articles were found."
    else:
        sources_text = "\n".join([
            f"- {a['title']} ({a['source']}): {a['description']}"
            for a in articles if a['title']
        ])

    prompt = f"""You are a fact-checking assistant. A news classifier labeled this claim as {label}.

Claim: "{claim}"

Related articles found:
{sources_text}

Based ONLY on the articles above, write a short 2-3 sentence explanation of why this claim is likely {label}.
If the articles don't provide enough information, say so honestly instead of guessing.
Do not make up any facts not present in the articles."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        explanation = response.content[0].text
        return explanation
    except Exception as e:
        print("Claude API error:", e)
        return "Could not generate explanation at this time."