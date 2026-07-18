import { db, auth } from './firebase-config.js';
import { 
    collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp, addDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    signInWithEmailAndPassword, updatePassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================================
// AUTH STATE
// ============================================
onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (user) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'flex';
        loadAdminData();
    } else {
        if (loginScreen) loginScreen.style.display = 'flex';
        if (adminDashboard) adminDashboard.style.display = 'none';
    }
});

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            errorEl.textContent = '';
        } catch (error) {
            console.error('Login error:', error);
            errorEl.textContent = 'Invalid email or password. Please try again.';
        }
    });
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth);
    });
}

// ============================================
// TAB NAVIGATION
// ============================================
const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetTab = document.getElementById(`tab-${tab.dataset.tab}`);
        if (targetTab) targetTab.classList.add('active');
    });
});

// ============================================
// RICH TEXT EDITOR
// ============================================
const editor = document.getElementById('richEditor');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');

document.querySelectorAll('.editor-toolbar button[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, null);
        editor.focus();
    });
});

if (fontSize) {
    fontSize.addEventListener('change', () => {
        document.execCommand('fontSize', false, fontSize.value);
        editor.focus();
    });
}

if (fontColor) {
    fontColor.addEventListener('input', () => {
        document.execCommand('foreColor', false, fontColor.value);
        editor.focus();
    });
}

// ============================================
// MEDIA INSERTION
// ============================================
let currentMediaType = '';

document.getElementById('addVideoBtn')?.addEventListener('click', () => {
    currentMediaType = 'video';
    togglePanel('mediaInputs');
});

document.getElementById('addImageBtn')?.addEventListener('click', () => {
    currentMediaType = 'image';
    togglePanel('mediaInputs');
});

document.getElementById('addLinkBtn')?.addEventListener('click', () => {
    togglePanel('linkInputs');
});

function togglePanel(panelId) {
    document.getElementById('mediaInputs').style.display = 'none';
    document.getElementById('linkInputs').style.display = 'none';
    document.getElementById(panelId).style.display = 'block';
}

document.getElementById('insertMediaBtn')?.addEventListener('click', () => {
    const url = document.getElementById('mediaUrl').value.trim();
    if (!url) return;
    
    let html = '';
    if (currentMediaType === 'video') {
        // Support YouTube embed conversion
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        html = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%;height:400px;border-radius:12px;"></iframe><br>`;
    } else {
        html = `<img src="${url}" alt="Embedded image" style="max-width:100%;border-radius:12px;"><br>`;
    }
    
    editor.innerHTML += html;
    document.getElementById('mediaUrl').value = '';
    document.getElementById('mediaInputs').style.display = 'none';
});

document.getElementById('insertLinkBtn')?.addEventListener('click', () => {
    const text = document.getElementById('linkText').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    if (!text || !url) return;
    
    editor.innerHTML += `<a href="${url}" target="_blank" rel="noopener sponsored" class="affiliate-link">${text}</a><br>`;
    document.getElementById('linkText').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkInputs').style.display = 'none';
});

// ============================================
// SAVE / UPDATE POST
// ============================================
const postForm = document.getElementById('postForm');
let editingPostId = null;

if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postData = {
            title: document.getElementById('postTitle').value.trim(),
            excerpt: document.getElementById('postExcerpt').value.trim(),
            image: document.getElementById('postImage').value.trim(),
            category: document.getElementById('postCategory').value,
            featured: document.getElementById('postFeatured').checked,
            content: editor.innerHTML,
            author: auth.currentUser?.email || 'Admin',
            updatedAt: serverTimestamp()
        };
        
        try {
            if (editingPostId) {
                await setDoc(doc(db, 'posts', editingPostId), postData, { merge: true });
                alert('Post updated successfully!');
            } else {
                postData.createdAt = serverTimestamp();
                postData.likes = 0;
                const newRef = doc(collection(db, 'posts'));
                await setDoc(newRef, postData);
                alert('Post published successfully!');
            }
            
            resetEditor();
            loadAdminPosts();
            tabs[0].click(); // Switch to posts list
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving post. Please try again.');
        }
    });
}

