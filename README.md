# 🩺 MediSense AI

> AI-powered symptom checker and medical triage assistant for everyday people.

Built for the **Build-a-thon Ibadan** hackathon — Best Use of the Google Gemini API challenge.

---

## 🚀 What It Does

MediSense AI helps people understand their symptoms and know what to do — without googling and panicking. Users describe how they feel in plain English, and the app:

- **Triages the situation** across 4 urgency levels
- **Lists possible conditions** that match the symptoms
- **Gives clear action steps** — go to the ER, see a doctor, or rest at home
- **Asks follow-up questions** to refine the assessment conversationally
- **Updates its analysis** as the user provides more information

---

## 🎯 Problem Statement

When people feel unwell, their first instinct is to Google their symptoms — which almost always leads to worst-case scenarios and unnecessary panic. At the same time, not every symptom warrants an emergency room visit, and people often don't know when something is serious.

MediSense AI bridges that gap: it gives people a calm, intelligent first assessment and a clear next step, powered by Gemini's medical reasoning.

---

## 🧠 How It Works

1. User describes their symptoms in the chat input
2. The app sends the symptoms to **Google Gemini 2.0 Flash** with a structured medical triage prompt
3. Gemini returns a JSON response with triage level, possible conditions, action steps, and clarifying questions
4. The app renders a visual triage card color-coded by urgency
5. The user can click follow-up questions or type more details
6. Gemini refines its assessment based on the full conversation history

---

## 🚦 Triage Levels

| Level              | Color | Meaning                                                   |
| ------------------ | ----- | --------------------------------------------------------- |
| 🔴 Emergency       | Red   | Life-threatening — call ambulance or go to ER immediately |
| 🟡 Urgent          | Amber | Needs care within hours — go to urgent care or ER         |
| 🔵 See a Doctor    | Blue  | Needs medical attention within 1–2 days                   |
| 🟢 Monitor at Home | Green | Manageable at home — watch for changes                    |

---

## 🛠 Tech Stack

| Tech                        | Role                                        |
| --------------------------- | ------------------------------------------- |
| HTML / CSS / JavaScript     | Frontend (zero framework, zero build step)  |
| Google Gemini 2.0 Flash API | AI reasoning and medical triage             |
| Gemini `systemInstruction`  | Structured JSON prompt engineering          |
| Conversation history        | Multi-turn context for follow-up refinement |

---

## 📁 Project Structure

```
medisense-ai/
└── index.html      # Entire app — UI, logic, and Gemini integration
└── README.md       # This file
```

---

## ⚡ Getting Started

### 1. Get a Gemini API Key

Go to [aistudio.google.com](https://aistudio.google.com), sign in, and create a free API key.

### 2. Add Your Key

Open `index.html` and find this line near the bottom:

```js
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
```

Replace `YOUR_API_KEY_HERE` with your actual key.

### 3. Run It

No server, no install, no build step needed. Just open `index.html` in any browser:

```bash
# Option 1: double-click the file
# Option 2: drag it into your browser
# Option 3: use a local server
npx serve .
```

---

## 💡 Key Features

- **Conversational triage** — not a form, a real back-and-forth chat
- **Multi-turn memory** — Gemini remembers the full conversation and refines its assessment
- **Clickable follow-up questions** — lowers friction for non-tech users
- **Color-coded urgency** — instantly communicates severity at a glance
- **Zero dependencies** — pure HTML/CSS/JS, runs anywhere
- **Medical disclaimer** — clearly states it's not a substitute for professional advice

---

## 🔮 Planned Features

- [ ] Voice input for symptoms
- [ ] Location-based hospital/clinic finder
- [ ] Medication interaction checker
- [ ] Symptom history tracking
- [ ] Multilingual support (Yoruba, Hausa, Igbo)
- [ ] Export symptom report as PDF for doctor visits

---

## ⚠️ Disclaimer

MediSense AI is for **informational purposes only**. It does not provide medical diagnoses and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.

---

## 👨‍💻 Built By

**Abdulmujeeb** — [@DevwithMujeeb](https://github.com/DevwithMujeeb)

Electrical/Electronics Engineering student, University of Ibadan.

---

## 🏆 Hackathon

Built at **Build-a-thon Ibadan** (MLH) for the **Best Use of the Google Gemini API** challenge.
