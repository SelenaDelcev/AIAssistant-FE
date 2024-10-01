from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
from openai import OpenAI, OpenAIError, RateLimitError, APIConnectionError, APIError
from beu import get_openai_client, rag_tool_answer, system_prompt
from pydub import AudioSegment
from myfunc.mssql import ConversationDatabase
import asyncio
import logging
import re
import io
import os
import PyPDF2
import docx
import json
import base64
import uuid

global thread_name
thread_name = f"{uuid.uuid4()}"

global prepared_message
prepared_message = {}

global context
context = {}

# Initialize the FastAPI app
app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app_name = "KremBot"
user_name = "positive"
# Configure CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CORS_URL"),
        "https://lemon-ocean-0a311af0f.5.azurestaticapps.net",
        "https://green-water-0c4c41f0f.5.azurestaticapps.net",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data model for incoming messages
class Message(BaseModel):
    role: str
    content: str
messages: Dict[str, List[Dict[str, str]]] = {}

class ChatRequest(BaseModel):
    message: Message
    play_audio_response: Optional[bool] = False
    language: Optional[str] = "sr"

class FeedbackRequest(BaseModel):
    sessionId: str
    status: str 
    feedback: str 
    lastQuestion: str 
    lastAnswer: str

# Function for generating an audio response.
async def generate_audio_response(full_response):
    client = get_openai_client()
    spoken_response = client.audio.speech.create(
        model="tts-1-hd",
        voice="nova",
        input=full_response,
    )
    spoken_response_bytes = spoken_response.read()
    buffer = io.BytesIO(spoken_response_bytes)
    buffer.seek(0)
    audio_base64 = base64.b64encode(buffer.read()).decode()
    return audio_base64

# Function for initializing user session.
def initialize_session(request, messages: Dict[str, List[Dict[str, str]]], system_prompt):
    session_id = request.headers.get("Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID not provided")
    if session_id not in messages:
        messages[session_id] = [{"role": "system", "content": system_prompt}]
    return session_id

# Function for reading .pdf files after upload.
def read_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = "".join(page.extract_text() for page in reader.pages)
    return text

# Function for reading .docx files after upload.
def read_docx(file):
    doc = docx.Document(file)
    text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
    return text

def get_thread_ids():
    with ConversationDatabase() as db:
        return db.list_threads(app_name, user_name)
            
# The endpoint is called from the frontend when the user sends a message. The message is accepted, prepared in this endpoint, and then stored in the messages variable.
@app.post('/chat')
async def chat_with_ai(
    request: Request,
    chat_request: ChatRequest,
):
    global thread_name
    message = chat_request.message
    play_audio_response = chat_request.play_audio_response
    language = chat_request.language

    session_id = initialize_session(request, messages, system_prompt)

    if len(messages[session_id]) == 1:
        thread_name = f"{uuid.uuid4()}"
    
    session_data = messages.get(session_id, [])
    session_data.append({"role": "meta", "play_audio_response": play_audio_response})
    messages[session_id] = session_data

    global context
    context = rag_tool_answer(message.content)

    if "sastanak sa nama" in context:
        link = "https://outlook.office365.com/book/Chatbot@positive.rs/"
        if language == 'sr': 
            return {"calendly": context}
        else:
             return {"calendly": f"Of course, you can schedule a meeting with us at the following link: <a href='{link}' target='_blank' class='custom-link'>here</a>"}
        
    global prepared_message
    prepared_message = {"role": "user", "content": [{"type": "text", "text": f"""
                Answer the following question from the user:
                {context}
                Using the following context, which comes directly from our database:
                {message.content}
                All the provided context is relevant and trustworthy, so make sure to base your answer strictly on the information above.
                Always write in Serbian. Always provide corresponding links from established knowledge base and do NOT generate or suggest any links that do not exist within it. 
                """}]}
        
    # Save the original user message
    messages[session_id].append({"role": "user", "content": message.content})

    response_data = {"detail": "Message received"}

    return response_data

