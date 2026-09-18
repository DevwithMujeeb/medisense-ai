const GEMINI_API_KEY = "AQ.Ab8RN6KRkKHxk9j6oMit8OszmjiGnnEMlCmUKCkkBrvDyikJMw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

let conversationHistory = [];
let fqMap = {};
let fqCounter = 0;

// ─── INIT ────────────────────────────────────────────────────────────────────
window.onload = () => {
  addBubble(
    "ai",
    "Hi there! 👋 I'm MediSense AI. Tell me what symptoms you're experiencing and I'll help you understand what might be going on and what to do next.",
  );
};

// ─── INPUT HANDLERS ──────────────────────────────────────────────────────────
function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ─── SEND MESSAGE ─────────────────────────────────────────────────────────────
async function sendMessage(prefill) {
  const input = document.getElementById("symptomInput");
  const message = prefill || input.value.trim();
  if (!message) return;

  clearError();
  input.value = "";
  addBubble("user", message);
  conversationHistory.push({ role: "user", parts: [{ text: message }] });

  const typingEl = showTyping();
  document.getElementById("sendBtn").disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: {
          parts: [
            {
              text: `You are MediSense AI, a compassionate medical triage assistant for everyday people.
ALWAYS respond in valid JSON only. No markdown, no backticks, no extra text.

For FIRST symptom message:
{
  "type": "triage",
  "triage_level": "emergency|urgent|see_doctor|monitor",
  "triage_title": "<short title>",
  "triage_icon": "<one emoji>",
  "summary": "<2-3 sentence compassionate summary>",
  "possible_conditions": ["condition1","condition2","condition3"],
  "action_steps": ["step1","step2","step3"],
  "follow_up_questions": ["question1","question2","question3"]
}

For FOLLOW-UP messages:
{
  "type": "followup",
  "updated_summary": "<updated assessment>",
  "refined_conditions": ["condition1","condition2"],
  "updated_action_steps": ["step1","step2","step3"],
  "follow_up_questions": ["question1","question2"]
}

Triage levels: emergency=life-threatening go to ER now, urgent=needs care in hours, see_doctor=within 1-2 days, monitor=manage at home.
Be compassionate and avoid medical jargon.`,
            },
          ],
        },
        generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const raw = data.candidates[0].content.parts[0].text;
    conversationHistory.push({ role: "model", parts: [{ text: raw }] });

    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    removeTyping(typingEl);
    if (result.type === "triage") renderTriage(result);
    else renderFollowUp(result);
  } catch (err) {
    removeTyping(typingEl);
    showError("Error: " + err.message);
  } finally {
    document.getElementById("sendBtn").disabled = false;
  }
}

