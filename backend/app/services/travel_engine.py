# backend/app/services/travel_engine.py
import re
from typing import List, Dict, Any
from app.database.models import ClothingItem

NEUTRAL_COLORS = {"black", "white", "grey", "gray", "navy", "beige", "cream", "brown", "denim", "khaki"}

def classify_clothing_item(item: ClothingItem) -> str:
    """
    Bulletproof classifier:
    Returns: 'accessories', 'shoes', 'dresses', 'outerwear', 'tops', 'bottoms'
    Strictly prevents 'short-sleeve shirt' from ever being categorized as bottoms.
    """
    cat = (item.category or "").strip().lower()
    name = (item.name or "").strip().lower()
    subcat = (getattr(item, "subcategory", "") or "").strip().lower()
    text = f"{cat} {name} {subcat}".lower()

    # 1. ACCESSORIES (Check FIRST so watches/bracelets are never shirts)
    if any(k in text for k in [
        "bracelet", "watch", "belt", "sunglass", "glasses", "hat", "cap", 
        "ring", "necklace", "jewelry", "jewellery", "bag", "handbag", 
        "tote", "backpack", "wallet", "scarf", "tie", "bowtie", "accessory", "accessories"
    ]) or "accessor" in cat:
        return "accessories"

    # 2. FOOTWEAR / SHOES
    if any(k in text for k in [
        "shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "loafer", "loafers", 
        "heel", "heels", "sandal", "sandals", "footwear", "runner", "runners", 
        "trainer", "trainers", "slide", "slides", "flip-flop", "mule"
    ]) or "shoe" in cat or "footwear" in cat:
        return "shoes"

    # 3. DRESSES / ONE-PIECE (Women's Looks)
    if any(k in text for k in [
        "dress", "gown", "jumpsuit", "romper", "one-piece", "onepiece", 
        "sundress", "maxi dress", "midi dress", "mini dress"
    ]) or "dress" in cat:
        return "dresses"

    # 4. OUTERWEAR / JACKETS
    if any(k in text for k in [
        "outerwear", "jacket", "jackets", "coat", "coats", "blazer", "blazers", 
        "cardigan", "cardigans", "hoodie", "hoodies", "trench", "windbreaker", 
        "bomber", "puffer", "overshirt", "shacket"
    ]) or "outer" in cat:
        return "outerwear"

    # 5. TOPS (Checked BEFORE bottoms so 'short-sleeve' is recognized as a TOP!)
    if any(k in text for k in [
        "top", "tops", "shirt", "shirts", "t-shirt", "t-shirts", "tshirt", "tshirts", 
        "tee", "tees", "polo", "polos", "tank", "tank top", "blouse", "blouses", 
        "crop top", "camisole", "compression shirt", "button-down", "sweater", 
        "sweaters", "pullover", "jersey", "sleeve"
    ]) or "top" in cat:
        return "tops"

    # 6. BOTTOMS (Jeans, Pants, Sweatpants, Shorts, Skirts)
    if any(k in text for k in [
        "bottom", "bottoms", "pant", "pants", "jean", "jeans", "trouser", "trousers", 
        "sweatpant", "sweatpants", "short", "shorts", "jogger", "joggers", "chino", 
        "chinos", "skirt", "skirts", "cargo", "cargos", "legging", "leggings"
    ]) or "bottom" in cat:
        return "bottoms"

    return "tops"

def score_item_versatility(item: ClothingItem, trip_type: str, temp_c: int) -> int:
    score = 10
    item_color = (item.color or "").lower()
    if any(n in item_color for n in NEUTRAL_COLORS):
        score += 8

    tag = (item.style_tag or "casual").lower()
    t_type = trip_type.lower()
    if "business" in t_type:
        if tag in ["minimal", "smart casual", "formal", "elegant"]:
            score += 10
    elif "date" in t_type or "romantic" in t_type:
        if tag in ["elegant", "minimal", "smart casual", "vintage"]:
            score += 10
    elif "adventure" in t_type or "explorer" in t_type:
        if tag in ["sporty", "casual", "streetwear"]:
            score += 10
    else:
        if tag in ["casual", "streetwear", "minimal", "smart casual"]:
            score += 10

    if getattr(item, "is_favorite", False):
        score += 5

    return score

