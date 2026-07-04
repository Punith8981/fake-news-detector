import pandas as pd
import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = ' '.join([w for w in text.split() if w not in stop_words])
    return text

def load_and_clean(fake_csv, true_csv):
    fake = pd.read_csv(fake_csv)
    true = pd.read_csv(true_csv)

    fake['label'] = 0
    true['label'] = 1

    df = pd.concat([fake, true], ignore_index=True)
    df['content'] = df['title'].fillna('') + ' ' + df['text'].fillna('')
    df['clean_content'] = df['content'].apply(clean_text)

    df = df.sample(frac=1).reset_index(drop=True)
    return df[['clean_content', 'label']]

if __name__ == "__main__":
    df = load_and_clean('data/Fake.csv', 'data/True.csv')
    df.to_csv('data/cleaned_news.csv', index=False)
    print(f"Cleaned dataset saved: {df.shape[0]} rows")