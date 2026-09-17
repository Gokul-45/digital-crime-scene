"""
NLP Engine — spaCy + pattern-based keyword extraction
Extracts forensically relevant information from witness statements.
"""
import re


# Forensics-relevant keyword lexicons
SUSPICIOUS_KEYWORDS = [
    "fled", "ran", "escaped", "hidden", "masked", "disguised",
    "weapon", "gun", "knife", "bat", "threatened", "forced",
    "aggressive", "nervous", "panicked", "shouted", "screamed",
    "motorcycle", "car", "vehicle", "speeding", "dark clothes",
    "hoodie", "alone", "quickly", "hurried", "suspicious"
]

CRIME_ACTION_WORDS = [
    "stolen", "theft", "robbery", "assault", "attacked", "hit",
    "grabbed", "snatched", "broke", "entered", "trespassed",
    "murdered", "killed", "fired", "shot", "stabbed"
]

TIME_PATTERNS = [
    r'\b\d{1,2}:\d{2}\s*[ap]m\b',
    r'\b\d{1,2}\s*[ap]m\b',
    r'\b(midnight|noon|dawn|dusk|morning|evening|afternoon|night)\b',
    r'\b(around|approximately|about)\s+\d{1,2}(:\d{2})?\s*[ap]m\b',
]

LOCATION_PATTERNS = [
    r'\b(near|beside|opposite|behind|in front of|outside|inside|at)\s+[A-Z][a-zA-Z\s]+\b',
    r'\b[A-Z][a-z]+\s+(Road|Street|Lane|Circle|Block|Nagar|Layout|Market|Shop|Building)\b',
]


