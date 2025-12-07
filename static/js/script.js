// --- UTILITIES ---

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

    // 1. Check Auth State for Dashboard/Profile
    if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('profile.html')) {

        const storedUser = localStorage.getItem('secure_user');

        if (!storedUser) {
            window.location.href = 'index.html';
        } else {
            // Update User Badge in Navbar (if exists)
            const userDisplay = document.querySelector('.user-badge');
            if (userDisplay) {
                userDisplay.innerHTML = `
                    <i class="fas fa-user-circle"></i> ${storedUser}
                    <div class="dropdown-menu">
                        <a href="profile.html" class="dropdown-item"><i class="fas fa-id-card"></i> Profile</a>
                        <a href="#" onclick="handleLogout()" class="dropdown-item" style="color: var(--danger)">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>`;
            }

            // Update Profile Page Details (if on profile.html)
            const profileName = document.getElementById('profile-username');
            if (profileName) {
                profileName.innerText = storedUser;
            }
        }
    }

    // 2. Initialize Visuals (Drag & Drop) - Only on dashboard
    if (document.getElementById('view-overview')) {
        setupDragDrop('drop-enc', 'file-enc', 'preview-enc-box', 'preview-enc-img');
        setupDragDrop('drop-dec', 'file-dec', 'preview-dec-box', 'preview-dec-img');

        // CHECK PREVIOUS VIEW STATE
        const lastView = localStorage.getItem('secure_last_view') || 'overview';
        window.switchView(lastView);
    }
});

// --- WINDOW FUNCTIONS ---

window.handleLogin = async (e) => {
    e.preventDefault();
    const inputVal = e.target.username.value;

    // CHANGED: Accepts Username OR Email (any text)
    if (inputVal && inputVal.trim() !== "") {
        localStorage.setItem('secure_user', inputVal);
        showFlash('Authenticating...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 500);
    } else {
        showFlash('Credentials Required', 'danger');
    }
};

window.handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;

    if (username) {
        localStorage.setItem('secure_user', username);
        showFlash('Identity created successfully. Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        showFlash('Username required', 'danger');
    }
};

window.handleForgot = async (e) => {
    e.preventDefault();
    showFlash('Recovery protocols simulated. Check "console" logs.', 'success');
};

window.handleLogout = () => {
    localStorage.removeItem('secure_user');
    localStorage.removeItem('secure_last_view');
    window.location.href = 'index.html';
};

// NEW: Handle Profile Update (Password)
window.handleProfileUpdate = (e) => {
    e.preventDefault();
    const p1 = e.target.p1.value;
    const p2 = e.target.p2.value;

    if (p1 !== p2) {
        showFlash('Passphrases do not match!', 'danger');
        return;
    }

    // Since this is mock local storage, we just simulate success
    showFlash('Security Credentials Updated Successfully.', 'success');
    e.target.reset();
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
    }

    if (type === 'enc') {
        const res = document.getElementById('enc-result');
        if (res) res.style.display = 'none';
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
        handleFile(e.target.files[0], area, box, img, areaId);
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
                    const panel = document.querySelector('.analysis-panel');
                    if (panel) {
                        panel.style.display = 'block';
                        // Create fake analysis bars
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

// --- STEGANOGRAPHY LOGIC ---
// (Kept exactly same as previous version)
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

window.processEncode = async () => {
    const msg = document.getElementById('enc-msg').value;
    const pass = document.getElementById('enc-pass').value;
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
            const binaryData = textToBin(encrypted + "|END|");

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
            document.getElementById('enc-result').style.display = 'block';
            dlBtn.href = resultUrl;
            dlBtn.download = 'secure_encoded.png';
            dlBtn.innerHTML = '<i class="fas fa-check"></i> DOWNLOAD RESULT';

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
            const terminator = "|END|";
            const stopIndex = rawText.indexOf(terminator);

            if (stopIndex !== -1) {
                const encrypted = rawText.substring(0, stopIndex);
                const decrypted = CryptoUtils.decrypt(encrypted, pass);
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