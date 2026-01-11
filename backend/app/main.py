from flask import Flask, render_template
from flask_cors import CORS

from routes.proctor import proctor_bp
from routes.auth import auth_bp
from routes.exam import exam_bp

from db import db          # 🔥 DATABASE
import models              # 🔥 MODELS (table creation ke liye)

def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    # ================= CORS =================
    CORS(app)

    # ================= DATABASE CONFIG =================
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///proctor.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # Create tables once at startup
    with app.app_context():
        db.create_all()

    # ================= BLUEPRINTS =================
    app.register_blueprint(proctor_bp, url_prefix="/proctor")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(exam_bp, url_prefix="/exam")

    # ================= ROUTES =================
    @app.route("/")
    def home():
        return {"message": "Exam Proctoring Backend Running"}

    

    return app


app = create_app()

if __name__ == "__main__":
    # 🔥 reloader OFF = stability
    app.run(debug=True, port=5000, use_reloader=False)
