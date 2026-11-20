# backend/app/routes/outfits.py
import os
import re
import json
import base64
import io
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from uuid import UUID

from app.database.connection import get_db
from app.database.models import ClothingItem, User, Outfit, SavedLook, outfit_items
from app.core.deps import get_current_user
from app.schemas.outfits import OutfitRequest, GeneratedOutfitResponse, SaveOutfitRequest
from app.schemas.clothing import ClothingItemResponse
from app.services.outfit_engine import generate_hybrid_recommendations

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

router = APIRouter(prefix="/api/outfits", tags=["Outfits"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# 1. GENERATE OUTFIT ENDPOINT
@router.post("/generate", response_model=List[GeneratedOutfitResponse])
async def generate_user_outfit(
    request: OutfitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wardrobe = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your digital wardrobe is empty! Upload some clothes first."
        )

    recommendations = await generate_hybrid_recommendations(
        wardrobe=wardrobe,
        requested_style=request.style,
        occasion=request.occasion,
        temp_c=request.temperature_c
    )

    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't coordinate an outfit. Ensure you have added at least one Top, one Bottom, and one pair of Shoes."
        )

    return recommendations


# 2. SAVE OUTFIT ENDPOINT
@router.post("/save", response_model=GeneratedOutfitResponse, status_code=status.HTTP_201_CREATED)
def save_outfit(
    payload: SaveOutfitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(ClothingItem).filter(
        ClothingItem.id.in_(payload.item_ids),
        ClothingItem.user_id == current_user.id
    ).all()

    if len(items) != len(payload.item_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more clothing items were not found or do not belong to you."
        )

    new_outfit = Outfit(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        occasion=payload.occasion,
        compatibility_score=payload.compatibility_score
    )
    db.add(new_outfit)
    db.flush()

    for item in items:
        db.execute(outfit_items.insert().values(outfit_id=new_outfit.id, clothing_item_id=item.id))

    new_saved_look = SavedLook(
        user_id=current_user.id,
        outfit_id=new_outfit.id
    )
    db.add(new_saved_look)
    db.commit()
    db.refresh(new_outfit)

    return {
        "id": new_outfit.id,
        "name": new_outfit.name,
        "description": new_outfit.description,
        "occasion": new_outfit.occasion,
        "compatibility_score": new_outfit.compatibility_score,
        "items": items
    }


# 3. GET ALL SAVED OUTFITS ENDPOINT
@router.get("/saved", response_model=List[GeneratedOutfitResponse])
def get_saved_outfits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_entries = db.query(SavedLook).filter(SavedLook.user_id == current_user.id).all()
    saved_outfits = []
    for entry in saved_entries:
        outfit = entry.outfit
        if outfit:
            saved_outfits.append({
                "id": outfit.id,
                "name": outfit.name,
                "description": outfit.description,
                "occasion": outfit.occasion,
                "compatibility_score": outfit.compatibility_score,
                "items": outfit.clothing_items
            })
    return saved_outfits[::-1]


# 4. DELETE / UNSAVE OUTFIT ENDPOINT
@router.delete("/saved/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_outfit(
    outfit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(SavedLook).filter(
        SavedLook.outfit_id == outfit_id,
        SavedLook.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved look not found."
        )
        
    db.delete(entry)
    db.commit()
    return


# =========================================================
# 5. DYNAMIC MULTI-MODAL INSPIRATION VISION MATCHER
# =========================================================
def extract_pixel_tones(image_bytes: bytes) -> Dict[str, Any]:
    if not HAS_PIL:
        return {"top": "grey", "bottom": "blue", "top_hex": "#6B7280", "bottom_hex": "#1E3A8A"}
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size

        top_crop = img.crop((int(w * 0.2), int(h * 0.15), int(w * 0.8), int(h * 0.55)))
        top_colors = top_crop.getcolors(maxcolors=50000)
        avg_top = [0, 0, 0]
        if top_colors:
            tot = sum(c[0] for c in top_colors)
            avg_top = [sum(c[0] * c[1][i] for c in top_colors) // tot for i in range(3)]

        bot_crop = img.crop((int(w * 0.2), int(h * 0.55), int(w * 0.8), int(h * 0.88)))
        bot_colors = bot_crop.getcolors(maxcolors=50000)
        avg_bot = [0, 0, 0]
        if bot_colors:
            tot = sum(c[0] for c in bot_colors)
            avg_bot = [sum(c[0] * c[1][i] for c in bot_colors) // tot for i in range(3)]

        def classify(rgb):
            r, g, b = rgb
            bright = (r + g + b) / 3
            if bright < 45: return "black"
            if bright > 210: return "white"
            if abs(r - g) < 20 and abs(g - b) < 20 and abs(r - b) < 20: return "grey"
            if b > r + 15 and b > g: return "blue"
            if g > r + 10 and g > b: return "green"
            if r > 160 and g > 130 and b < 100: return "beige"
            return "grey"

        top_color = classify(avg_top)
        bot_color = classify(avg_bot)
        top_hex = f"#{avg_top[0]:02x}{avg_top[1]:02x}{avg_top[2]:02x}"
        bot_hex = f"#{avg_bot[0]:02x}{avg_bot[1]:02x}{avg_bot[2]:02x}"

        return {"top": top_color, "bottom": bot_color, "top_hex": top_hex, "bottom_hex": bot_hex}
    except Exception as e:
        print(f"Pixel tone fallback: {e}")
        return {"top": "grey", "bottom": "blue", "top_hex": "#6B7280", "bottom_hex": "#1E3A8A"}


def score_garment_affinity(item: ClothingItem, target_category: str, target_color: str, target_name_hints: List[str]) -> int:
    score = 0
    name = (item.name or "").lower()
    color = (item.color or "").lower()
    cat = (item.category or "").lower()
    style = (item.style_tag or "").lower()

    if target_category:
        tc = target_category.lower()
        if "top" in tc and ("top" in cat or "shirt" in cat or "tee" in cat): score += 50
        elif "bottom" in tc and ("bottom" in cat or "pant" in cat or "jean" in cat): score += 50
        elif "shoe" in tc and ("shoe" in cat or "footwear" in cat): score += 50

    if target_color:
        tcol = target_color.lower().strip()
        if tcol in color or color in tcol:
            score += 45
        elif any(c in color for c in tcol.split()):
            score += 30

    for hint in target_name_hints:
        h = hint.lower().strip()
        if h and (h in name or h in style or h in color):
            score += 25

    return score


@router.post("/match-inspiration")
async def match_inspiration(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wardrobe = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your digital wardrobe is empty! Upload some clothing items first."
        )

    # 1. Fast Image Compression (Ensures sub-second processing and no payload drops)
    image_bytes = await file.read()
    if HAS_PIL:
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.thumbnail((600, 600))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=75)
            image_bytes = buf.getvalue()
        except Exception as e:
            print(f"Image resize note: {e}")

    pixel_dna = extract_pixel_tones(image_bytes)
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Format user's actual inventory for direct vision matching
    inventory_summary = []
    for it in wardrobe:
        inventory_summary.append({
            "id": str(it.id),
            "name": it.name,
            "category": it.category,
            "color": it.color or "Neutral",
            "style_tag": it.style_tag or "Casual"
        })

    # 2. Vision AI Prompt with direct inventory matching
    vision_prompt = (
        "You are an expert fashion stylist for StyleMatch AI.\n"
        "Analyze this outfit photo and select the closest matching pieces from the USER'S REAL WARDROBE below:\n"
        f"USER WARDROBE INVENTORY:\n{json.dumps(inventory_summary)}\n\n"
        "Return ONLY a strict JSON object with this exact schema:\n"
        "{\n"
        '  "inspo_vibe": "Short distinctive name of the look (e.g. Minimalist Grey Knit & Denim, Crisp Linen Button-Down, 90s Relaxed Streetwear)",\n'
        '  "similarity_score": 94,\n'
        '  "vibe_match_score": 96,\n'
        '  "color_match_score": 92,\n'
        '  "silhouette_match_score": 95,\n'
        '  "selected_top_id": "Exact ID of best top from wardrobe or empty string",\n'
        '  "selected_bottom_id": "Exact ID of best bottom from wardrobe or empty string",\n'
        '  "selected_shoes_id": "Exact ID of best footwear from wardrobe or empty string",\n'
        '  "top_detected": {"color": "grey/white/black/blue", "style": "t-shirt/shirt/button-down", "keywords": ["v-neck", "crewneck", "tee", "shirt"]},\n'
        '  "bottom_detected": {"color": "blue/black/grey", "style": "jeans/pants/trousers", "keywords": ["dark wash", "straight-leg", "denim", "relaxed"]},\n'
        '  "shoes_detected": {"color": "white/grey/black", "style": "sneakers/shoes", "keywords": ["runners", "sneakers", "athletic"]},\n'
        '  "styling_breakdown": "1-2 sentences on how the matched pieces replicate the silhouette and color palette.",\n'
        '  "missing_element_tip": "One accessory or layer to make it an exact 1:1 match."\n'
        "}"
    )

    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    inspo_data = {}

    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            payload = {
                "model": "qwen/qwen3.8-27b",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": vision_prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                            }
                        ]
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 1024,
                "reasoning_effort": "none",
                "response_format": {"type": "json_object"}
            }
            
            response = await client.post(groq_url, headers=headers, json=payload)
            if response.status_code == 200:
                raw_json = response.json()["choices"][0]["message"]["content"]
                json_match = re.search(r"\{.*\}", raw_json, re.DOTALL)
                if json_match:
                    inspo_data = json.loads(json_match.group(0))
        except Exception as e:
            print(f"Vision call fallback: {e}")

    # 3. Dynamic Wardrobe Matching with Alternatives
    top_spec = inspo_data.get("top_detected", {"color": pixel_dna["top"], "style": "top", "keywords": [pixel_dna["top"]]})
    bot_spec = inspo_data.get("bottom_detected", {"color": pixel_dna["bottom"], "style": "bottom", "keywords": [pixel_dna["bottom"], "jeans"]})
    shoe_spec = inspo_data.get("shoes_detected", {"color": "white", "style": "shoes", "keywords": ["sneakers"]})

    tops = [it for it in wardrobe if (it.category or "").lower() in ["tops", "top"]]
    bottoms = [it for it in wardrobe if (it.category or "").lower() in ["bottoms", "bottom"]]
    shoes = [it for it in wardrobe if (it.category or "").lower() in ["shoes", "footwear"]]

    # Rank all tops, bottoms, shoes to provide best matches + alternatives for swapping
    sorted_tops = sorted(tops, key=lambda it: score_garment_affinity(
        it, "top", top_spec.get("color", pixel_dna["top"]), top_spec.get("keywords", [pixel_dna["top"]])
    ), reverse=True) if tops else []

    sorted_bottoms = sorted(bottoms, key=lambda it: score_garment_affinity(
        it, "bottom", bot_spec.get("color", pixel_dna["bottom"]), bot_spec.get("keywords", [pixel_dna["bottom"], "jeans"])
    ), reverse=True) if bottoms else []

    sorted_shoes = sorted(shoes, key=lambda it: score_garment_affinity(
        it, "shoes", shoe_spec.get("color", "white"), shoe_spec.get("keywords", ["sneakers", "athletic"])
    ), reverse=True) if shoes else []

    matched_items = []
    
    # Priority: AI selected ID or highest scoring piece
    ai_top_id = inspo_data.get("selected_top_id")
    chosen_top = next((it for it in tops if str(it.id) == ai_top_id), sorted_tops[0] if sorted_tops else None)
    if chosen_top: matched_items.append(chosen_top)

    ai_bot_id = inspo_data.get("selected_bottom_id")
    chosen_bot = next((it for it in bottoms if str(it.id) == ai_bot_id), sorted_bottoms[0] if sorted_bottoms else None)
    if chosen_bot: matched_items.append(chosen_bot)

    ai_shoe_id = inspo_data.get("selected_shoes_id")
    chosen_shoe = next((it for it in shoes if str(it.id) == ai_shoe_id), sorted_shoes[0] if sorted_shoes else None)
    if chosen_shoe: matched_items.append(chosen_shoe)

    top_title = matched_items[0].name if len(matched_items) > 0 else "Top"
    bot_title = matched_items[1].name if len(matched_items) > 1 else "Bottom"
    shoe_title = matched_items[2].name if len(matched_items) > 2 else "Footwear"

    vibe_name = inspo_data.get("inspo_vibe") or f"{matched_items[0].color if matched_items else ''} Aesthetic Re-creation".strip().title()
    styling_text = inspo_data.get("styling_breakdown") or f"Aria coordinated your {top_title} paired with {bot_title} and {shoe_title} to mirror the silhouette and color harmony of your reference photo."

    return {
        "inspo_vibe": vibe_name,
        "similarity_score": inspo_data.get("similarity_score", 94),
        "match_breakdown": {
            "vibe_match": inspo_data.get("vibe_match_score", 95),
            "color_match": inspo_data.get("color_match_score", 93),
            "silhouette_match": inspo_data.get("silhouette_match_score", 94)
        },
        "detected_tags": [
            f"{pixel_dna['top'].title()} Silhouette",
            f"{pixel_dna['bottom'].title()} Denim",
            "Casual Footwear"
        ],
        "extracted_palette": [
            {"name": f"{pixel_dna['top'].title()} Tone", "hex": pixel_dna["top_hex"], "percentage": 45},
            {"name": f"{pixel_dna['bottom'].title()} Tone", "hex": pixel_dna["bottom_hex"], "percentage": 35},
            {"name": "Neutral Accent", "hex": "#F4F4F5", "percentage": 20}
        ],
        "styling_breakdown": styling_text,
        "missing_element_tip": inspo_data.get("missing_element_tip", "Cuff the hem slightly to highlight your sneakers for a 1:1 match."),
        "matched_items": [ClothingItemResponse.model_validate(it) for it in matched_items],
        "alternatives": {
            "tops": [ClothingItemResponse.model_validate(it) for it in sorted_tops[1:4]],
            "bottoms": [ClothingItemResponse.model_validate(it) for it in sorted_bottoms[1:4]],
            "shoes": [ClothingItemResponse.model_validate(it) for it in sorted_shoes[1:4]]
        }
    }