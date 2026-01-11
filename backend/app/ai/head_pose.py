import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    refine_landmarks=True,
    max_num_faces=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Smooth direction (simple memory)
_last_direction = "center"


def get_head_direction(frame):
    """
    Returns:
        left | right | down | center | no_face
    """

    global _last_direction

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        _last_direction = "no_face"
        return "no_face"

    lm = result.multi_face_landmarks[0].landmark

    # Key landmarks
    nose = lm[1]
    left_eye = lm[33]
    right_eye = lm[263]
    chin = lm[152]

    nose_x, nose_y = nose.x * w, nose.y * h
    eye_center_x = ((left_eye.x + right_eye.x) / 2) * w
    eye_center_y = ((left_eye.y + right_eye.y) / 2) * h
    chin_y = chin.y * h

    face_width = abs(right_eye.x - left_eye.x) * w
    face_height = abs(chin_y - eye_center_y)

    # Dynamic thresholds
    x_thresh = face_width * 0.25
    y_thresh = face_height * 0.35

    direction = "center"

    if nose_x < eye_center_x - x_thresh:
        direction = "left"
    elif nose_x > eye_center_x + x_thresh:
        direction = "right"
    elif nose_y > eye_center_y + y_thresh:
        direction = "down"

    # Simple smoothing (avoid jitter)
    if direction != _last_direction:
        _last_direction = direction
    else:
        direction = _last_direction

    return direction
