import json
import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel, Field
from pypdf import PdfReader
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------
# ENV SETUP
# -----------------------------

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables")

client = Groq(api_key=api_key)

MODEL = "openai/gpt-oss-120b"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------
# GLOBAL STATE
# -----------------------------

CURRENT_RESUME = None
CONVERSATION_HISTORY = []

# -----------------------------
# MODELS
# -----------------------------


class Experience(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: str | None = None
    skills_used: list[str] = Field(default_factory=list)


class Resume(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None

    total_experience_years: float | None = None

    skills: list[str] = Field(default_factory=list)
    experiences: list[Experience] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    question: str


resume_schema = Resume.model_json_schema()

# -----------------------------
# PDF READER
# -----------------------------


def read_pdf(file_path: Path) -> str:

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


# -----------------------------
# RESUME PARSER
# -----------------------------


def parse_resume(resume_text: str) -> Resume:

    system_prompt = f"""
Extract structured resume data from the provided resume text.

Return only valid JSON matching this schema:
{json.dumps(resume_schema, indent=2)}

Use only information present in the resume. Use null for missing scalar
values and empty lists for missing collections. Do not invent details.
"""

    user_prompt = f"""
Parse the following resume:

{resume_text}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    raw_output = response.choices[0].message.content

    try:
        data = json.loads(raw_output)
        return Resume(**data)

    except Exception as e:
        print("Resume Parsing Failed")
        print(raw_output)
        raise e


# -----------------------------
# CHAT STREAMING
# -----------------------------


def stream_candidate_answer(
    question: str,
    resume: Resume,
) -> Generator[str, None, None]:

    global CONVERSATION_HISTORY

    system_prompt = f"""
You are an AI assistant representing a job candidate.

Candidate Resume:

{resume.model_dump_json(indent=2)}

Rules:

1. Answer in first person.

2. Use ONLY resume information.

3. Never invent:
   - skills
   - projects
   - companies
   - dates
   - achievements

4. If information is missing, say:

"I don't have enough information to answer that."

5. Be concise and professional.

6. Act as if HR is interviewing the candidate.

7. When listing multiple items (projects, skills, experiences), use a
   dash ("-") at the start of each line instead of numbers. Never use
   "1.", "2.", etc. for lists.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        *CONVERSATION_HISTORY,
        {
            "role": "user",
            "content": question,
        },
    ]

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
        temperature=0.2,
    )

    full_response = ""

    for chunk in response:

        delta = chunk.choices[0].delta.content

        if delta:

            full_response += delta

            yield delta

    CONVERSATION_HISTORY.append(
        {
            "role": "user",
            "content": question,
        }
    )

    CONVERSATION_HISTORY.append(
        {
            "role": "assistant",
            "content": full_response,
        }
    )

    # prevent unlimited growth

    if len(CONVERSATION_HISTORY) > 20:
        CONVERSATION_HISTORY = CONVERSATION_HISTORY[-20:]
    # prevent unlimited growth

    if len(CONVERSATION_HISTORY) > 20:
        CONVERSATION_HISTORY = CONVERSATION_HISTORY[-20:]


# -----------------------------
# STARTUP
# -----------------------------


@app.on_event("startup")
def startup():

    global CURRENT_RESUME

    resume_path = Path("my_resume.pdf")

    if resume_path.exists():

        print("Loading Resume...")

        text = read_pdf(resume_path)

        CURRENT_RESUME = parse_resume(text)

        print("Resume Loaded")

    else:

        print("No resume found")


# -----------------------------
# ROUTES
# -----------------------------


@app.get("/")
def home():

    if CURRENT_RESUME:

        return {
            "message": "Resume loaded successfully",
            "candidate": CURRENT_RESUME.name,
        }

    return {
        "message": "No resume loaded"
    }


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    global CURRENT_RESUME
    global CONVERSATION_HISTORY

    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files allowed",
        )

    save_path = Path("uploaded_resume.pdf")

    with open(save_path, "wb") as f:
        f.write(await file.read())

    text = read_pdf(save_path)

    CURRENT_RESUME = parse_resume(text)

    CONVERSATION_HISTORY.clear()

    return {
        "message": "Resume uploaded successfully",
        "candidate": CURRENT_RESUME.name,
    }
@app.get("/resume")
def get_resume():

    if CURRENT_RESUME is None:
        raise HTTPException(
            status_code=404,
            detail="No resume loaded",
        )

    return CURRENT_RESUME.model_dump()

@app.post("/chat")
def chat(request: ChatRequest):

    if CURRENT_RESUME is None:

        raise HTTPException(
            status_code=400,
            detail="Upload a resume first",
        )

    return StreamingResponse(
        stream_candidate_answer(
            request.question,
            CURRENT_RESUME,
        ),
        media_type="text/plain",
    )


@app.post("/reset")
def reset_chat():

    global CONVERSATION_HISTORY

    CONVERSATION_HISTORY.clear()

    return {
        "message": "Conversation reset"
    }