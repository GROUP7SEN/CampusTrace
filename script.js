// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD1A7PCfIIu-ja3Langp5V_kLXEPDCbbsE",
  authDomain: "oau-lost-and-found.firebaseapp.com",
  projectId: "oau-lost-and-found",
  storageBucket: "oau-lost-and-found.firebasestorage.app",
  messagingSenderId: "1039137571247",
  appId: "1:1039137571247:web:981f9871e5e1588b1faf5a"
};

// Initialize Firebase Services
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Hamburger Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('open');
      navMenu.classList.toggle('active');
    });
  }
});

// Auth Guard & User Session
const currentUserName = localStorage.getItem('userName') || '';
const currentUserEmail = localStorage.getItem('userEmail') || '';
const currentUserMatric = localStorage.getItem('userMatric') || '';

if (!currentUserEmail && window.location.pathname.includes('dashboard.html')) {
  window.location.href = 'login.html';
}

const userDisplay = document.getElementById('user-display');
if (userDisplay && currentUserName) {
  userDisplay.textContent = `${currentUserName} (${currentUserMatric})`;
}

// Helpers
const getInitials = name => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

let localPostsCache = [];

// Real-time Firestore Feed Listener
if (document.getElementById('feed-container')) {
  db.collection('portal_items').onSnapshot(snapshot => {
    localPostsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderFeed();
  });
}

// Render Posts with Search and Category Filtering
function renderFeed() {
  const feedContainer = document.getElementById('feed-container');
  const searchQuery = (document.getElementById('search-input')?.value || '').toLowerCase();
  const filterCategory = document.getElementById('category-filter')?.value || 'all';

  if (!feedContainer) return;

  const posts = localPostsCache.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery) || post.desc.toLowerCase().includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || post.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (posts.length === 0) {
    feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 20px;">No items found matching your criteria.</p>`;
    return;
  }

  feedContainer.innerHTML = posts.map(post => {
    const isOwner = post.email === currentUserEmail;
    return `
      <div class="feed-card ${post.type} ${post.resolved ? 'resolved' : ''}">
        <div class="card-header">
          <div class="avatar">${post.initials}</div>
          <div class="meta">
            <strong>${post.userName}</strong>
            <span>${post.type.toUpperCase()} • ${post.statusText || 'Active'}</span>
          </div>
        </div>
        <div class="card-body">
          <h3>${post.title} ${post.resolved ? '<span class="badge badge-resolved">Resolved</span>' : ''}</h3>
          <p>${post.desc}</p>
          ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-img" alt="Item Image" />` : ''}
        </div>
        <div class="card-footer">
          <a href="mailto:${post.email}?subject=Regarding ${post.title} on CampusTrace" class="btn btn-outline" style="font-size:0.8rem;">
            ✉️ Contact Owner
          </a>
          <div style="display:flex; gap:8px;">
            ${isOwner && !post.resolved ? `<button onclick="markResolved('${post.id}')" class="btn btn-primary" style="font-size:0.8rem;">Mark Resolved</button>` : ''}
            ${isOwner ? `<button onclick="deletePost('${post.id}')" class="btn btn-danger" style="font-size:0.8rem;">Delete</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Search and Filter Listeners
document.getElementById('search-input')?.addEventListener('input', renderFeed);
document.getElementById('category-filter')?.addEventListener('change', renderFeed);

// Submit Missing Item Report
document.getElementById('report-lost-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('lost-title').value.trim();
  const desc = document.getElementById('lost-desc').value.trim();

  db.collection('portal_items').add({
    type: 'missing',
    title, desc,
    userName: currentUserName,
    email: currentUserEmail,
    initials: getInitials(currentUserName),
    resolved: false,
    statusText: 'Missing Item',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert('Missing item published!');
    this.reset();
  });
});

// Submit Found Item Report (with Firebase Storage Image Upload)
document.getElementById('report-found-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('found-title').value.trim();
  const desc = document.getElementById('found-desc').value.trim();
  const imageFile = document.getElementById('found-img').files[0];
  const submitBtn = document.getElementById('submit-found-btn');

  if (!imageFile) return alert('Please attach a photo of the found item.');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading Photo...';

  const storageRef = storage.ref(`found_items/${Date.now()}_${imageFile.name}`);
  storageRef.put(imageFile)
    .then(snap => snap.ref.getDownloadURL())
    .then(imageUrl => {
      return db.collection('portal_items').add({
        type: 'found',
        title, desc, imageUrl,
        userName: currentUserName,
        email: currentUserEmail,
        initials: getInitials(currentUserName),
        resolved: false,
        statusText: 'Found Item',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert('Found item published successfully!');
      this.reset();
      document.getElementById('imagePreviewContainer').style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      alert('Error uploading image. Please try again.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publish Found Item';
    });
});

// File Preview Listener
document.getElementById('found-img')?.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = evt => {
      document.getElementById('imagePreview').src = evt.target.result;
      document.getElementById('imagePreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Mark Post as Resolved
window.markResolved = function(id) {
  db.collection('portal_items').doc(id).update({ resolved: true })
    .then(() => alert('Item status updated to Resolved.'));
};

// Delete Post
window.deletePost = function(id) {
  if (confirm('Delete this post permanently?')) {
    db.collection('portal_items').doc(id).delete()
      .then(() => alert('Post deleted.'));
  }
};

// Logout Handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});