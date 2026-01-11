import base64
import cv2
import numpy as np
import os
from flask import Blueprint, request, jsonify, send_from_directory

from ai.evidence import save_evidence
from ai.face_detect import detect_face
from ai.eye_detect import detect_eye_behavior
from ai.head_pose import get_head_direction
from ai.object_detect import detect_mobile_with_position
from ai.hand_detect import detect_hand_and_position
from ai.scoring import SuspicionScorer

proctor_bp = Blueprint("proctor", __name__)

# ================= PER-STUDENT STATE =================
student_scorers = {}
student_last_status = {}

def get_scorer(student_id):
    if student_id not in student_scorers:
        student_scorers[student_id] = SuspicionScorer()
    return student_scorers[student_id]

# ================= ANALYZE FRAME =================
@proctor_bp.route("/analyze", methods=["POST"])
def analyze():
    data = request.json

    if not data or "image" not in data or "student_id" not in data:
        return jsonify({"error": "image or student_id missing"}), 400

    student_id = data["student_id"]
    scorer = get_scorer(student_id)

    # -------- Decode image --------
    try:
        frame = cv2.imdecode(
            np.frombuffer(base64.b64decode(data["image"]), np.uint8),
            cv2.IMREAD_COLOR
        )
    except Exception:
        return jsonify({"error": "Invalid image"}), 400

    if frame is None:
        return jsonify({"error": "Empty frame"}), 400

    # ================= AI DETECTIONS =================
    face_present, face_count = detect_face(frame)
    head_dir = get_head_direction(frame)
    phone_detected, phone_pos = detect_mobile_with_position(frame)
    hand_detected, hand_pos = detect_hand_and_position(frame)
    eye_dir, eyes_closed = detect_eye_behavior(frame)

    # ================= LEARNING =================
    scorer.learn_baseline()

    # ================= SCORING =================
    scorer.update_face_status(face_present)
    scorer.update_head_pose(head_dir)
    scorer.update_eye_behavior(eye_dir, eyes_closed)
    scorer.update_hand_phone_head_combo(
        hand_detected,
        phone_detected,
        head_dir
    )

    # ================= EVIDENCE =================
    current_status = scorer.get_status()
    previous_status = student_last_status.get(student_id)

    if current_status == "CHEATING" and previous_status != "CHEATING":
        save_evidence(
            frame=frame,
            student_id=student_id,
            score=scorer.score,
            reason="Suspicious behavior detected"
        )

    student_last_status[student_id] = current_status

    # ================= RESPONSE =================
    return jsonify({
        "student_id": student_id,
        "face_present": face_present,
        "face_count": face_count,
        "head_direction": head_dir,
        "eye_direction": eye_dir,
        "eyes_closed": eyes_closed,
        "phone_detected": phone_detected,
        "hand_detected": hand_detected,
        "score": scorer.score,
        "status": current_status
    })

# ================= RESET SCORE =================
@proctor_bp.route("/reset-score", methods=["POST"])
def reset_score():
    data = request.json
    student_id = data.get("student_id")

    if student_id in student_scorers:
        student_scorers[student_id].reset()
        student_last_status.pop(student_id, None)

    return jsonify({
        "message": "Score reset",
        "student_id": student_id,
        "score": 0,
        "status": "NORMAL"
    })

# ================= DASHBOARD DATA =================
@proctor_bp.route("/dashboard-data", methods=["GET"])
def dashboard_data():
    return jsonify([
        {
            "student_id": sid,
            "score": scorer.score,
            "status": scorer.get_status()
        }
        for sid, scorer in student_scorers.items()
    ])

# ================= TAB EVENTS =================
@proctor_bp.route("/tab-event", methods=["POST"])
def tab_event():
    data = request.json
    student_id = data.get("student_id")

    if not student_id:
        return jsonify({"error": "student_id missing"}), 400

    scorer = get_scorer(student_id)

    event = data.get("event_type")
    tab_count = data.get("tab_switch_count", 0)
    away_time = data.get("total_away_time", 0)

    if event == "fullscreen_exit":
        scorer.score += 25
    if tab_count >= 3:
        scorer.score += 20
    if away_time >= 5:
        scorer.score += 20

    return jsonify({
        "event": event,
        "score": scorer.score,
        "status": scorer.get_status()
    })

# ================= EVIDENCE LIST =================
@proctor_bp.route("/evidence-list", methods=["GET"])
def evidence_list():
    evidence_dir = os.path.join("evidence", "images")
    if not os.path.exists(evidence_dir):
        return jsonify([])

    files = []
    for f in os.listdir(evidence_dir):
        if f.lower().endswith((".jpg", ".png", ".jpeg")):
            files.append({"image": f})

    return jsonify(files)

@proctor_bp.route("/evidence/<filename>")
def get_evidence_image(filename):
    return send_from_directory(
        os.path.join("evidence", "images"),
        filename
    )
