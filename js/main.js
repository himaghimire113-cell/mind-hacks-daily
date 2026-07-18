import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================
// NAVIGATION
// ============================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navOverlay = document.getElementById('navOverlay');
const navClose = document.getElementById('navClose');

function openNav() {
    navOverlay.classList.add('active');
    navOverlay.setAttribute('aria-hidden', 'false');
    if (hamburgerBtn) hamburgerBtn.classList.add('active');
}

function closeNav() {
    navOverlay.classList.remove('active');
    navOverlay.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', openNav);
if (navClose) navClose.addEventListener('click', closeNav);
if (navOverlay) {
    navOverlay.addEventListener('click', (e) => {
        if (e.target === navOverlay) closeNav();
    });
}

// ============================================
// LOAD POSTS
// ============================================
async function loadPosts() {
    const featuredContainer = document.getElementById('featuredPosts');
    const latestContainer = document.getElementById('latestPosts');
    
    if (!featuredContainer && !latestContainer) return;
    
    try {
        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(postsQuery);
        
        let featuredHTML = '';
        let latestHTML = '';
        let featuredCount = 0;
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            const date = post.createdAt 
                ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  }) 
                : 'Recently';
            
            const cardHTML = `
                <article class="post-card" onclick="window.location.href='post.html?id=${postId}'" tabindex="0" role="link" 
                    onkeydown="if(event.key==='Enter')window.location.href='post.html?id=${postId}'">
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" loading="lazy">` : ''}
                    <div class="post-card-content">
                        <span class="category-badge">${post.category || 'General'}</span>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt || ''}</p>
                        <div class="post-meta">
                            <span>${date}</span>
                            <span>&#9829; ${post.likes || 0}</span>
                        </div>
                    </div>
                </article>
            `;
            
            if (post.featured && featuredCount < 3) {
                featuredHTML += cardHTML;
                featuredCount++;
            }
            latestHTML += cardHTML;
        });
        
        if (featuredContainer) {
            featuredContainer.innerHTML = featuredHTML || '<p class="empty-state">No featured posts yet.</p>';
        }
        if (latestContainer) {
            latestContainer.innerHTML = latestHTML || '<p class="empty-state">No posts yet. Create one from the admin panel!</p>';
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const errorHTML = '<p class="empty-state">Unable to load posts. Please check your connection.</p>';
        if (featuredContainer) featuredContainer.innerHTML = errorHTML;
        if (latestContainer) latestContainer.innerHTML = errorHTML;
    }
}

// ============================================
// NEWSLETTER
// ============================================
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('subscriberEmail').value.trim();
        const messageEl = document.getElementById('newsletterMessage');
        
        try {
            await addDoc(collection(db, 'subscribers'), {
                email: email,
                subscribedAt: serverTimestamp()
            });
            messageEl.textContent = 'Thank you for subscribing! Check your inbox soon.';
            messageEl.className = 'form-message success';
            newsletterForm.reset();
            setTimeout(() => { messageEl.style.display = 'none'; }, 5000);
        } catch (error) {
            console.error('Newsletter error:', error);
            messageEl.textContent = 'Error subscribing. Please try again later.';
            messageEl.className = 'form-message error';
        }
    });
}

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('contactMessage');
        
        try {
            await addDoc(collection(db, 'messages'), {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value,
                createdAt: serverTimestamp()
            });
            messageEl.textContent = 'Message sent successfully! We will respond within 24 hours.';
            messageEl.className = 'form-message success';
            contactForm.reset();
        } catch (error) {
            console.error('Contact error:', error);
            messageEl.textContent = 'Error sending message. Please try again.';
            messageEl.className = 'form-message error';
        }
    });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', loadPosts);
