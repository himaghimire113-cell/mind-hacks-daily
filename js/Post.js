import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

if (!postId) {
    window.location.href = 'index.html';
}

// ============================================
// NAVIGATION
// ============================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navOverlay = document.getElementById('navOverlay');
const navClose = document.getElementById('navClose');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        navOverlay.classList.add('active');
        navOverlay.setAttribute('aria-hidden', 'false');
        hamburgerBtn.classList.add('active');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        navOverlay.setAttribute('aria-hidden', 'true');
        hamburgerBtn.classList.remove('active');
    });
}

// ============================================
// LOAD POST
// ============================================
async function loadPost() {
    const container = document.getElementById('postContent');
    if (!container) return;
    
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (!postSnap.exists()) {
            container.innerHTML = '<p class="empty-state">Post not found. <a href="index.html">Return home</a></p>';
            return;
        }
        
        const post = postSnap.data();
        const date = post.createdAt 
            ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) 
            : 'Recently';
        
        document.title = `${post.title} | Finance & Health Blog`;
        
        container.innerHTML = `
            <span class="category-badge">${post.category || 'General'}</span>
            <h1>${post.title}</h1>
            <div class="post-meta">
                <span>Published: ${date}</span>
                <span>By ${post.author || 'Editorial Team'}</span>
            </div>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width:100%;border-radius:12px;margin:28px 0;">` : ''}
            <div class="post-body">${post.content || '<p>No content available.</p>'}</div>
        `;
        
        document.getElementById('likeCount').textContent = post.likes || 0;
        
    } catch (error) {
        console.error('Error loading post:', error);
        container.innerHTML = '<p class="empty-state">Error loading article. Please refresh the page.</p>';
    }
}

// ============================================
// LIKE FUNCTIONALITY
// ============================================
const likeBtn = document.getElementById('likeBtn');
if (likeBtn) {
    const likedKey = `liked_${postId}`;
    
    if (localStorage.getItem(likedKey)) {
        likeBtn.classList.add('liked');
    }
    
    likeBtn.addEventListener('click', async () => {
        if (localStorage.getItem(likedKey)) {
            alert('You have already liked this post!');
            return;
        }
        
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, { likes: increment(1) });
            
            const currentCount = parseInt(document.getElementById('likeCount').textContent);
            document.getElementById('likeCount').textContent = currentCount + 1;
            likeBtn.classList.add('liked');
            localStorage.setItem(likedKey, 'true');
        } catch (error) {
            console.error('Like error:', error);
            alert('Unable to register like. Please try again.');
        }
    });
}

// ============================================
// SHARE FUNCTIONALITY
// ============================================
window.sharePost = function(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    switch(platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
            break;
        case 'email':
            window.location.href = `mailto:?subject=${title}&body=Check%20out%20this%20article:%20${url}`;
            break;
    }
};

// ============================================
// COMMENTS
// ============================================
async function loadComments() {
    const container = document.getElementById('commentsList');
    if (!container) return;
    
    try {
        const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="empty-state">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const comment = doc.data();
            const date = comment.createdAt 
                ? new Date(comment.createdAt.toDate()).toLocaleDateString() 
                : 'Recently';
            html += `
                <div class="comment">
                    <div class="comment-author">${comment.name}</div>
                    <div class="comment-date">${date}</div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Comments error:', error);
    }
}

const commentForm = document.getElementById('commentForm');
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('commenterName').value.trim();
        const text = document.getElementById('commentText').value.trim();
        
        if (!name || !text) return;
        
        try {
            await addDoc(collection(db, 'posts', postId, 'comments'), {
                name, text, createdAt: serverTimestamp()
            });
            commentForm.reset();
            loadComments();
        } catch (error) {
            console.error('Post comment error:', error);
            alert('Error posting comment. Please try again.');
        }
    });
}

// ============================================
// REVIEWS
// ============================================
async function loadReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    try {
        const q = query(collection(db, 'posts', postId, 'reviews'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="empty-state">No reviews yet.</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const review = doc.data();
            const date = review.createdAt 
                ? new Date(review.createdAt.toDate()).toLocaleDateString() 
                : 'Recently';
            const stars = '&#9733;'.repeat(review.rating) + '&#9734;'.repeat(5 - review.rating);
            html += `
                <div class="review">
                    <div class="review-author">${review.name}</div>
                    <div class="review-rating">${stars}</div>
                    <div class="review-date">${date}</div>
                    <div class="review-text">${review.text}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Reviews error:', error);
    }
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewerName').value.trim();
        const rating = parseInt(document.getElementById('reviewRating').value);
        const text = document.getElementById('reviewText').value.trim();
        
        if (!name || !text) return;
        
        try {
            await addDoc(collection(db, 'posts', postId, 'reviews'), {
                name, rating, text, createdAt: serverTimestamp()
            });
            reviewForm.reset();
            loadReviews();
        } catch (error) {
            console.error('Post review error:', error);
            alert('Error posting review. Please try again.');
        }
    });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadPost();
    loadComments();
    loadReviews();
});
