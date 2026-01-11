from ultralytics import YOLO

# 🔥 Lightweight & fast
model = YOLO("yolov8n.pt")

# ===== Temporal stability =====
_detect_count = 0
_last_position = None

REQUIRED_FRAMES = 3        # phone must appear in 3 frames
CONF_THRESHOLD = 0.5


def detect_mobile_with_position(frame):
    """
    Returns:
        phone_detected (bool)
        phone_center (x, y) or None
    """

    global _detect_count, _last_position

    results = model(frame, verbose=False)

    detected = False
    center = None

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            if model.names[cls] == "cell phone" and conf >= CONF_THRESHOLD:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                center = ((x1 + x2) // 2, (y1 + y2) // 2)
                detected = True
                break

    if detected:
        _detect_count += 1
        _last_position = center
    else:
        _detect_count = 0
        _last_position = None

    if _detect_count >= REQUIRED_FRAMES:
        return True, _last_position

    return False, None
