import re
import unicodedata

SENSITIVE_WORDS = [
    "fuck", "shit", "bitch", "asshole", "bastard", "dick", "pussy", "cunt", "nigger", "fag", "slut", "whore",
    "rape", "kill", "murder", "suicide", "terrorist", "bomb", "nazi", "hitler"
]

def normalize_text(text):
    # Remove accents, normalize unicode, lower case
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    return text.lower()

def contains_sensitive(text):
    text = normalize_text(text)
    # Match sensitive words even if embedded in other words (e.g., 'i'llkillyou' matches 'kill')
    pattern = r"(" + r"|".join([re.escape(word) for word in SENSITIVE_WORDS]) + r")"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        print(f"[DEBUG] Sensitive detected: '{match.group(0)}' in '{text}'")
    return match is not None
