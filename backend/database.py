from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

engine = create_engine("sqlite:///data/history.db")
Base = declarative_base()

class NewsCheck(Base):
    __tablename__ = "news_checks"
    id = Column(Integer, primary_key=True)
    text = Column(String)
    label = Column(String)
    confidence = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def log_check(text, label, confidence):
    session = SessionLocal()
    entry = NewsCheck(text=text[:200], label=label, confidence=confidence)
    session.add(entry)
    session.commit()
    session.close()

def get_daily_stats():
    session = SessionLocal()
    results = session.query(NewsCheck).all()
    session.close()

    stats = {}
    for r in results:
        day = r.timestamp.strftime("%Y-%m-%d")
        if day not in stats:
            stats[day] = {"FAKE": 0, "REAL": 0}
        stats[day][r.label] += 1

    return stats