class NLPEngine:
    def __init__(self):
        self._try_load_spacy()

    def _try_load_spacy(self):
        """Try to load spaCy, fall back to pattern-based if not available."""
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
            self.use_spacy = True
            print("[NLPEngine] spaCy loaded successfully.")
        except Exception:
            self.nlp = None
            self.use_spacy = False
            print("[NLPEngine] spaCy not available. Using pattern-based analysis.")

    def analyze(self, statement: str) -> dict:
        """Full NLP analysis of a witness statement."""
        if self.use_spacy:
            return self._analyze_with_spacy(statement)
        else:
            return self._analyze_with_patterns(statement)

    def _analyze_with_spacy(self, statement: str) -> dict:
        """spaCy-based deep NLP analysis."""
        doc = self.nlp(statement)

        keywords = self._extract_keywords_spacy(doc)
        entities = self._extract_entities_spacy(doc)
        time_mentions = self._extract_times(statement)
        location_mentions = self._extract_locations_spacy(doc)
        suspicious_flags = self._detect_suspicious_flags(statement)
        credibility = self._calculate_credibility(statement, suspicious_flags)
        sentiment = self._simple_sentiment(statement)

        return {
            "keywords": keywords,
            "entities": entities,
            "time_mentions": time_mentions,
            "location_mentions": location_mentions,
            "suspicious_flags": suspicious_flags,
            "credibility_score": credibility,
            "sentiment": sentiment
        }

    def _analyze_with_patterns(self, statement: str) -> dict:
        """Regex + lexicon-based analysis (fallback when spaCy is not available)."""
        lower = statement.lower()

        keywords = [w for w in SUSPICIOUS_KEYWORDS + CRIME_ACTION_WORDS if w in lower]
        time_mentions = []
        for pattern in TIME_PATTERNS:
            time_mentions.extend(re.findall(pattern, lower, re.IGNORECASE))

        location_mentions = []
        for word in statement.split():
            if word[0].isupper() and len(word) > 3:
                location_mentions.append(word)

        # Named entity extraction (simple capitalized proper nouns)
        entities = {
            "PERSON": [w for w in statement.split() if w[0].isupper() and len(w) > 3],
            "TIME": time_mentions,
            "LOCATION": location_mentions[:5]
        }

        suspicious_flags = self._detect_suspicious_flags(statement)
        credibility = self._calculate_credibility(statement, suspicious_flags)
        sentiment = self._simple_sentiment(statement)

        return {
            "keywords": list(set(keywords)),
            "entities": entities,
            "time_mentions": list(set(time_mentions)),
            "location_mentions": list(set(location_mentions[:5])),
            "suspicious_flags": suspicious_flags,
            "credibility_score": credibility,
            "sentiment": sentiment
        }

    def _extract_keywords_spacy(self, doc) -> list:
        """Extract crime-relevant keywords using POS tags and lexicon."""
        keywords = set()
        for token in doc:
            if token.pos_ in ('VERB', 'NOUN') and not token.is_stop:
                if token.lemma_.lower() in SUSPICIOUS_KEYWORDS + CRIME_ACTION_WORDS:
                    keywords.add(token.lemma_.lower())
        return list(keywords)

    def _extract_entities_spacy(self, doc) -> dict:
        """Extract named entities (PERSON, GPE, TIME, ORG)."""
        entities = {}
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            entities[ent.label_].append(ent.text)
        return entities

    def _extract_locations_spacy(self, doc) -> list:
        """Extract location mentions from spaCy doc."""
        return [ent.text for ent in doc.ents if ent.label_ in ('GPE', 'LOC', 'FAC')]

    def _extract_times(self, text: str) -> list:
        times = []
        for pattern in TIME_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                times.extend([m if isinstance(m, str) else m[0] for m in matches])
        return list(set(times))

    def _detect_suspicious_flags(self, statement: str) -> list:
        """Detect suspicious patterns in testimony."""
        flags = []
        lower = statement.lower()

        if re.search(r"\b(didn't see|could not see|never saw)\b", lower) and re.search(r"\b(saw|seen|noticed)\b", lower):
            flags.append("POSSIBLE_CONTRADICTION: Claims both seeing and not seeing")

        if re.search(r"\b(alone|by himself|by herself)\b", lower) and re.search(r"\bthey\b|\bthem\b|\btheir\b", lower):
            flags.append("CONTRADICTION: Alone vs. group pronoun usage")

        if lower.count('i think') > 2 or lower.count('maybe') > 2 or lower.count('i believe') > 2:
            flags.append("LOW_CONFIDENCE: Excessive hedging language detected")

        if re.search(r"\b(exactly|precisely|definitely|obviously)\b", lower):
            flags.append("OVER_CERTAINTY: Suspiciously definitive recall")

        words = statement.split()
        if len(words) < 15:
            flags.append("SHORT_STATEMENT: Statement too brief for incident complexity")

        return flags

    def _calculate_credibility(self, statement: str, flags: list) -> float:
        """Score witness credibility 0-100 based on statement quality."""
        score = 70.0
        words = len(statement.split())

        # Length bonus (detailed statements are more credible)
        if words > 100: score += 10
        elif words > 50: score += 5
        elif words < 20: score -= 15

        # Flag penalties
        score -= len(flags) * 10

        # Specific detail bonus
        if re.search(r'\d{1,2}:\d{2}', statement): score += 5  # Has specific time
        if re.search(r'[A-Z][a-z]+ (Road|Street|Layout|Nagar)', statement): score += 5  # Has specific place

        return round(max(0, min(100, score)), 2)

    def _simple_sentiment(self, text: str) -> float:
        """Rudimentary sentiment: positive=1, negative=-1, neutral=0."""
        positive = ['calm', 'cooperative', 'clear', 'certain', 'sure']
        negative = ['confused', 'scared', 'frightened', 'nervous', 'angry', 'upset']
        lower = text.lower()
        pos_count = sum(1 for w in positive if w in lower)
        neg_count = sum(1 for w in negative if w in lower)
        if pos_count > neg_count: return round(pos_count / (pos_count + neg_count + 1), 2)
        if neg_count > pos_count: return round(-neg_count / (pos_count + neg_count + 1), 2)
        return 0.0
