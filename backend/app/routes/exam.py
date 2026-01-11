from flask import Blueprint

exam_bp = Blueprint("exam", __name__)

@exam_bp.route("/start")
def start_exam():
    return {"message": "Exam started"}
