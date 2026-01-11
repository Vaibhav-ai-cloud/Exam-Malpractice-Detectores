// ================= BASE CONFIG =================
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ================= PROCTORING =================
export async function sendFrame(image, studentId) {
  try {
    const res = await fetch(`${BASE_URL}/proctor/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: image,
        student_id: studentId,
      }),
    });

    if (!res.ok) {
      throw new Error("Proctor analyze failed");
    }

    return await res.json();
  } catch (err) {
    console.error("sendFrame error:", err);
    return {
      status: "ERROR",
      score: 0,
      head_direction: "unknown",
      phone_detected: false,
    };
  }
}

// ================= ADMIN DASHBOARD =================
export async function getDashboardData() {
  try {
    const res = await fetch(`${BASE_URL}/proctor/dashboard-data`);
    if (!res.ok) throw new Error("Dashboard fetch failed");
    return await res.json();
  } catch (err) {
    console.error("getDashboardData error:", err);
    return [];
  }
}

// ================= EVIDENCE =================
export async function getEvidenceList() {
  try {
    const res = await fetch(`${BASE_URL}/proctor/evidence-list`);
    if (!res.ok) throw new Error("Evidence fetch failed");
    return await res.json();
  } catch (err) {
    console.error("getEvidenceList error:", err);
    return [];
  }
}


export async function resetScore(studentId) {
  const res = await fetch("http://localhost:5000/proctor/reset-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: studentId }),
  });
  return res.json();
}


// ================= TAB / VIOLATIONS =================
export async function sendTabEvent(eventData) {
  try {
    const res = await fetch(`${BASE_URL}/proctor/tab-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (!res.ok) throw new Error("Tab event failed");
    return await res.json();
  } catch (err) {
    console.error("sendTabEvent error:", err);
    return { status: "ERROR" };
  }
}
