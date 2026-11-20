# backend/app/routes/clothing.py
import os
import uuid
import json
import re
import io
import httpx
import base64
import asyncio  # Crucial import for retry delays
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from uuid import UUID
from supabase import create_client, Client
from dotenv import load_dotenv

# Import Pillow image processing libraries
from PIL import Image
import pillow_avif  # Automatically registers AVIF support on import

load_dotenv()

from app.database.connection import get_db
from app.database.models import ClothingItem, User
from app.core.deps import get_current_user
from app.schemas.clothing import (
    ClothingItemCreate, ClothingItemUpdate, ClothingItemResponse,
    ImageScanRequest, ClothingItemScanResponse
)

router = APIRouter(prefix="/api/wardrobe", tags=["Warmrobe"])

# Initialize secure Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase_client: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and "secret" not in SUPABASE_SERVICE_ROLE_KEY.lower():
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"❌ Error initializing Supabase storage client: {e}")

# Load Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# 1. ULTRA-FAST GROQ QWEN 3.6 VISION SCANNER (STABILIZED WITH IN-MEMORY JPEG CONVERSION)
@router.post("/scan", response_model=ClothingItemScanResponse)
async def scan_clothing_image(
    payload: ImageScanRequest,
    current_user: User = Depends(get_current_user)
):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GROQ_API_KEY is missing from the server configuration."
        )
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase client is not configured on the server."
        )

    system_prompt = (
        "You are an elite AI personal fashion stylist. Analyze this clothing item image. "
        "Your task is to identify its features and respond ONLY with a strictly formatted JSON object. "
        "Do not write any introduction, markdown, backticks, or explanation. "
        "The JSON object must have exactly these keys and follow these guidelines:\n"
        "{\n"
        "  \"name\": \"A clear, descriptive title for the item (e.g., 'Tailored Charcoal Blazer')\",\n"
        "  \"category\": \"Must be exactly one of: 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Dresses'\",\n"
        "  \"subcategory\": \"A specific sub-type (e.g., 't-shirt', 'dress', 'boots')\",\n"
        "  \"color\": \"The primary dominant color of the item (e.g., 'Black', 'Olive')\",\n"
        "  \"style_tag\": \"Must be exactly one of: 'Casual', 'Minimal', 'Streetwear', 'Formal', 'Sporty', 'Vintage', 'Elegant'\"\n"
        "}"
    )

    try:
        # A. Download the image privately from your Supabase bucket
        if "/wardrobe/" not in payload.image_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image URL format. Must be a Supabase storage URL."
            )
            
        filepath = payload.image_url.split("/wardrobe/")[-1]
        img_bytes = supabase_client.storage.from_("wardrobe").download(filepath)
        
        # B. STABILIZATION: Convert the downloaded image to a standardized JPEG in-memory.
        # This bypasses any AI API format limits (like AVIF or HEIC incompatibilities) entirely.
        image = Image.open(io.BytesIO(img_bytes))
        
        # Convert to standard RGB to prevent JPEG transparency conflicts (like PNG alpha channel)
        if image.mode in ("RGBA", "LA", "P"):
            image = image.convert("RGB")
            
        # Convert to high-quality standard JPEG in memory
        jpeg_io = io.BytesIO()
        image.save(jpeg_io, format="JPEG", quality=85)
        jpeg_bytes = jpeg_io.getvalue()
        
        # C. Base64 encode the perfectly standardized JPEG
        base64_data = base64.b64encode(jpeg_bytes).decode('utf-8')
        detected_mime_type = "image/jpeg"
        
        # D. Query Groq's high-speed OpenAI-compatible endpoint using Qwen 3.6 Vision (27B)
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        groq_payload = {
            "model": "qwen/qwen3.6-27b",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{detected_mime_type};base64,{base64_data}"
                            }
                        }
                    ]
                }
            ],
            "response_format": {"type": "json_object"},  # Forces strict JSON structure output
            "temperature": 0.2
        }

        # Retry configuration to handle rate-limits (429) or temporary capacity spikes (503) silently
        max_retries = 3
        backoff_delay = 1.5  # seconds
        last_error = ""

        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(1, max_retries + 1):
                try:
                    response = await client.post(groq_url, headers=headers, json=groq_payload)
                    
                    if response.status_code == 200:
                        # Success: Parse JSON and return immediately
                        result = response.json()
                        raw_json_output = result["choices"][0]["message"]["content"].strip()
                        
                        try:
                            return json.loads(raw_json_output)
                        except json.JSONDecodeError:
                            json_match = re.search(r"\{.*\}", raw_json_output, re.DOTALL)
                            if json_match:
                                return json.loads(json_match.group(0))
                            raise
                            
                    elif response.status_code in [429, 503]:
                        # Server Busy / Rate Limit: Print log and wait
                        print(f"⚠️ Groq API returned {response.status_code} (Attempt {attempt}/{max_retries}). Retrying in {backoff_delay}s...")
                        last_error = f"Status {response.status_code}: {response.text}"
                        await asyncio.sleep(backoff_delay)
                        continue
                    else:
                        # Non-retryable error (e.g., 400 Bad Request)
                        print(f"❌ Non-retryable Groq error (Status {response.status_code}): {response.text}")
                        raise Exception(f"Groq API Error: Status {response.status_code} - {response.text}")
                        
                except Exception as e:
                    print(f"⚠️ Attempt {attempt}/{max_retries} failed with error: {e}")
                    last_error = str(e)
                    if attempt < max_retries:
                        await asyncio.sleep(backoff_delay)
                    continue
            
            raise Exception(f"Failed to scan image after {max_retries} attempts. Last error: {last_error}")

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Groq Vision Scanner failed. Reason: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Scan failed: {str(e)}"
        )