// ─── RENDER TRIAGE ────────────────────────────────────────────────────────────
function renderTriage(r) {
  const levelClass =
    {
      emergency: "triage-emergency",
      urgent: "triage-urgent",
      see_doctor: "triage-see-doctor",
      monitor: "triage-monitor",
    }[r.triage_level] || "triage-monitor";

  const hospitalBtn =
    r.triage_level === "emergency" || r.triage_level === "urgent"
      ? '<button class="hospital-btn ' +
        (r.triage_level === "urgent" ? "urgent-btn" : "") +
        '" onclick="findHospitals(\'' +
        r.triage_level +
        '\')">🏥 Find Nearest Hospital Now</button><div class="location-status" id="locationStatus"></div>'
      : "";

  const firstAid =
    r.triage_level === "monitor" || r.triage_level === "see_doctor"
      ? '<div class="firstaid-card"><h4>💊 Quick First Aid Tips</h4><ul>' +
        (r.triage_level === "monitor"
          ? "<li>💧 Stay well hydrated</li><li>😴 Get adequate rest</li><li>🌡️ Monitor temperature every few hours</li><li>📋 Write down any new symptoms</li><li>🚨 Go to ER if symptoms worsen suddenly</li>"
          : "<li>💊 Take OTC pain relief if appropriate</li><li>💧 Stay hydrated, eat light</li><li>😴 Rest, avoid strenuous activity</li><li>📋 Note all symptoms for your doctor</li><li>🚨 Go to ER if symptoms worsen</li>") +
        "</ul></div>"
      : "";

  const conditions = r.possible_conditions
    .map(function (c) {
      return "<li><span>🔍</span>" + c + "</li>";
    })
    .join("");
  const actions = r.action_steps
    .map(function (s) {
      return "<li><span>✅</span>" + s + "</li>";
    })
    .join("");
  const fqBtns = r.follow_up_questions
    .map(function (q) {
      var key = "fq_" + ++fqCounter;
      fqMap[key] = q;
      return '<button class="fq-btn" data-fq="' + key + '">' + q + "</button>";
    })
    .join("");

  const shareKey = "share_" + Date.now();
  fqMap[shareKey] = buildShareText(r);

  const html =
    '<div class="triage-card ' +
    levelClass +
    '">' +
    '<div class="triage-header"><span class="triage-icon">' +
    r.triage_icon +
    "</span>" +
    '<span class="triage-title">' +
    r.triage_title +
    "</span>" +
    '<span class="triage-badge">' +
    r.triage_level.replace("_", " ").toUpperCase() +
    "</span></div>" +
    '<div class="triage-body">' +
    '<p class="triage-summary">' +
    r.summary +
    "</p>" +
    '<div class="triage-section"><h4>Possible Conditions</h4><ul>' +
    conditions +
    "</ul></div>" +
    '<div class="triage-section action-steps"><h4>What To Do Next</h4><ul>' +
    actions +
    "</ul></div>" +
    hospitalBtn +
    firstAid +
    '<div class="export-row">' +
    '<button class="share-btn" data-share="' +
    shareKey +
    '">🔗 Copy Summary</button>' +
    '<button class="pdf-btn" onclick="exportPDF(this)" data-pdf=\'' +
    JSON.stringify({
      title: r.triage_title,
      level: r.triage_level,
      icon: r.triage_icon,
      summary: r.summary,
      conditions: r.possible_conditions,
      actions: r.action_steps,
    }) +
    "'>📄 Export PDF</button>" +
    "</div>" +
    "</div></div>" +
    '<div class="followup-card"><p>Help me refine your assessment:</p><div class="followup-questions">' +
    fqBtns +
    "</div></div>";

  addBubble("ai", html, true);
}

// ─── RENDER FOLLOWUP ──────────────────────────────────────────────────────────
function renderFollowUp(r) {
  const conditions = r.refined_conditions
    .map(function (c) {
      return "<li><span>🔍</span>" + c + "</li>";
    })
    .join("");
  const actions = r.updated_action_steps
    .map(function (s) {
      return "<li><span>✅</span>" + s + "</li>";
    })
    .join("");
  const fqBtns = (r.follow_up_questions || [])
    .map(function (q) {
      var key = "fq_" + ++fqCounter;
      fqMap[key] = q;
      return '<button class="fq-btn" data-fq="' + key + '">' + q + "</button>";
    })
    .join("");

  const html =
    '<div class="triage-body">' +
    '<p class="triage-summary">' +
    r.updated_summary +
    "</p>" +
    '<div class="triage-section"><h4>Refined Conditions</h4><ul>' +
    conditions +
    "</ul></div>" +
    '<div class="triage-section action-steps"><h4>Updated Actions</h4><ul>' +
    actions +
    "</ul></div>" +
    "</div>" +
    (fqBtns
      ? '<div class="followup-card"><p>Want to tell me more?</p><div class="followup-questions">' +
        fqBtns +
        "</div></div>"
      : "");

  addBubble("ai", html, true);
}

