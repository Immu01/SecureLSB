# 🛡️ SecureLSB: Advanced Steganography & Encryption Tool

> **A professional web-based utility for secure communication, combining AES-256 encryption with LSB Image Steganography.**

## 📖 Overview

**SecureLSB** is a zero-knowledge security tool that allows users to hide secret messages inside standard image files (PNG). Unlike basic tools, SecureLSB employs a **Dual-Layer Security Protocol**:
1.  **Encryption:** The message is first scrambled using **AES-256** (Military-grade standard).
2.  **Steganography:** The encrypted data is then injected into the **Least Significant Bits (LSB)** of the image pixels.

The result is a standard-looking image that contains hidden, password-protected data.
---
## Website Link

---
## ✨ Key Features

### 🔐 Security & Privacy
* **Zero-Knowledge Architecture:** All encryption and image processing happen **Client-Side (in browser)**. No images or keys are ever sent to a server.
* **AES-256 Encryption:** Your message is mathematically locked before it touches the image.
* **Lossless Output:** Forces PNG export to prevent data corruption from compression.

### 🕵️‍♂️ Spy-Grade Tools
* **Public Hint System:** Embed a visible "Clue" (e.g., "Meeting Location") that appears automatically when the receiver uploads the image.
* **Auto-Detection:** The decoder instantly scans uploaded images for hidden hints without needing the password first.
* **Smart Filename Preservation:** Downloads keep the original context (e.g., `vacation.jpg` → `vacation_secure.png`).

### 🎨 User Experience
* **Glassmorphism UI:** A modern, responsive interface featuring blur effects and transparency.
* **Cross-Platform:** Works seamlessly on Desktop, Tablets, and Mobile devices.
* **User Accounts:** Firebase Authentication system to manage access.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 | Semantic markup + Modern "Glass" UI Design |
| **Logic** | JavaScript (ES6+) | Modular architecture for game logic & UI control |
| **Encryption** | CryptoJS | Implements AES-256 algorithms |
| **Steganography** | HTML5 Canvas API | Pixel-level manipulation (Bitwise operations) |
| **Auth** | Firebase v11 | Secure User Login/Registration |

---

## 🚀 How to Run Locally

To run this project on your local machine:

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/SecureLSB.git](https://github.com/your-username/SecureLSB.git)
    cd SecureLSB
    ```

2.  **Configure Firebase**
    * Create a project at [Firebase Console](https://console.firebase.google.com/).
    * Enable "Authentication" (Email/Password).
    * Copy your web app configuration keys.
    * Paste them into `static/js/firebase-config.js`.

3.  **Launch**
    * Simply open `index.html` in any modern web browser.
    * *Note: For strict browser security policies, use a local server (e.g., Live Server in VS Code).*

---

## ⚠️ Security Warning

* **Do not lose your Password:** Since we use Zero-Knowledge architecture, we do not store your encryption keys. If you forget the key used to lock an image, the data is irretrievable.
* **Transfer Protocol:** Always share the encoded images as **"Files"** or **"Documents"**. Sending them as standard photos on WhatsApp, Messenger, or Instagram will compress the image and destroy the hidden data.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
