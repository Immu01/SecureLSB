import { auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// --- UTILITIES ---

// Store original filename for download
window.currentUploadName = "secure_image";

function showFlash(message, type = 'danger') {
    const container = document.getElementById('flash-container');
    if (container) {
        container.innerHTML = `
            <div style="color: var(--${type}); text-align: center; margin-bottom: 15px; font-size: 0.9rem;">
                ${message}
            </div>`;
    } else {
        alert(message);
    }
}

const CryptoUtils = {
    encrypt: (text, password) => {
        if (typeof CryptoJS === 'undefined') return alert('CryptoJS Library missing!');
        return CryptoJS.AES.encrypt(text, password).toString();
    },
    decrypt: (cipherText, password) => {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, password);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return null;
        }
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {

    if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('profile.html')) {

        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'index.html';
            } else {
                const userDisplay = document.querySelector('.user-badge');
                if (userDisplay) {
                    const displayName = user.displayName || user.email.split('@')[0];
                    userDisplay.innerHTML = `
                        <i class="fas fa-user-circle"></i> ${displayName}
                        <div class="dropdown-menu">
                            <a href="profile.html" class="dropdown-item"><i class="fas fa-id-card"></i> Profile</a>
                            <a href="#" onclick="handleLogout()" class="dropdown-item" style="color: var(--danger)">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>`;
                }
                const profileName = document.getElementById('profile-username');
                if (profileName) {
                    profileName.innerText = user.displayName || "Agent";
                }
            }
        });
    }

    if (document.getElementById('view-overview')) {
        setupDragDrop('drop-enc', 'file-enc', 'preview-enc-box', 'preview-enc-img');
        setupDragDrop('drop-dec', 'file-dec', 'preview-dec-box', 'preview-dec-img');

        const lastView = localStorage.getItem('secure_last_view') || 'overview';
        window.switchView(lastView);
    }
});

// --- WINDOW FUNCTIONS ---

window.handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.username.value;
    const password = e.target.password.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Login Error:", error.code);
        let msg = 'Login failed.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            msg = 'Incorrect Email or Password.';
        } else if (error.code === 'auth/invalid-email') {
            msg = 'Invalid Email Format.';
        } else if (error.code === 'auth/too-many-requests') {
            msg = 'Too many attempts. Try again later.';
        } else {
            msg = error.code;
        }
        showFlash(msg, 'danger');
    }
};

window.handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        showFlash('Identity created successfully. Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
    } catch (error) {
        let msg = error.code;
        if (msg === 'auth/email-already-in-use') msg = 'Email is already registered.';
        if (msg === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
        showFlash(msg, 'danger');
    }
};

window.handleForgot = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    try {
        await sendPasswordResetEmail(auth, email);
        showFlash('Reset link sent to your email.', 'success');
    } catch (error) {
        showFlash(error.code, 'danger');
    }
};

window.handleLogout = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error", error);
    }
};

window.handleProfileUpdate = (e) => {
    e.preventDefault();
    showFlash('Security Protocol: Password changes require Re-Authentication (Feature Locked in V1.0)', 'text-muted');
};

window.switchView = (viewName) => {
    ['overview', 'encode', 'decode'].forEach(id => {
        const el = document.getElementById('view-' + id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById('view-' + viewName);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const navItems = document.querySelectorAll('.nav-item');
    if (viewName === 'overview' && navItems[0]) navItems[0].classList.add('active');
    if (viewName === 'encode' && navItems[1]) navItems[1].classList.add('active');
    if (viewName === 'decode' && navItems[2]) navItems[2].classList.add('active');

    localStorage.setItem('secure_last_view', viewName);
};

window.clearImage = (type) => {
    const box = document.getElementById(`preview-${type}-box`);
    const area = document.getElementById(`drop-${type}`);
    const img = document.getElementById(`preview-${type}-img`);
    const input = document.getElementById(`file-${type}`);

    input.value = '';
    img.src = '';

    box.style.display = 'none';
    area.style.display = 'flex';

    if (type === 'dec') {
        const panel = document.querySelector('.analysis-panel');
        if (panel) panel.style.display = 'none';

        // Reset output on clear
        const output = document.getElementById('dec-output');
        if (output) {
            output.innerText = "[WAITING FOR INPUT]";
            output.style.color = "var(--text-muted)";
        }
    }

    if (type === 'enc') {
        const res = document.getElementById('enc-result');
        if (res) res.style.display = 'none';

        const warning = document.getElementById('compression-warning');
        if (warning) warning.remove();
    }
};

// --- DRAG & DROP LOGIC ---
function setupDragDrop(areaId, inputId, previewId, imgId) {
    const area = document.getElementById(areaId);
    const input = document.getElementById(inputId);
    const box = document.getElementById(previewId);
    const img = document.getElementById(imgId);

    if (!area) return;

    area.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f) {
            // Save filename if we are encoding
            if (areaId === 'drop-enc') window.currentUploadName = f.name;
            handleFile(f, area, box, img, areaId);
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.remove('highlight'), false);
    });

    area.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            input.files = files;
            // Save filename if we are encoding
            if (areaId === 'drop-enc') window.currentUploadName = files[0].name;
            handleFile(files[0], area, box, img, areaId);
        }
    });
}

