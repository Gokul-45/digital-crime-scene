"""
Contradiction Detector — cross-statement inconsistency analysis
"""
import re


NEGATION_PAIRS = [
    (r'\balone\b', r'\bthey\b|\bthem\b|\bgroup\b|\bpeople\b'),
    (r"\bdidn't see\b|\bnot see\b|\bnever saw\b", r'\bsaw\b|\bseen\b|\bnoticed\b|\bwitnessed\b'),
    (r'\bdaytime\b|\bday\b', r'\bnight\b|\bdark\b|\bnighttime\b'),
    (r'\bwalking\b|\bon foot\b', r'\bdriving\b|\bmotorcycle\b|\bcar\b|\bvehicle\b'),
    (r'\bone person\b|\ba man\b|\ba woman\b', r'\btwo\b|\bthree\b|\bmultiple\b|\bseveral\b'),
]


class ContradictionDetector:
    def detect(self, statements: list) -> list:
        """
        Compare all pairs of statements and return list of contradictions found.
        Each contradiction has: suspect statements, type, and description.
        """
        contradictions = []

        # Inter-statement contradictions
        for i in range(len(statements)):
            for j in range(i + 1, len(statements)):
                a = statements[i]
                b = statements[j]
                found = self._compare_pair(a, b)
                contradictions.extend(found)

        # Intra-statement contradictions (within single statement)
        for stmt in statements:
            intra = self._check_intra_contradictions(stmt)
            if intra:
                contradictions.append({
                    "type": "INTRA_STATEMENT",
                    "witness": stmt.get("name", "Unknown"),
                    "witnessId": stmt.get("witnessId"),
                    "description": intra,
                    "severity": "MEDIUM"
                })

        return contradictions

    def _compare_pair(self, a: dict, b: dict) -> list:
        """Compare two witness statements for contradictions."""
        results = []
        text_a = a.get("statement", "").lower()
        text_b = b.get("statement", "").lower()
        name_a = a.get("name", "Witness A")
        name_b = b.get("name", "Witness B")

        for (pattern_a, pattern_b) in NEGATION_PAIRS:
            a_has_first = bool(re.search(pattern_a, text_a))
            b_has_second = bool(re.search(pattern_b, text_a))
            contradicts = (a_has_first and bool(re.search(pattern_b, text_b))) or \
                          (b_has_second and bool(re.search(pattern_a, text_b)))

            if contradicts:
                results.append({
                    "type": "INTER_STATEMENT",
                    "witnesses": [name_a, name_b],
                    "witnessIds": [a.get("witnessId"), b.get("witnessId")],
                    "description": f"Contradiction between {name_a} and {name_b}: discrepancy in suspect count or presence",
                    "patterns": [pattern_a, pattern_b],
                    "severity": "HIGH"
                })

        # Time contradiction
        time_a = self._extract_times(text_a)
        time_b = self._extract_times(text_b)
        if time_a and time_b and time_a != time_b:
            results.append({
                "type": "TIME_DISCREPANCY",
                "witnesses": [name_a, name_b],
                "witnessIds": [a.get("witnessId"), b.get("witnessId")],
                "description": f"Time discrepancy: {name_a} mentions {time_a}, {name_b} mentions {time_b}",
                "severity": "HIGH"
            })

        return results

    def _check_intra_contradictions(self, stmt: dict) -> str:
        text = stmt.get("statement", "").lower()
        issues = []

        if re.search(r'\balone\b', text) and re.search(r'\bthey\b|\bthem\b', text):
            issues.append("Claims suspect was alone but uses plural pronouns")
        if re.search(r"\bdidn't see\b|\bcouldn't see\b", text) and re.search(r'\bsaw\b|\bnoticed\b', text):
            issues.append("Claims not to have seen but describes visual details")
        if re.search(r'\b(exactly|precisely)\b', text) and re.search(r'\b(maybe|perhaps|think)\b', text):
            issues.append("Mixed certainty: both exact claims and uncertain hedges")

        return "; ".join(issues)

    def _extract_times(self, text: str) -> list:
        matches = re.findall(r'\b\d{1,2}:\d{2}\s*[ap]m\b|\b\d{1,2}\s*[ap]m\b', text, re.IGNORECASE)
        return list(set(matches))

    def consistency_score(self, statements: list) -> float:
        """
        Overall consistency score across all statements (0-100).
        Higher is more consistent.
        """
        total_pairs = max(1, len(statements) * (len(statements) - 1) / 2)
        contradictions = self.detect(statements)
        contradiction_rate = len(contradictions) / total_pairs
        return round(max(0, 100 - (contradiction_rate * 100)), 2)
