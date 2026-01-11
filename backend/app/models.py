from datetime import datetime
from db import db

class Student(db.Model):
    __tablename__ = "students"

    student_id = db.Column(db.String, primary_key=True)
    first_seen = db.Column(db.DateTime, default=datetime.utcnow)


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String, db.ForeignKey("students.student_id"))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Integer)
    status = db.Column(db.String)
    reason = db.Column(db.String)


class Evidence(db.Model):
    __tablename__ = "evidence"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String)
    image_name = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