function handleFile(file, area, box, img, areaId) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            img.src = evt.target.result;
            area.style.display = 'none';
            box.style.display = 'flex';
            img.onload = () => {
                if (areaId === 'drop-dec') {
                    // *** 2. AUTO-SCAN FOR HINT ON UPLOAD ***
                    attemptHintScan(img);

                    const panel = document.querySelector('.analysis-panel');
                    if (panel) {
                        panel.style.display = 'block';
                        const bars = panel.querySelector('.bars');
                        if (bars) {
                            let html = '';
                            for (let i = 0; i < 20; i++) html += `<div class="bar" style="height: ${Math.random() * 100}%"></div>`;
                            bars.innerHTML = html;
                        }
                    }
                }
            };
        };
        reader.readAsDataURL(file);
    }
}

// --- STEGANOGRAPHY CORE ---
function textToBin(text) {
    let output = "";
    for (let i = 0; i < text.length; i++) {
        output += text[i].charCodeAt(0).toString(2).padStart(8, "0");
    }
    return output;
}

function binToText(bin) {
    let output = "";
    for (let i = 0; i < bin.length; i += 8) {
        output += String.fromCharCode(parseInt(bin.substr(i, 8), 2));
    }
    return output;
}

// *** NEW: Helper to scan only the hint portion ***
function attemptHintScan(img) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let binaryData = "";

        // Read just the first 16000 bits (enough to find a hint)
        // Optimization: don't read the whole image just for the hint
        const limit = Math.min(data.length, 16000);

        for (let i = 0; i < limit; i += 4) {
            binaryData += (data[i] & 1).toString();
            binaryData += (data[i + 1] & 1).toString();
            binaryData += (data[i + 2] & 1).toString();
        }

        const rawText = binToText(binaryData);

        // Check for HINT pattern
        if (rawText.includes("HINT:{") && rawText.includes("}|SPLIT|")) {
            const start = rawText.indexOf("HINT:{") + 6;
            const end = rawText.indexOf("}|SPLIT|");
            const hintMsg = rawText.substring(start, end);

            // Display Hint Immediately
            const output = document.getElementById('dec-output');
            output.innerHTML = `
                <div style="border: 1px solid var(--primary); padding: 10px; border-radius: 6px; background: rgba(59, 130, 246, 0.1);">
                    <strong style="color: var(--primary)">DETECTED CLUE:</strong><br>
                    <span style="font-size: 1.1rem; color: white;">"${hintMsg}"</span>
                </div>
                <div style="margin-top: 10px; font-size: 0.8rem;">Enter the answer above to unlock.</div>
            `;
        }
    } catch (e) {
        console.log("Hint scan error", e);
    }
}