def generate_travel_capsule(
    wardrobe: List[ClothingItem],
    duration: int,
    trip_type: str,
    weather_info: Dict[str, Any]
) -> Dict[str, Any]:
    temp_c = weather_info.get("avg_temp_c", 21)
    is_cold = temp_c < 19

    # Strict Category Segregation
    tops = []
    dresses = []
    bottoms = []
    shoes = []
    outerwear = []
    accessories = []

    for item in wardrobe:
        classification = classify_clothing_item(item)
        if classification == "accessories":
            accessories.append(item)
        elif classification == "shoes":
            shoes.append(item)
        elif classification == "bottoms":
            bottoms.append(item)
        elif classification == "outerwear":
            outerwear.append(item)
        elif classification == "dresses":
            dresses.append(item)
        else:
            tops.append(item)

    if not tops and not dresses:
        raise ValueError("Please add at least one Top or Dress to your wardrobe before building a packing plan.")

    # Rank categories by versatility
    ranked_tops = sorted(tops, key=lambda x: score_item_versatility(x, trip_type, temp_c), reverse=True)
    ranked_dresses = sorted(dresses, key=lambda x: score_item_versatility(x, trip_type, temp_c), reverse=True)
    ranked_bottoms = sorted(bottoms, key=lambda x: score_item_versatility(x, trip_type, temp_c), reverse=True)
    ranked_shoes = sorted(shoes, key=lambda x: score_item_versatility(x, trip_type, temp_c), reverse=True)
    ranked_outerwear = sorted(outerwear, key=lambda x: score_item_versatility(x, trip_type, temp_c), reverse=True)
    ranked_accessories = sorted(accessories, key=lambda x: score_item_versatility(x, trip_type, temp_c), reverse=True)

    # Capsule quantity targets
    num_bottoms_needed = max(1, min(len(ranked_bottoms), (duration + 1) // 2)) if ranked_bottoms else 0
    num_shoes_needed = min(len(ranked_shoes), 2 if duration >= 4 else 1)
    num_jackets_needed = min(len(ranked_outerwear), 2 if (is_cold and duration >= 5) else (1 if (is_cold and ranked_outerwear) else (1 if ranked_outerwear else 0)))

    capsule_bottoms = ranked_bottoms[:num_bottoms_needed] if ranked_bottoms else []
    capsule_shoes = ranked_shoes[:num_shoes_needed] if ranked_shoes else []
    capsule_outerwear = ranked_outerwear[:num_jackets_needed] if ranked_outerwear else []

    itinerary = []
    packed_items_set = set()

    top_idx = 0
    dress_idx = 0
    bottom_idx = 0
    jacket_idx = 0
    acc_idx = 0

    for day in range(1, duration + 1):
        day_items = []
        
        # Decide between One-Piece Dress (Girls) OR Two-Piece (Top + Bottom)
        can_use_dress = bool(ranked_dresses) and (day % 3 == 0 or not capsule_bottoms)
        
        chosen_top_name = ""
        chosen_bottom_name = ""

        if can_use_dress and ranked_dresses:
            # 👗 SCENARIO A: Dress / One-Piece (NO BOTTOM REQUIRED)
            chosen_dress = ranked_dresses[dress_idx % len(ranked_dresses)]
            dress_idx += 1
            day_items.append(chosen_dress)
            chosen_top_name = chosen_dress.name
            title = f"Day {day}: {trip_type} One-Piece Ensemble"
        else:
            # 👔 + 👖 SCENARIO B: Top + Bottom (Men & Women)
            if ranked_tops:
                chosen_top = ranked_tops[top_idx % len(ranked_tops)]
                top_idx += 1
                day_items.append(chosen_top)
                chosen_top_name = chosen_top.name
                
            if capsule_bottoms:
                chosen_bottom = capsule_bottoms[bottom_idx % len(capsule_bottoms)]
                # Rotate bottoms every 2 days
                if day % 2 == 0:
                    bottom_idx += 1
                day_items.append(chosen_bottom)
                chosen_bottom_name = chosen_bottom.name
                
            title = f"Day {day}: {trip_type} Coordinated Look"

        # 👟 Footwear Selection
        if capsule_shoes:
            chosen_shoes = capsule_shoes[(day - 1) % len(capsule_shoes)]
            day_items.append(chosen_shoes)

        # 🧥 Outerwear Selection (if cold)
        chosen_jacket = None
        if is_cold and capsule_outerwear:
            chosen_jacket = capsule_outerwear[jacket_idx % len(capsule_outerwear)]
            jacket_idx += 1
            day_items.append(chosen_jacket)

        # ⌚ Accent Accessory Selection
        chosen_acc = None
        if ranked_accessories:
            chosen_acc = ranked_accessories[acc_idx % len(ranked_accessories)]
            acc_idx += 1
            day_items.append(chosen_acc)

        # Craft structured description
        desc_parts = []
        if chosen_bottom_name:
            desc_parts.append(f"Pairing {chosen_top_name} with {chosen_bottom_name}")
        else:
            desc_parts.append(f"Styling your {chosen_top_name}")
            
        if capsule_shoes:
            desc_parts.append(f"grounded by {day_items[2].name if len(day_items) > 2 else 'clean footwear'}")
            
        if chosen_jacket:
            desc_parts.append(f"layered with {chosen_jacket.name} for the {temp_c}°C weather")
            
        if chosen_acc:
            desc_parts.append(f"accented by {chosen_acc.name}")

        desc = f"Balanced look. {', '.join(desc_parts)}."

        for item in day_items:
            packed_items_set.add(item)

        itinerary.append({
            "day": day,
            "title": title,
            "description": desc,
            "items": day_items
        })

    packed_items = list(packed_items_set)

    # Accurate Counts
    tops_count = len(set(it.id for it in packed_items if it in ranked_tops or it in ranked_dresses))
    bottoms_count = len(set(it.id for it in packed_items if it in capsule_bottoms))
    shoes_count = len(set(it.id for it in packed_items if it in capsule_shoes))
    outerwear_count = len(set(it.id for it in packed_items if it in capsule_outerwear))

    return {
        "itinerary": itinerary,
        "packed_items": packed_items,
        "counts": {
            "tops": tops_count or len(ranked_tops[:duration]),
            "bottoms": bottoms_count or len(capsule_bottoms),
            "shoes": shoes_count or len(capsule_shoes),
            "outerwear": outerwear_count or len(capsule_outerwear),
            "total_pieces": len(packed_items)
        }
    }