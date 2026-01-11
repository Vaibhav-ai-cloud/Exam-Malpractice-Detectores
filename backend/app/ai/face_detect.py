import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=2,
    refine_landmarks=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


def detect_face(frame):
    """
    Returns:
        face_present (bool)
        face_count (int)
    """

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        return False, 0

    valid_faces = 0

    for face in result.multi_face_landmarks:
        xs = [lm.x for lm in face.landmark]
        ys = [lm.y for lm in face.landmark]

        # Bounding box size check (filter noise / tiny faces)
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)

        face_width = (max_x - min_x) * w
        face_height = (max_y - min_y) * h

        if face_width > 60 and face_height > 60:
            valid_faces += 1

    return valid_faces > 0, valid_faces
