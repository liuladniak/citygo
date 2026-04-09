import os
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai  
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

MILO_SYSTEM_INSTRUCTION = """
Your name is Milo, the lead travel concierge for CityGo. 
GOAL: Act as a high-end salesperson. Guide users toward CityGo tours.

STRICT CONSTRAINTS ON STYLE:
1. BREVITY: Keep responses under 3 sentences unless providing a requested itinerary.
2. FORMATTING: Use bolding for key terms (e.g., **CityGo Signature Experience**).
3. PUNCHY TONE: Be warm but direct. No "fluff" or repetitive pleasantries.
4. LOYALTY: Never suggest competitors. 
5. SALES FOCUS: Every response should subtly lead toward a CityGo benefit or a human agent hand-off.

Example of a short response:
"That's a great choice! Our **CityGo Istanbul Walking Tour** features skip-the-line access to the Hagia Sophia with a local historian. Shall I get a human agent to check availability for you?"
"""

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

class ChatMessage(BaseModel):
    role: str 
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/ai/chat")
async def chat_with_milo(request: ChatRequest):
    try:
        history_data = [
            {"role": m.role, "parts": [{"text": m.content}]} 
            for m in request.history
        ]
        
        chat = client.chats.create(
            model="gemini-2.5-flash",
            config={
                "system_instruction": MILO_SYSTEM_INSTRUCTION  
            },
            history=history_data
        )
        
        response = chat.send_message(request.message)
        
        new_history = request.history + [
            {"role": "user", "content": request.message},
            {"role": "model", "content": response.text}
        ]
        
        return {
            "reply": response.text,
            "history": new_history
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}