function resetEditor() {
    document.getElementById('postForm').reset();
    editor.innerHTML = '';
    editingPostId = null;
    document.getElementById('editPostId').value = '';
    document.getElementById('editorTitle').textContent = 'Create New Post';
    document.getElementById('savePostBtn').textContent = 'Publish Post';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

document.getElementById('cancelEditBtn')?.addEventListener('click', resetEditor);

// ============================================
// LOAD POSTS (ADMIN)
// ============================================
async function loadAdminPosts() {
    const container = document.getElementById('adminPostsList');
    if (!container) return;
    
    try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="empty-state">No posts yet. Create your first post!</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const date = post.createdAt 
                ? new Date(post.createdAt.toDate()).toLocaleDateString() 
                : 'Recently';
            html += `
                <div class="admin-post-item">
                    <div>
                        <h4>${post.title}</h4>
                        <p>${post.category || 'General'} | ${date} | &#9829; ${post.likes || 0}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="edit-btn" onclick="window.editPost('${docSnap.id}')">Edit</button>
                        <button class="delete-btn" onclick="window.deletePost('${docSnap.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load posts error:', error);
    }
}

window.editPost = async function(id) {
    try {
        const postSnap = await getDoc(doc(db, 'posts', id));
        if (!postSnap.exists()) return;
        
        const post = postSnap.data();
        editingPostId = id;
        
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postExcerpt').value = post.excerpt || '';
        document.getElementById('postImage').value = post.image || '';
        document.getElementById('postCategory').value = post.category || 'finance';
        document.getElementById('postFeatured').checked = post.featured || false;
        editor.innerHTML = post.content || '';
        
        document.getElementById('editorTitle').textContent = 'Edit Post';
        document.getElementById('savePostBtn').textContent = 'Update Post';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        
        tabs[1].click(); // Switch to editor tab
    } catch (error) {
        console.error('Edit error:', error);
        alert('Error loading post for editing.');
    }
};

window.deletePost = async function(id) {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    
    try {
        await deleteDoc(doc(db, 'posts', id));
        loadAdminPosts();
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting post.');
    }
};

// ============================================
// SUBSCRIBERS & CSV EXPORT
// ============================================
async function loadSubscribers() {
    const container = document.getElementById('subscribersList');
    if (!container) return;
    
    try {
        const snapshot = await getDocs(collection(db, 'subscribers'));
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="empty-state">No subscribers yet.</p>';
            return;
        }
        
        let html = `
            <div class="data-table-row data-table-header">
                <div>Email Address</div>
                <div>Subscribed Date</div>
                <div>Status</div>
            </div>
        `;
        
        snapshot.forEach(docSnap => {
            const sub = docSnap.data();
            const date = sub.subscribedAt 
                ? new Date(sub.subscribedAt.toDate()).toLocaleDateString() 
                : 'N/A';
            html += `
                <div class="data-table-row">
                    <div>${sub.email}</div>
                    <div>${date}</div>
                    <div>Active</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Subscribers error:', error);
    }
}

document.getElementById('exportCsvBtn')?.addEventListener('click', async () => {
    try {
        const snapshot = await getDocs(collection(db, 'subscribers'));
        let csv = 'Email,Subscribed Date,Status\n';
        
        snapshot.forEach(docSnap => {
            const sub = docSnap.data();
            const date = sub.subscribedAt 
                ? new Date(sub.subscribedAt.toDate()).toLocaleDateString() 
                : 'N/A';
            csv += `"${sub.email}","${date}","Active"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting CSV.');
    }
});

// ============================================
// MESSAGES
// ============================================
async function loadMessages() {
    const container = document.getElementById('messagesList');
    if (!container) return;
    
    try {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="empty-state">No contact messages yet.</p>';
            return;
        }
        
        let html = `
            <div class="data-table-row data-table-header">
                <div>Name</div>
                <div>Subject</div>
                <div>Date</div>
            </div>
        `;
        
        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            const date = msg.createdAt 
                ? new Date(msg.createdAt.toDate()).toLocaleDateString() 
                : 'N/A';
            html += `
                <div class="data-table-row">
                    <div>${msg.name}</div>
                    <div>${msg.subject}</div>
                    <div>${date}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Messages error:', error);
    }
}

// ============================================
// INVITE ADMIN
// ============================================
const inviteForm = document.getElementById('inviteForm');
if (inviteForm) {
    inviteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('inviteEmail').value.trim();
        
        try {
            await addDoc(collection(db, 'invitedAdmins'), {
                email: email,
                invitedBy: auth.currentUser.email,
                invitedAt: serverTimestamp()
            });
            alert(`Invitation recorded for ${email}.\n\nNext step: Go to Firebase Console > Authentication > Add User to create their login.`);
            inviteForm.reset();
        } catch (error) {
            console.error('Invite error:', error);
            alert('Error recording invitation.');
        }
    });
}

// ============================================
// CHANGE PASSWORD
// ============================================
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }
        
        try {
            await updatePassword(auth.currentUser, newPassword);
            alert('Password updated successfully! Please use your new password next time.');
            passwordForm.reset();
        } catch (error) {
            console.error('Password error:', error);
            if (error.code === 'auth/requires-recent-login') {
                alert('For security, please log out and log back in before changing your password.');
            } else {
                alert('Error updating password: ' + error.message);
            }
        }
    });
}

// ============================================
// LOAD ALL ADMIN DATA
// ============================================
function loadAdminData() {
    loadAdminPosts();
    loadSubscribers();
    loadMessages();
}
