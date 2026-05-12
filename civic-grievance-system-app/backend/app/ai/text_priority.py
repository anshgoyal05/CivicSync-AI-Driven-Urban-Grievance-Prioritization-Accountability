from __future__ import annotations

import csv
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


PRIORITY_LABELS = ["Low", "Medium", "High", "Critical"]


def _tokenize(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    toks = [t for t in text.split() if 2 <= len(t) <= 24]
    return toks


@dataclass(frozen=True)
class TextModelBundle:
    # Naive Bayes bag-of-words model (pure python).
    label_priors: dict[str, float]
    token_logprob: dict[str, dict[str, float]]  # label -> token -> log P(token|label)
    unk_logprob: dict[str, float]  # label -> log P(unk|label)


def train_text_model(training_csv_path: str) -> TextModelBundle:
    path = Path(training_csv_path)
    if not path.exists():
        raise ValueError(f"Training data not found: {training_csv_path}")

    counts_by_label: dict[str, dict[str, int]] = {l: {} for l in PRIORITY_LABELS}
    total_tokens_by_label: dict[str, int] = {l: 0 for l in PRIORITY_LABELS}
    doc_count_by_label: dict[str, int] = {l: 0 for l in PRIORITY_LABELS}
    vocab: set[str] = set()

    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            label = str(row.get("priority", "")).strip()
            if label not in PRIORITY_LABELS:
                continue
            text = f"{row.get('title','')} {row.get('description','')}"
            tokens = _tokenize(text)
            if not tokens:
                continue
            doc_count_by_label[label] += 1
            for tok in tokens:
                vocab.add(tok)
                counts_by_label[label][tok] = counts_by_label[label].get(tok, 0) + 1
                total_tokens_by_label[label] += 1

    total_docs = sum(doc_count_by_label.values()) or 1
    label_priors = {l: (doc_count_by_label[l] / total_docs) for l in PRIORITY_LABELS}

    vocab_size = max(1, len(vocab))
    token_logprob: dict[str, dict[str, float]] = {l: {} for l in PRIORITY_LABELS}
    unk_logprob: dict[str, float] = {}
    alpha = 1.0  # Laplace smoothing

    for label in PRIORITY_LABELS:
        denom = total_tokens_by_label[label] + alpha * vocab_size
        unk_logprob[label] = math.log(alpha / denom)
        for tok, c in counts_by_label[label].items():
            token_logprob[label][tok] = math.log((c + alpha) / denom)

    return TextModelBundle(label_priors=label_priors, token_logprob=token_logprob, unk_logprob=unk_logprob)


def ensure_text_model(*, training_csv_path: str, model_path: str, vectorizer_path: str) -> TextModelBundle:
    # Pure python model trains fast; we don't persist in this lightweight runtime.
    return train_text_model(training_csv_path)


def _logsumexp(xs: Iterable[float]) -> float:
    xs = list(xs)
    m = max(xs)
    return m + math.log(sum(math.exp(x - m) for x in xs))


def predict_text_priority(
    bundle: TextModelBundle, *, title: str, description: str
) -> tuple[str, float, dict[str, float]]:
    tokens = _tokenize(f"{title} {description}")
    if not tokens:
        return "Medium", 0.25, {l: (1.0 / len(PRIORITY_LABELS)) for l in PRIORITY_LABELS}

    log_scores: dict[str, float] = {}
    for label in PRIORITY_LABELS:
        prior = max(1e-9, bundle.label_priors.get(label, 1e-9))
        score = math.log(prior)
        tok_map = bundle.token_logprob[label]
        unk = bundle.unk_logprob[label]
        for tok in tokens:
            score += tok_map.get(tok, unk)
        log_scores[label] = score

    z = _logsumexp(log_scores.values())
    probs = {l: float(math.exp(s - z)) for l, s in log_scores.items()}
    best = max(probs, key=probs.get)
    return best, float(probs[best]), probs