# Endpoint used to send OpenAI messages and generate streamed messages.
@app.get('/chat/stream')
async def stream(session_id: str):
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID not provided")
    if session_id not in messages:
        raise HTTPException(status_code=400, detail="No messages found for session")
    
    session_data = messages.get(session_id, [])
    play_audio_response = False
    for item in session_data:
        if item.get("role") == "meta":
            play_audio_response = item.get("play_audio_response", False)

    client = get_openai_client()
    global prepared_message
    openai_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages[session_id] if msg["role"] != "meta"][:-1] + [prepared_message]
    async def event_generator():
        try:
            assistant_message_content = ""
            for response in client.chat.completions.create(
                model="gpt-4o",
                temperature=0.0,
                messages=openai_messages,
                stream=True,
            ):
                content = response.choices[0].delta.content or ""
                if content:
                    assistant_message_content += content
                    # Text formatting
                    formatted_content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', assistant_message_content)
                    formatted_content = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" target="_blank">\1</a>', formatted_content)
                    formatted_content = re.sub(r'(\d+)\.', r'<br>\1.', formatted_content)
                    formatted_content = re.sub(r'[\-\*•]\s', r'<br>• ', formatted_content)
                    # Adding a typing character
                    streaming_content = formatted_content + '▌'
                    json_data = json.dumps({'content': streaming_content})
                    yield f"data: {json_data}\n\n"
                    await asyncio.sleep(0.03)
            final_formatted_content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', assistant_message_content)
            final_formatted_content = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" target="_blank">\1</a>', final_formatted_content)
            final_formatted_content = re.sub(r'(\d+)\.', r'<br>\1.', final_formatted_content)
            final_formatted_content = re.sub(r'[\-\*•]\s', r'<br>• ', final_formatted_content)

            if play_audio_response:
                plain_text_content = re.sub(r'<.*?>', '', final_formatted_content)
                audio_response = await generate_audio_response(plain_text_content)
                final_json_data = json.dumps({'content': final_formatted_content, 'audio': audio_response})
            else:
                final_json_data = json.dumps({'content': final_formatted_content})
            yield f"data: {final_json_data}\n\n"
            messages[session_id].append({"role": "assistant", "content": final_formatted_content})

            with ConversationDatabase() as db:
                db.update_or_insert_sql_record(
                    app_name,
                    user_name,
                    thread_name,
                    messages[session_id]
                )

        except RateLimitError as e:
            if 'insufficient_quota' in str(e):
                logger.error("Potrošili ste sve tokene, kontaktirajte Positive za dalja uputstva")
                yield f"data: {json.dumps({'detail': 'Potrošili ste sve tokene, kontaktirajte Positive za dalja uputstva'})}\n\n"
            else:
                logger.error(f"Rate limit error: {str(e)}")
                yield f"data: {json.dumps({'detail': f'Rate limit error: {str(e)}'})}\n\n"
        except APIConnectionError as e:
            logger.error(f"Ne mogu da se povežem sa OpenAI API-jem: {e}")
            yield f"data: {json.dumps({'detail': f'Ne mogu da se povežem sa OpenAI API-jem: {e} pokušajte malo kasnije.'})}\n\n"
        except APIError as e:
            logger.error(f"Greška u API-ju: {e}")
            yield f"data: {json.dumps({'detail': f'Greška u API-ju: {e} pokušajte malo kasnije.'})}\n\n"
        except Exception as e:
            logger.error(f"Internal server error: {str(e)}")
            yield f"data: {json.dumps({'detail': f'Internal server error: {str(e)}'})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Generate a text description for the image.
async def process_image(image_content: bytes, mime_type: str):
    # Encode the image content to base64
    image_base64 = base64.b64encode(image_content).decode('utf-8')
    data_url_prefix = f"data:{mime_type};base64,{image_base64}"
    client = get_openai_client()
    # Create a request to OpenAI to describe the image
    response = client.chat.completions.create(
        model='o1-preview',
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Opiši šta se nalazi na slici?"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": data_url_prefix
                        }
                    }
                ]
            }
        ],
        max_tokens=300,
    )

    # Extract the description from the response
    description = response.choices[0].message.content
    return description

# The function is called when checking what type of file is uploaded and sends file/s to a specific function.
@app.post('/upload')
async def upload_file(
    request: Request,
    message: str = Form(...),
    files: List[UploadFile] = File(...),
):
    session_id = initialize_session(request, messages, system_prompt)
    try:
        all_text_content = ""
        for file in files:
            file_content = await file.read()

            text_content = ""
            if file.content_type == 'application/pdf':
                text_content = read_pdf(file.file)
            elif file.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                text_content = read_docx(file.file)
            elif file.content_type == 'text/plain':
                text_content = file_content.decode('utf-8')
            elif file.content_type in ['image/jpeg', 'image/png', 'image/webp']:
                text_content = await process_image(file_content, file.content_type)
            else:
                return {"detail": "Nije podržan ovaj tip datoteke"}

            all_text_content += text_content + "\n"

        messages[session_id].append({"role": "user", "content": message})
        logger.info(f"Messages: {messages[session_id]}")

        prepared_message_content = f"User message: {message}\nFile content:\n{all_text_content}"
        
        messages[session_id].append({"role": "user", "content": prepared_message_content})

    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload error: {str(e)}")

def convert_to_mp3(file_path, output_path):
    audio = AudioSegment.from_file(file_path, format="mp4")
    audio.export(output_path, format="mp3", bitrate="128k")
    return output_path

# The function is called when a voice message is recorded, the text is transcribed, and returned to the front end.   
@app.post("/transcribe")
async def transcribe_audio(blob: UploadFile = File(...), session_id: str = Form(...)):
    try:
        client = get_openai_client()
        
        mp4filePath = f"temp_{session_id}.mp4"
        with open(mp4filePath, "wb") as f:
            f.write(await blob.read())

        mp3filePath = f"temp_{session_id}.mp3"
        mp3file = convert_to_mp3(mp4filePath, mp3filePath)
       
        with open(mp3file, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="sr"
            )

        os.remove(mp4filePath)
        os.remove(mp3filePath)

        return {"transcript": response.text}
    except OpenAIError as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/feedback")
async def receive_feedback(feedback_request: FeedbackRequest):
    session_id = feedback_request.sessionId
    status = feedback_request.status
    feedback_text = feedback_request.feedback
    last_question = feedback_request.lastQuestion
    last_answer = feedback_request.lastAnswer

    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")
    
    global context
    try:
        with ConversationDatabase() as db:
            db.insert_feedback(
                thread_id=thread_name,
                app_name=app_name,
                previous_question=last_question,
                tool_answer=context,
                given_answer=last_answer,
                thumbs=status,
                feedback_text=feedback_text
            )    
        return {"detail": "Feedback received successfully"}
    except Exception as e:
        logger.error(f"Failed to save feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")
