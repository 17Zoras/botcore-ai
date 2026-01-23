import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ai_rewrite(report_text):
    try:
        prompt = f"""
You are a senior business consultant.

Rewrite the following analysis in:
- Clear
- Professional
- Action-oriented language

Do NOT add new data.
Do NOT change the meaning.

ANALYSIS:
{report_text}
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        return response.choices[0].message.content

    except Exception:
        return (
            "AI explanation is temporarily unavailable.\n\n"
            "The logic-based analysis above is accurate and actionable.\n"
            "Please try again later or upgrade your plan."
        )
