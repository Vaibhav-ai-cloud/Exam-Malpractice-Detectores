import time


class SuspicionScorer:
    def __init__(self):
        self.score = 0

        # ===== TIME TRACKERS =====
        self.head_start = None
        self.eye_start = None
        self.phone_combo_start = None
        self.no_face_start = None
        self.multiple_face_start = None

        # ===== COOLDOWN TRACKERS =====
        self.last_penalty_time = 0
        self.cooldown = 0.5  # seconds

        # ===== SCORE DECAY =====
        self.last_activity_time = time.time()

        # ===== LEARNING PHASE =====
        self.learning_phase = True
        self.learn_start = time.time()

        # ===== PATTERN DETECTION =====
        self.suspicious_patterns = 0
        self.pattern_reset_time = time.time()

    def reset(self):
        self.__init__()

    # ================= LEARNING =================
    def learn_baseline(self):
        """
        Initial learning period to avoid false positives
        """
        if time.time() - self.learn_start >= 3:
            self.learning_phase = False

    # ================= INTERNAL HELPERS =================
    def _can_penalize(self):
        return time.time() - self.last_penalty_time >= self.cooldown

    def _penalize(self, points):
        if self._can_penalize():
            self.score += points
            self.last_penalty_time = time.time()
            self.last_activity_time = time.time()
            self.suspicious_patterns += 1

    def _decay_score(self):
        # Gradually reduce score if behavior becomes normal
        if time.time() - self.last_activity_time >= 10:
            self.score = max(self.score - 1, 0)
            self.last_activity_time = time.time()

    def _check_pattern_multiplier(self):
        # Reset pattern counter every 30 seconds
        if time.time() - self.pattern_reset_time >= 30:
            self.suspicious_patterns = 0
            self.pattern_reset_time = time.time()

        # Repeated suspicious behavior = higher penalty
        if self.suspicious_patterns >= 3:
            return 2.0
        return 1.0

    # ================= FACE =================
    def update_face_status(self, face_present, face_count=1):
        if self.learning_phase:
            return

        multiplier = self._check_pattern_multiplier()

        # No face detected
        if not face_present:
            if not self.no_face_start:
                self.no_face_start = time.time()
            elif time.time() - self.no_face_start >= 1.5:
                self._penalize(int(25 * multiplier))
                self.no_face_start = None

        # Multiple faces detected
        elif face_count > 1:
            if not self.multiple_face_start:
                self.multiple_face_start = time.time()
            elif time.time() - self.multiple_face_start >= 1:
                self._penalize(int(30 * multiplier))
                self.multiple_face_start = None

        else:
            self.no_face_start = None
            self.multiple_face_start = None
            self._decay_score()

    # ================= HEAD =================
    def update_head_pose(self, head_dir):
        if self.learning_phase:
            return

        multiplier = self._check_pattern_multiplier()

        if head_dir in ["left", "right", "down"]:
            if not self.head_start:
                self.head_start = time.time()
            elif time.time() - self.head_start >= 1.5:
                penalty = 15 if head_dir == "down" else 12
                self._penalize(int(penalty * multiplier))
                self.head_start = None
        else:
            self.head_start = None
            self._decay_score()

    # ================= EYE =================
    def update_eye_behavior(self, eye_dir, eyes_closed):
        if self.learning_phase:
            return

        multiplier = self._check_pattern_multiplier()

        if eye_dir in ["left", "right"] or eyes_closed:
            if not self.eye_start:
                self.eye_start = time.time()
            elif time.time() - self.eye_start >= 2:
                penalty = 12 if eyes_closed else 8
                self._penalize(int(penalty * multiplier))
                self.eye_start = None
        else:
            self.eye_start = None
            self._decay_score()

    # ================= PHONE + HEAD (CRITICAL) =================
    def update_hand_phone_head_combo(self, hand_detected, phone_detected, head_dir):
        if self.learning_phase:
            return

        multiplier = self._check_pattern_multiplier()

        if phone_detected and head_dir in ["down", "left", "right"]:
            if not self.phone_combo_start:
                self.phone_combo_start = time.time()
            elif time.time() - self.phone_combo_start >= 0.5:
                self._penalize(int(50 * multiplier))
                self.phone_combo_start = None

        elif phone_detected:
            self._penalize(int(20 * multiplier))

        else:
            self.phone_combo_start = None
            self._decay_score()

    # ================= INSTANT VIOLATIONS =================
    def add_instant_violation(self, violation_type):
        penalties = {
            "tab_switch": 15,
            "fullscreen_exit": 25,
            "copy_paste": 30,
            "right_click": 10,
            "multiple_monitors": 35
        }

        if violation_type in penalties:
            self._penalize(penalties[violation_type])

    # ================= STATUS =================
    def get_status(self):
        if self.score >= 35:
            return "CHEATING"
        if self.score >= 15:
            return "SUSPICIOUS"
        return "NORMAL"

    # ================= ANALYTICS =================
    def get_detailed_status(self):
        return {
            "score": self.score,
            "status": self.get_status(),
            "learning_phase": self.learning_phase,
            "suspicious_patterns": self.suspicious_patterns,
            "risk_level": (
                "HIGH" if self.score >= 25
                else "MEDIUM" if self.score >= 10
                else "LOW"
            )
        }