# 2. IMAGE UPLOAD ROUTE (Supabase Storage) - Robust to browser MIME wrapping
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_clothing_image(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage client is not configured on the server."
        )
    
    # Clean and strip potential quotes or blank spaces around filename
    clean_filename = file.filename.strip("\"' ")
    file_extension = clean_filename.split(".")[-1].lower() if "." in clean_filename else ""
    
    # LIVE DEBUG LOGGING: Tells you exactly what the server sees
    print(f"📥 UPLOAD REQUEST: filename='{file.filename}' -> cleaned='{clean_filename}' (ext: '.{file_extension}')")

    allowed_extensions = {"jpg", "jpeg", "png", "webp", "heic", "heif", "avif", "bmp", "tiff", "gif"}
    
    if file_extension not in allowed_extensions:
        print(f"❌ REJECTED: Extension '.{file_extension}' is not in approved list.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '.{file_extension}'. Only JPEG, PNG, WEBP, and HEIC images are allowed."
        )
        
    # Map raw extension to correct MIME type for Supabase storage metadata
    mime_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "heic": "image/heic",
        "heif": "image/heif",
        "avif": "image/avif",
        "bmp": "image/bmp",
        "gif": "image/gif",
        "tiff": "image/tiff"
    }
    detected_mime = mime_map.get(file_extension, "image/jpeg")
    
    try:
        file_content = await file.read()
        unique_filename = f"{current_user.id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload privately to the 'wardrobe' bucket on Supabase using corrected MIME meta
        supabase_client.storage.from_("wardrobe").upload(
            path=unique_filename,
            file=file_content,
            file_options={"content-type": detected_mime}
        )
        public_url = supabase_client.storage.from_("wardrobe").get_public_url(unique_filename)
        print(f"✅ UPLOAD SUCCESSFUL: URL={public_url}")
        return {"image_url": public_url}
    except Exception as e:
        print(f"❌ UPLOAD FAILED: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

# 3. ADD A NEW CLOTHING ITEM
@router.post("", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
def add_clothing_item(
    item_data: ClothingItemCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_item = ClothingItem(
        **item_data.model_dump(),
        user_id=current_user.id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# 4. GET ALL CLOTHING ITEMS (Filtered by logged-in user)
@router.get("", response_model=List[ClothingItemResponse])
def list_wardrobe(
    category: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id)
    if category:
        query = query.filter(ClothingItem.category == category)
    return query.all()

# 5. GET A SPECIFIC CLOTHING ITEM
@router.get("/{item_id}", response_model=ClothingItemResponse)
def get_clothing_item(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to view it."
        )
    return item

# 6. UPDATE A CLOTHING ITEM
@router.put("/{item_id}", response_model=ClothingItemResponse)
def update_clothing_item(
    item_id: UUID, 
    update_data: ClothingItemUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to edit it."
        )
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

# 7. DELETE A CLOTHING ITEM
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clothing_item(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to delete it."
        )
    db.delete(item)
    db.commit()
    return

# 8. TOGGLE FAVORITE STATUS (PATCH)
@router.patch("/{item_id}/favorite", response_model=ClothingItemResponse)
def toggle_favorite(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to modify it."
        )
    item.is_favorite = not item.is_favorite
    db.commit()
    db.refresh(item)
    return item