import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    max_num_hands=2,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)


def detect_hand_and_position(frame):
    """
    Returns:
        hand_detected (bool)
        hand_center (x, y) or None
    """

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if not result.multi_hand_landmarks:
        return False, None

    centers = []

    for hand_landmarks in result.multi_hand_landmarks:
        xs = [int(lm.x * w) for lm in hand_landmarks.landmark]
        ys = [int(lm.y * h) for lm in hand_landmarks.landmark]

        # Bounding box size (filter noise)
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)

        if (max_x - min_x) < 40 or (max_y - min_y) < 40:
            continue  # ignore tiny / far hands

        cx = sum(xs) // len(xs)
        cy = sum(ys) // len(ys)
        centers.append((cx, cy))

    if not centers:
        return False, None

    # Return average center (stable)
    avg_x = sum(c[0] for c in centers) // len(centers)
    avg_y = sum(c[1] for c in centers) // len(centers)

    return True, (avg_x, avg_y)
