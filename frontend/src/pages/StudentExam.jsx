import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CameraBox from "../components/CameraBox";
import AlertBanner from "../components/AlertBanner";

export default function StudentExam({ user, onLogout }) {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [alert, setAlert] = useState(null);
  const [examSubmitted, setExamSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      text:
        "Explain the fundamental principles of Artificial Intelligence and its applications in modern technology.",
    },
    {
      id: 2,
      text:
        "What is machine learning and how does it differ from traditional programming?",
    },
    {
      id: 3,
      text: "Describe the ethical considerations in AI development.",
    },
  ];

  /* ================= TIMER ================= */
  useEffect(() => {
    if (examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [examSubmitted]);

  /* ================= AUTO SUBMIT ================= */
  useEffect(() => {
    if (timeLeft === 0 && !examSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  /* ================= PROCTOR CALLBACK ================= */
  const handleProctorUpdate = (data) => {
    if (data.status === "CHEATING") {
      setAlert({
        message:
          "⚠️ Suspicious activity detected! Your actions are being recorded.",
        type: "error",
      });
    } else if (data.status === "SUSPICIOUS") {
      setAlert({
        message: "⚠️ Please stay focused on the exam.",
        type: "warning",
      });
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmitExam = () => {
    setExamSubmitted(true);
    setAlert({
      message: "✅ Exam submitted successfully.",
      type: "success",
    });

    console.log("FINAL ANSWERS:", answers);
    // 👉 later: send answers to backend
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar user={user} onLogout={onLogout} />

      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-insta">
              AI Fundamentals Exam
            </h1>
            <p className="text-gray-400">Student: {user?.name}</p>
          </div>

          <div className="glass-card">
            <div className="glass-card-inner text-center">
              <p className="text-gray-400 text-sm">Time Remaining</p>
              <p
                className={`text-2xl font-bold ${
                  timeLeft < 600 ? "text-red-400" : "text-white"
                }`}
              >
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* QUESTIONS */}
        <div className="lg:col-span-3 space-y-6">
          {/* NAV */}
          <div className="glass-card">
            <div className="glass-card-inner flex gap-2">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(q.id)}
                  className={`w-10 h-10 rounded-lg ${
                    currentQuestion === q.id
                      ? "btn-insta"
                      : answers[q.id]
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-900 text-gray-400"
                  }`}
                >
                  {q.id}
                </button>
              ))}
            </div>
          </div>

          {/* QUESTION */}
          <div className="glass-card">
            <div className="glass-card-inner">
              <h2 className="text-xl font-semibold text-white mb-2">
                Question {currentQuestion}
              </h2>
              <p className="text-gray-300 mb-4">
                {questions.find((q) => q.id === currentQuestion)?.text}
              </p>

              <textarea
                value={answers[currentQuestion] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion, e.target.value)
                }
                className="w-full h-64 p-4 input-insta rounded-xl resize-none"
                placeholder="Type your answer here..."
                disabled={examSubmitted}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between">
            <button
              onClick={() =>
                setCurrentQuestion((q) => Math.max(1, q - 1))
              }
              disabled={currentQuestion === 1}
              className="px-6 py-3 bg-gray-900 rounded-xl text-white disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setCurrentQuestion((q) =>
                  Math.min(questions.length, q + 1)
                )
              }
              disabled={currentQuestion === questions.length}
              className="px-6 py-3 btn-insta rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <CameraBox onProctorUpdate={handleProctorUpdate} />

          {alert && <AlertBanner message={alert.message} type={alert.type} />}

          <div className="glass-card">
            <div className="glass-card-inner">
              <h3 className="text-white font-semibold mb-2">Progress</h3>
              <p className="text-gray-400 text-sm">
                {Object.keys(answers).length}/{questions.length} answered
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={examSubmitted}
            className="w-full btn-insta py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}
