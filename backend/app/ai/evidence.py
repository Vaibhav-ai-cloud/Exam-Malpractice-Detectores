import cv2
import os
from datetime import datetime

from db import db
from models import Evidence

# ===== BASE PATH (SAFE) =====
BASE_DIR = os.path.join(os.getcwd(), "evidence")
IMG_DIR = os.path.join(BASE_DIR, "images")
LOG_DIR = os.path.join(BASE_DIR, "logs")

os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)


def save_evidence(frame, student_id, score, reason):
    """
    Save cheating evidence:
    - Image to disk
    - Log to file
    - Entry to database
    """

    timestamp = datetime.now()
    ts_str = timestamp.strftime("%Y-%m-%d_%H-%M-%S")

    image_name = f"{student_id}_{ts_str}.jpg"
    image_path = os.path.join(IMG_DIR, image_name)

    # ===== SAVE IMAGE =====
    if frame is not None:
        cv2.imwrite(image_path, frame)

    # ===== SAVE LOG FILE =====
    log_path = os.path.join(LOG_DIR, "events.log")
    with open(log_path, "a") as f:
        f.write(
            f"{ts_str} | {student_id} | score={score} | reason={reason} | image={image_name}\n"
        )

    # ===== SAVE TO DATABASE =====
    evidence = Evidence(
        student_id=student_id,
        image_name=image_name,
        timestamp=timestamp
    )

    db.session.add(evidence)
    db.session.commit()

    return image_name