// ─── HOSPITAL FINDER ──────────────────────────────────────────────────────────
function findHospitals(level) {
  var status = document.getElementById("locationStatus");
  if (status) status.textContent = "Getting your location...";
  if (!navigator.geolocation) {
    window.open(
      "https://www.google.com/maps/search/hospitals+near+me",
      "_blank",
    );
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude,
        lng = pos.coords.longitude;
      var q =
        level === "emergency" ? "emergency+hospital" : "hospital+urgent+care";
      window.open(
        "https://www.google.com/maps/search/" +
          q +
          "/@" +
          lat +
          "," +
          lng +
          ",14z",
        "_blank",
      );
      if (status) status.textContent = "✅ Opening Google Maps...";
    },
    function () {
      window.open(
        "https://www.google.com/maps/search/hospitals+near+me",
        "_blank",
      );
      if (status)
        status.textContent =
          "📍 Location unavailable — showing general results.";
    },
    { timeout: 8000 },
  );
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function exportPDF(btn) {
  var data = JSON.parse(btn.getAttribute("data-pdf"));
  var conditions = data.conditions
    .map(function (c) {
      return "<li>" + c + "</li>";
    })
    .join("");
  var actions = data.actions
    .map(function (s) {
      return "<li>" + s + "</li>";
    })
    .join("");
  var w = window.open("", "_blank");
  w.document.write("<html><head><title>MediSense AI Report</title>");
  w.document.write(
    "<style>body{font-family:sans-serif;padding:2rem;color:#111;max-width:600px;margin:auto;}h1{color:#0B6E4F;}h3{margin-top:1.5rem;color:#374151;}ul{line-height:2;}footer{margin-top:2rem;font-size:0.75rem;color:#9CA3AF;border-top:1px solid #eee;padding-top:1rem;}</style>",
  );
  w.document.write("</head><body>");
  w.document.write("<h1>🩺 MediSense AI Report</h1>");
  w.document.write(
    "<p><strong>Date:</strong> " + new Date().toLocaleDateString() + "</p>",
  );
  w.document.write(
    "<p><strong>Triage:</strong> " +
      data.level.replace("_", " ").toUpperCase() +
      "</p>",
  );
  w.document.write(
    "<h3>" + data.icon + " " + data.title + "</h3><p>" + data.summary + "</p>",
  );
  w.document.write("<h3>Possible Conditions</h3><ul>" + conditions + "</ul>");
  w.document.write("<h3>What To Do Next</h3><ul>" + actions + "</ul>");
  w.document.write(
    "<footer>Generated by MediSense AI. For informational purposes only. Always consult a qualified healthcare professional.</footer>",
  );
  w.document.write("</body></html>");
  w.document.close();
  w.print();
}

// ─── SHARE ────────────────────────────────────────────────────────────────────
function buildShareText(r) {
  var lines = [
    "MediSense AI Triage Report",
    "",
    "Level: " + r.triage_level.toUpperCase(),
    r.triage_title,
    "",
    r.summary,
    "",
    "Possible Conditions:",
  ];
  r.possible_conditions.forEach(function (c) {
    lines.push("• " + c);
  });
  lines.push("", "What To Do:");
  r.action_steps.forEach(function (s) {
    lines.push("• " + s);
  });
  lines.push(
    "",
    "⚠️ Not a medical diagnosis. Always consult a healthcare professional.",
  );
  return lines.join("\n");
}

// ─── BUBBLES ──────────────────────────────────────────────────────────────────
function addBubble(role, content, isHTML) {
  var history = document.getElementById("chatHistory");
  var div = document.createElement("div");
  div.className = "bubble " + (role === "ai" ? "ai" : "user");

  var avatar = document.createElement("div");
  avatar.className = "avatar " + (role === "ai" ? "ai" : "user-av");
  avatar.textContent = role === "ai" ? "🩺" : "👤";

  var bubble = document.createElement("div");
  bubble.className = "bubble-content";

  if (isHTML) {
    bubble.innerHTML = content;
    // Attach all interactive listeners after DOM insert
    setTimeout(function () {
      bubble.querySelectorAll(".fq-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var q = fqMap[this.getAttribute("data-fq")];
          if (q) sendMessage(q);
        });
      });
      bubble.querySelectorAll(".share-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var text = fqMap[this.getAttribute("data-share")];
          if (!text) return;
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = "✅ Copied!";
            setTimeout(function () {
              btn.innerHTML = "🔗 Copy Summary";
            }, 2000);
          });
        });
      });
    }, 0);
  } else {
    bubble.textContent = content;
  }

  div.appendChild(avatar);
  div.appendChild(bubble);
  history.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
}

function showTyping() {
  var history = document.getElementById("chatHistory");
  var div = document.createElement("div");
  div.className = "typing-bubble";
  div.id = "typingIndicator";
  div.innerHTML =
    '<div class="avatar ai">🩺</div><div class="typing-dots"><span></span><span></span><span></span></div>';
  history.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
  return div;
}

function removeTyping(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}
function showError(msg) {
  document.getElementById("errorContainer").innerHTML =
    '<div class="error-pill">⚠️ ' + msg + "</div>";
}
function clearError() {
  document.getElementById("errorContainer").innerHTML = "";
}
function resetChat() {
  conversationHistory = [];
  fqMap = {};
  document.getElementById("chatHistory").innerHTML = "";
  document.getElementById("symptomInput").value = "";
  clearError();
  window.onload();
}
