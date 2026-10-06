# ⚔️ TROSC · IT Challenge

<p align="center">
<strong>A monster-battle quiz game built for the TROSC IT Session at Suez Canal University.</strong>
</p>

<p align="center">
Freshmen scan a QR code, enter their name, and battle through <strong>10 IT-themed monsters</strong> by answering beginner-friendly technology questions.
</p>

<p align="center">
<strong>Think. Choose. Slay. ⚡</strong>
</p>

<p align="center">
🎮 <a href="https://trosc-challenge.vercel.app">Play the Live Game</a> 🎮
</p>

---

## 🎮 About

**TROSC IT Challenge** is an interactive, mobile-first quiz game designed for the **TROSC IT session** at **Suez Canal University**.

Instead of a traditional quiz, players fight their way through a series of IT-themed monsters while managing their **hearts, time, XP, and combo streaks**. The final level features the ultimate boss:

> 👑 **KERNEL PANIC**

The entire experience runs directly in the browser with **no backend and no external services required**.

---

## ✨ Features

- 🎮 **Monster Battle System** — every question is presented as a monster fight with animated sprites.
- ❤️ **5 Hearts** — wrong answers and timeouts cost one heart. Lose them all → **Game Over**.
- ⏱️ **45 Seconds Per Level** — with **HURRY** and **DANGER** warnings as time runs out.
- ⚡ **XP Scoring** — earn XP from correct answers, speed bonuses, and combo streaks.
- 🔥 **Combo System** — reach **ON FIRE**, **UNSTOPPABLE**, and **GODLIKE** streaks.
- 🔊 **Synthesized Sound Effects** — generated using WebAudio, with no audio files required.
- 📳 **Android Vibration** — tactile feedback during important game events.
- 👑 **Final Boss** — face **KERNEL PANIC** on Level 10.
- 🏆 **Ranks** — finish with an **S / A / B / C** rank depending on your performance.
- 📊 **Run Recap** — review your performance after finishing a run.
- 🥇 **Personal Best** — your best score is saved locally on your device.
- 📱 **Mobile-First UI** — designed around thumb-zone controls and safe-area padding.
- ⏸️ **Visibility Pause** — the game pauses automatically when the browser tab becomes hidden.
- 💾 **Auto Resume** — refreshing the page during a game lets you continue your run.
- 🔌 **Fully Static** — no backend, database, authentication, or server required.

---

## 🛠️ Tech Stack

- **Next.js** — App Router
- **React**
- **Tailwind CSS v4**
- **WebAudio API**
- **Browser Local Storage**
- **Zero additional dependencies**
- **No backend**

---

## 🚀 Live Project

🎮 **Play now:**  
https://trosc-challenge.vercel.app

The game is deployed on **Vercel** and is ready to be shared through the TROSC session QR code.

---

## 💻 Run Locally

### Requirements

- Node.js **18.18+**
- Node.js **20 recommended**

### Installation

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## ☁️ Deployment

### Vercel

The project works with **zero configuration** on Vercel.

Connect the repository to Vercel and deploy.

### Render

For a static deployment:

1. Push the repository to GitHub.
2. Go to **Render → New + → Static Site**.
3. Connect the repository.
4. Use:

```text
Build Command:
npm install && npm run build

Publish Directory:
out
```

5. Deploy.

Every push to `main` can automatically trigger a new deployment.

---

## 🎮 Editing the Game

| What you want to change    | File               |
| -------------------------- | ------------------ |
| Questions & answers        | `lib/questions.js` |
| Timer, warnings & hearts   | `lib/game.js`      |
| Join form & website links  | `lib/game.js`      |
| Monster names & appearance | `lib/monsters.js`  |
| Community logo             | `public/logo.png`  |

### Question Format

```js
{
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 0,
  explanation: "Shown after answering."
}
```

`correctAnswer` is the **index** of the correct option.

---

## 📁 Project Structure

```text
app/             → Layout, page & global styles
components/      → Game, WelcomeScreen, BattleScreen, ResultScreen, useGame
lib/             → Questions, game config, monsters, sounds & icons
public/          → Logo and static assets
```

---

## 👥 TROSC IT Team

### IT Head

**Basem Esam**

### Vice IT Head

**Mahmoud Sameh**

The challenge was created as part of the **TROSC IT Team** initiative to make learning and introducing technology more interactive for students.

---

## 🌐 TROSC

**TROSC — Suez Canal University**

Website:  
https://trosc.vercel.app

---

## 📄 License

This project is licensed under the **MIT License**.

Free to use, learn from, modify, and remix.

---

<p align="center">
Made with ❤️ by the <strong>TROSC IT Team</strong><br>
Suez Canal University
</p>
