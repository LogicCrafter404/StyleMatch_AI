# backend/app/routes/preferences.py
import math
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.connection import get_db
from app.database.models import StylePreference, ClothingItem, User
from app.core.deps import get_current_user
from app.schemas.preferences import StylePreferenceUpdate, StylePreferenceResponse

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

# Comprehensive Color-to-HEX mapping for dynamic wardrobe swatches
COLOR_HEX_MAP = {
    # Dark & Neutrals
    "black": "#18181B",
    "noir": "#09090B",
    "charcoal": "#27272A",
    "white": "#F4F4F5",
    "off-white": "#FAFAF9",
    "cream": "#FEF3C7",
    "grey": "#71717A",
    "gray": "#71717A",
    "silver": "#E4E4E7",
    "slate": "#475569",
    "beige": "#D97706",
    "tan": "#B45309",
    "khaki": "#A16207",
    "brown": "#78350F",
    "camel": "#C2410C",
    "sand": "#FDE68A",
    
    # Blues & Indigos
    "blue": "#2563EB",
    "navy": "#1E3A8A",
    "navy blue": "#1E3A8A",
    "dark blue": "#1E293B",
    "sky blue": "#38BDF8",
    "cyan": "#06B6D4",
    "teal": "#0D9488",
    "indigo": "#4338CA",
    "denim": "#1D4ED8",
    
    # Greens & Earth Tones
    "olive": "#4D7C0F",
    "olive green": "#4D7C0F",
    "green": "#16A34A",
    "dark green": "#14532D",
    "sage": "#84A98C",
    "sage green": "#84A98C",
    "mint": "#6EE7B7",
    "emerald": "#059669",
    "forest green": "#1B4332",
    
    # Reds, Warm & Pastels
    "red": "#DC2626",
    "maroon": "#881337",
    "burgundy": "#4C0519",
    "crimson": "#991B1B",
    "rust": "#9A3412",
    "orange": "#EA580C",
    "coral": "#FB7185",
    "peach": "#FDBA74",
    "pink": "#DB2777",
    "rose": "#E11D48",
    "blush": "#FBCFE8",
    "magenta": "#C026D3",
    "purple": "#9333EA",
    "violet": "#7C3AED",
    "lavender": "#C084FC",
    "lilac": "#D8B4FE",
    "yellow": "#CA8A04",
    "mustard": "#B45309",
    "gold": "#EAB308",
}

def get_color_hex(color_name: str) -> str:
    cleaned = (color_name or "").strip().lower()
    # Check for direct or substring match
    for key, hex_val in COLOR_HEX_MAP.items():
        if key == cleaned or key in cleaned:
            return hex_val
    return "#8B5CF6"  # Luxury violet default for custom colors

