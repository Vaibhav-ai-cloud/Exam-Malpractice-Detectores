import cv2
import mediapipe as mp
import math

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    refine_landmarks=True,
    max_num_faces=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# ===== MediaPipe Eye Landmarks =====
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]


def euclidean(p1, p2):
    return math.dist(p1, p2)


def eye_aspect_ratio(eye):
    """
    EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    """
    vertical1 = euclidean(eye[1], eye[5])
    vertical2 = euclidean(eye[2], eye[4])
    horizontal = euclidean(eye[0], eye[3])

    return (vertical1 + vertical2) / (2.0 * horizontal + 1e-6)


def detect_eye_behavior(frame):
    """
    Returns:
        eye_direction: left | right | center | no_face
        eyes_closed: True | False
    """

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        return "no_face", False

    lm = result.multi_face_landmarks[0].landmark

    # ===== Extract eye points =====
    left_eye = [(int(lm[i].x * w), int(lm[i].y * h)) for i in LEFT_EYE]
    right_eye = [(int(lm[i].x * w), int(lm[i].y * h)) for i in RIGHT_EYE]

    # ===== Eye center for direction =====
    left_center_x = sum(p[0] for p in left_eye) / len(left_eye)
    right_center_x = sum(p[0] for p in right_eye) / len(right_eye)
    face_center_x = w / 2

    if left_center_x < face_center_x - 45:
        eye_direction = "left"
    elif right_center_x > face_center_x + 45:
        eye_direction = "right"
    else:
        eye_direction = "center"

    # ===== Eye Closed Detection =====
    left_ear = eye_aspect_ratio(left_eye)
    right_ear = eye_aspect_ratio(right_eye)
    avg_ear = (left_ear + right_ear) / 2

    eyes_closed = avg_ear < 0.20   # 🔥 stable threshold

    return eye_direction, eyes_closed