window.processEncode = async () => {
    const msg = document.getElementById('enc-msg').value;
    const pass = document.getElementById('enc-pass').value;
    const hint = document.getElementById('enc-hint').value; // *** 1. GET HINT ***
    const img = document.getElementById('preview-enc-img');
    const btn = document.querySelector('#view-encode .btn-primary');

    if (!msg || !pass || !img.src) {
        alert('Missing Requirements: Image, Message, and Key.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> ENCRYPTING...';
    btn.disabled = true;

    setTimeout(() => {
        try {
            const encrypted = CryptoUtils.encrypt(msg, pass);

            // Build Payload: Include Hint if present
            let fullPayload = "";
            if (hint && hint.trim() !== "") {
                fullPayload = `HINT:{${hint}}|SPLIT|${encrypted}|END|`;
            } else {
                fullPayload = `${encrypted}|END|`;
            }

            const binaryData = textToBin(fullPayload);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            if (binaryData.length > data.length / 4 * 3) {
                throw new Error("Message too long for this carrier image.");
            }

            let dataIdx = 0;
            for (let i = 0; i < data.length; i += 4) {
                if (dataIdx >= binaryData.length) break;
                // R
                if (dataIdx < binaryData.length) { data[i] = (data[i] & 254) | parseInt(binaryData[dataIdx]); dataIdx++; }
                // G
                if (dataIdx < binaryData.length) { data[i + 1] = (data[i + 1] & 254) | parseInt(binaryData[dataIdx]); dataIdx++; }
                // B
                if (dataIdx < binaryData.length) { data[i + 2] = (data[i + 2] & 254) | parseInt(binaryData[dataIdx]); dataIdx++; }
            }

            ctx.putImageData(imgData, 0, 0);

            const resultUrl = canvas.toDataURL('image/png');
            const dlBtn = document.getElementById('download-btn');
            const resContainer = document.getElementById('enc-result');

            resContainer.style.display = 'block';
            dlBtn.href = resultUrl;

            // *** 3. FILENAME PRESERVATION LOGIC ***
            let originalName = window.currentUploadName || "image.png";
            // Strip existing extension
            const dotIndex = originalName.lastIndexOf('.');
            if (dotIndex !== -1) originalName = originalName.substring(0, dotIndex);

            // Force PNG extension for stego stability
            dlBtn.download = `${originalName}_secure.png`;

            dlBtn.innerHTML = '<i class="fas fa-check"></i> DOWNLOAD RESULT';

            if (!document.getElementById('compression-warning')) {
                const warning = document.createElement('div');
                warning.id = 'compression-warning';
                warning.style.marginTop = '15px';
                warning.style.padding = '10px';
                warning.style.background = 'rgba(239, 68, 68, 0.1)';
                warning.style.border = '1px solid var(--danger)';
                warning.style.borderRadius = '6px';
                warning.style.fontSize = '0.85rem';
                warning.style.color = '#ff8888';
                warning.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i> <strong>CRITICAL TRANSFER WARNING</strong><br>
                    Send as "FILE" or "DOCUMENT" only.<br>
                    Compression will destroy the data.
                `;
                resContainer.appendChild(warning);
            }

        } catch (err) {
            alert('Encoding Error: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 100);
}

window.processDecode = () => {
    const pass = document.getElementById('dec-pass').value;
    const img = document.getElementById('preview-dec-img');
    const output = document.getElementById('dec-output');
    const btn = document.querySelector('#view-decode .btn-primary');

    if (!pass || !img.src) {
        alert('Missing: Stego-Image and Key.');
        return;
    }

    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> DECRYPTING...';
    btn.disabled = true;

    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let binaryData = "";

            for (let i = 0; i < data.length; i += 4) {
                binaryData += (data[i] & 1).toString();
                binaryData += (data[i + 1] & 1).toString();
                binaryData += (data[i + 2] & 1).toString();
            }

            const rawText = binToText(binaryData);

            // Clean up HINT structure if present so we get just the encrypted text
            let encryptedPart = rawText;
            if (rawText.includes("}|SPLIT|")) {
                encryptedPart = rawText.split("}|SPLIT|")[1];
            }

            const terminator = "|END|";
            const stopIndex = encryptedPart.indexOf(terminator);

            if (stopIndex !== -1) {
                const finalCipher = encryptedPart.substring(0, stopIndex);
                const decrypted = CryptoUtils.decrypt(finalCipher, pass);
                if (decrypted) {
                    output.innerText = decrypted;
                    output.style.color = 'var(--success)';
                } else {
                    output.innerText = "ACCESS DENIED: Incorrect Key";
                    output.style.color = 'var(--danger)';
                }
            } else {
                output.innerText = "NO DATA DETECTED / CORRUPTED";
                output.style.color = 'var(--text-muted)';
            }
        } catch (err) {
            output.innerText = "SYSTEM FAILURE";
            output.style.color = 'var(--danger)';
        } finally {
            btn.innerHTML = '<i class="fas fa-crosshairs"></i> EXECUTE EXTRACT';
            btn.disabled = false;
        }
    }, 100);
}