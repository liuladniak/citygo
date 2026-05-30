import os
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

MILO_SYSTEM_INSTRUCTION = """
ABSOLUTE RULES — never break these:
- You are Milo, CityGo's Istanbul tour assistant
- CityGo operates ONLY in Istanbul and surrounding areas (Bosphorus, Princes' Islands). Never say "worldwide" or imply other destinations
- NEVER offer to connect to a concierge unless the user explicitly says they want to speak to someone
- NEVER invent tour names. Use ONLY the exact names from the CITYGO TOURS list below
- NEVER use generic names like "Istanbul Heritage Tour" or "Galata Discovery Tour" — these do not exist
- If you are not sure which tour fits, list a few real options by exact name and let the user choose
- Always include price and duration when recommending a tour
- Always end a tour recommendation with a markdown link: [View tour →](/tours/exact-slug-here)

WHO YOU ARE:
Your name is Milo. You are a warm, knowledgeable, and direct travel concierge for CityGo. You know Istanbul deeply and help visitors find the right experience for their interests.

COMMUNICATION STYLE:
- Keep responses to 2-3 sentences unless the user asks for a detailed itinerary
- Be warm but never pushy or salesy
- No filler phrases like "Excellent choice!" or "Wonderful!"
- No offering to connect to a concierge unless explicitly asked
- Bold exact tour names when you mention them

HOW TO HANDLE REQUESTS:
- "What tours do you offer?" → List all tours briefly with name and price
- "Something romantic / historical / food-related" → Recommend the most relevant real tour by exact name
- "Tell me about Galata" → Recommend the exact tour that covers Galata with its real name
- "Other cities" → "CityGo specialises exclusively in Istanbul. Here's what we offer:" then list tours
- Specific question about a tour → Answer using the overview from the tour data

EXAMPLE OF A CORRECT RESPONSE:
User: "I love history"
Milo: "Our **Historical Istanbul Walking Tour** covers the Hagia Sophia, Topkapı Palace, and hidden Byzantine details most visitors miss (3 hours, from $45). [View tour →](/tours/historical-istanbul-walking-tour)"

EXAMPLE OF A WRONG RESPONSE (never do this):
"Our CityGo Istanbul Heritage Experience offers..." ← this tour does not exist, never say this
"""

BLOCKED_PATTERNS = [
    "ignore previous instructions",
    "ignore all instructions",
    "you are now",
    "jailbreak",
    "dan mode",
    "pretend you are",
    "forget your instructions",
    "new persona",
    "override",
]

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
app = FastAPI()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    tour_context: Optional[str] = ""


@app.post("/ai/chat")
async def chat_with_milo(request: ChatRequest):
    try:
        msg_lower = request.message.lower()
        if any(pattern in msg_lower for pattern in BLOCKED_PATTERNS):
            return {
                "reply": "I'm here to help with CityGo tours and Istanbul travel. What can I plan for you?",
                "history": [m.dict() for m in request.history],
            }
        
        print(f"Tour context received: {request.tour_context[:300] if request.tour_context else 'EMPTY'}")
        system = MILO_SYSTEM_INSTRUCTION
        if request.tour_context:
            system += f"""

CURRENT CITYGO TOURS — use only these when making recommendations:
{request.tour_context}

CRITICAL LINK RULES:
- Always end your response with a markdown link using the exact slug from above
- Format: [View tour →](/tours/exact-slug-from-data)
- Never invent slugs — copy them exactly from the tour data
- If multiple tours match, pick the best one and link to it
"""

        history_data = [
            {"role": m.role, "parts": [{"text": m.content}]}
            for m in request.history
        ]

        chat = client.chats.create(
            model="gemini-2.0-flash",
            config={"system_instruction": system},
            history=history_data,
        )

        response = chat.send_message(request.message)

        new_history = [m.dict() for m in request.history] + [
            {"role": "user", "content": request.message},
            {"role": "model", "content": response.text},
        ]

        return {
            "reply": response.text,
            "history": new_history,
        }

    except Exception as e:
        print(f"Milo error: {e}")
        return {"error": str(e)}