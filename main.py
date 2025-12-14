import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# --- CORS সেটআপ (খুবই গুরুত্বপূর্ণ) ---
# এটি আপনার ফোনের ব্রাউজারের থেকে সার্ভারের অনুরোধ গ্রহণ করবে
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# কমান্ড রাখার মেমোরি
command_queue: List[Dict[str, str]] = []


class Command(BaseModel):
    action: str
    details: str


@app.get("/")
def home():
    return {"message": "Relay Server is Running! Waiting for Phone..."}


@app.post("/send_command")
def send_command(cmd: Command):
    print(f"📥 AI Command: {cmd.action} -> {cmd.details}")
    command_queue.append(cmd.dict())
    return {"status": "queued", "message": "Command sent to phone"}


@app.get("/get_pending_command")
def get_pending_command():
    if command_queue:
        return command_queue.pop(0)
    return {"action": "none"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