@router.get("", response_model=StylePreferenceResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.expire_all()
    pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()
    if not pref:
        pref = StylePreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("", response_model=StylePreferenceResponse)
def update_preferences(
    payload: StylePreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()
    if not pref:
        pref = StylePreference(user_id=current_user.id)
        db.add(pref)
    
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(pref, key, value)
        
    db.commit()
    db.refresh(pref)
    db.expire_all()
    return pref

# =========================================================
# REAL-TIME LIVE-SYNCHRONIZED STYLE DNA CALCULATOR
# =========================================================
@router.get("/dna")
def get_style_dna(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # Hard-prevent browser caching so new clothes reflect instantly
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    db.expire_all()

    # 1. Fetch live updated wardrobe
    items = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()

    total_items = len(items)

    # 2. Extract Profile Sizing & Motto
    raw_shoe = str(getattr(pref, "shoe_size", "") or getattr(current_user, "shoe_size", "") or "").strip()
    raw_shirt = str(getattr(pref, "shirt_size", "") or getattr(current_user, "shirt_size", "") or "").strip()

    if raw_shoe:
        clean_num = raw_shoe.upper().replace("US", "").replace("UK", "").replace("EU", "").strip()
        formatted_shoe = f"US {clean_num}" if clean_num else "US 10"
    else:
        formatted_shoe = "Not Set"

    formatted_shirt = raw_shirt if raw_shirt else "M"
    motto = pref.bio.strip() if (pref and pref.bio and pref.bio.strip()) else "Curating effortless confidence through mindful silhouettes."

    # 3. Dynamic Style Composition
    style_counts = Counter()
    for item in items:
        if item.style_tag and item.style_tag.strip():
            style_counts[item.style_tag.strip().title()] += 1
    
    if pref and pref.styles:
        for s in pref.styles:
            if s and s.strip():
                style_counts[s.strip().title()] += 2

    if not style_counts:
        style_counts = Counter({"Sporty": 50, "Minimalist": 50})

    total_style_weights = sum(style_counts.values()) or 1
    composition = [
        {"label": k, "value": max(5, round((v / total_style_weights) * 100))}
        for k, v in style_counts.most_common(5)
    ]
    
    sum_comp = sum(x["value"] for x in composition)
    if sum_comp > 0:
        for x in composition:
            x["value"] = round((x["value"] / sum_comp) * 100)

    # 4. Compute Live Color Palette DNA across all actual wardrobe pieces
    color_counts = Counter()
    for item in items:
        if item.color and item.color.strip():
            color_counts[item.color.strip().title()] += 1

    palette = []
    if color_counts:
        top_colors = color_counts.most_common(6)  # Track up to top 6 diverse colors
        total_colored = sum(color_counts.values())
        for c_name, count in top_colors:
            palette.append({
                "name": c_name,
                "hex": get_color_hex(c_name),
                "count": count,
                "percentage": round((count / total_colored) * 100)
            })
    else:
        palette = [
            {"name": "Noir Black", "hex": "#18181B", "count": 0, "percentage": 50},
            {"name": "Pure White", "hex": "#F4F4F5", "count": 0, "percentage": 50}
        ]

    # 5. Compute Real Category Breakdown
    cat_counts = Counter()
    for item in items:
        cat_key = (item.category or "Other").strip().title()
        cat_counts[cat_key] += 1

    category_list = []
    expected_categories = ["Tops", "Bottoms", "Footwear", "Outerwear"]
    for cat in expected_categories:
        count = cat_counts.get(cat, cat_counts.get("Shoes" if cat == "Footwear" else cat, 0))
        pct = round((count / total_items) * 100) if total_items > 0 else 0
        category_list.append({"category": cat, "count": count, "percentage": pct})

    # 6. Dynamic Archetype & Versatility Score
    dominant_style = composition[0]["label"] if composition else "Sporty"
    secondary_style = composition[1]["label"] if len(composition) > 1 else "Minimalist"
    archetype_title = f"{dominant_style} & {secondary_style} Alchemist"

    tops_count = cat_counts.get("Tops", 0)
    bottoms_count = cat_counts.get("Bottoms", 0)
    shoes_count = cat_counts.get("Footwear", cat_counts.get("Shoes", 0))

    if total_items >= 3 and tops_count >= 1 and bottoms_count >= 1 and shoes_count >= 1:
        ratio_balance = min(tops_count, bottoms_count * 2) / max(1, tops_count)
        color_variety = min(1.0, len(color_counts) / 4)
        versatility_score = round(75 + (ratio_balance * 12) + (color_variety * 10))
        versatility_score = min(96, max(75, versatility_score))
    elif total_items > 0:
        versatility_score = round(55 + min(20, total_items * 5))
    else:
        versatility_score = 65

    # 7. Real-Time Observations
    insights = []
    if total_items == 0:
        insights.append("Your wardrobe is currently empty. Upload your first tops and bottoms to unlock real-time DNA analytics.")
    else:
        top_color_name = palette[0]["name"] if palette else "Neutral"
        top_color_pct = palette[0]["percentage"] if palette else 0
        insights.append(f"Your closet palette is heavily anchored in {top_color_name} ({top_color_pct}% of wardrobe items).")

        if tops_count > bottoms_count * 2:
            insights.append(f"You have {tops_count} tops for {bottoms_count} bottoms. Adding 1 versatile pair of relaxed pants will unlock 6+ new looks.")
        elif bottoms_count > tops_count:
            insights.append(f"Your bottom-to-top ratio is solid ({bottoms_count} bottoms vs {tops_count} tops), making outfit rotation effortless.")
        else:
            insights.append(f"Your silhouette balance is proportional with {tops_count} tops, {bottoms_count} bottoms, and {shoes_count} footwear pairs.")

        if pref and pref.bio:
            insights.append(f"Your personal motto '{pref.bio}' aligns with your dominant {dominant_style.lower()} rotations.")
        else:
            insights.append(f"Your {dominant_style.lower()} pieces pair effortlessly with your current footwear collection.")

    return {
        "archetype": {
            "title": archetype_title,
            "badge": f"{dominant_style.upper()} DOMINANT · HIGH VERSATILITY",
            "motto": motto,
            "versatility_score": versatility_score,
            "total_items": total_items,
            "shirt_size": formatted_shirt,
            "shoe_size": formatted_shoe,
        },
        "composition": composition,
        "colors": {
            "palette": palette,
            "preferred": pref.preferred_colors if pref and pref.preferred_colors else ["Black", "Olive", "Navy"],
            "avoided": pref.avoided_colors if pref and pref.avoided_colors else ["Neon"]
        },
        "categories": category_list,
        "insights": insights
    }