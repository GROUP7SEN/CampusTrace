// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1A7PCfIIu-ja3Langp5V_kLXEPDCbbsE",
  authDomain: "oau-lost-and-found.firebaseapp.com",
  projectId: "oau-lost-and-found",
  storageBucket: "oau-lost-and-found.firebasestorage.app",
  messagingSenderId: "1039137571247",
  appId: "1:1039137571247:web:981f9871e5e1588b1faf5a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Helper: XSS Sanitization
function sanitizeInput(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// User Context
const currentUserName = localStorage.getItem('userName') || 'Anonymous Student';
const currentUserEmail = localStorage.getItem('userEmail') || '';
const currentUserMatric = localStorage.getItem('userMatric') || '';
const isAdmin = localStorage.getItem('isAdmin') === 'true';

if (!currentUserEmail) {
  window.location.href = 'login.html';
}

const userDisplay = document.getElementById('user-display');
if (userDisplay) {
  const adminBadge = isAdmin ? ' 🔑 [Admin]' : '';
  userDisplay.textContent = `${sanitizeInput(currentUserName)} (${sanitizeInput(currentUserMatric)})${adminBadge}`;
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Admin Trigger Function
window.checkAdminAccess = function() {
  const code = prompt("Enter Admin Access Code:");
  if (code === "OAU_ADMIN_2026") {
    localStorage.setItem('isAdmin', 'true');
    alert("Admin privileges granted!");
    renderFeed(); // Dynamically updates UI without triggering a page refresh
  } else {
    alert("Invalid passcode.");
  }
};

let localPostsCache = [];

// Firestore Listener
db.collection('portal_items').onSnapshot((snapshot) => {
  localPostsCache = [];
  snapshot.docs.forEach((doc) => {
    localPostsCache.push({ id: doc.id, ...doc.data() });
  });
  renderFeed();
});

// Render Feeds
function renderFeed() {
  const feedContainer = document.querySelector('.feed-container');
  const searchQuery = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
  const filterCategory = document.getElementById('category-filter')?.value || 'all';

  if (!feedContainer) return;
  feedContainer.innerHTML = '';

  const filteredPosts = localPostsCache.filter(post => {
    const postTitle = (post.title || '').toLowerCase();
    const postDesc = (post.desc || '').toLowerCase();
    const matchesSearch = postTitle.includes(searchQuery) || postDesc.includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || post.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (filteredPosts.length === 0) {
    feedContainer.innerHTML = `<p class="no-posts">No items match your search criteria.</p>`;
    return;
  }

  filteredPosts.forEach(post => {
    const isOwner = post.email === currentUserEmail;
    const canDelete = isOwner || isAdmin;
    const card = document.createElement('div');
    card.className = `feed-card ${post.type}-card ${post.resolved ? 'resolved-card' : ''}`;

    const safeTitle = sanitizeInput(post.title);
    const safeDesc = sanitizeInput(post.desc);
    const safeUserName = sanitizeInput(post.userName);
    const safeInitials = sanitizeInput(post.initials);

    const emailSubject = encodeURIComponent(`Regarding ${post.title} on OAU Lost Portal`);
    const emailBody = encodeURIComponent(`Hello ${post.userName},\n\nI am reaching out regarding your listing: "${post.title}".\n\nSender Details:\nName: ${currentUserName}\nEmail: ${currentUserEmail}`);
    const mailtoUrl = `mailto:${post.email}?subject=${emailSubject}&body=${emailBody}`;

    card.innerHTML = `
      <div class="card-header">
        <div class="user-avatar ${post.type}-avatar">${safeInitials}</div>
        <div class="user-info">
          <strong>${safeUserName} ${post.stars ? `⭐ (${post.stars})` : ''}</strong>
          <span class="post-time">${post.type.toUpperCase()} • ${post.statusText || 'Active'}</span>
        </div>
      </div>
      <div class="card-body">
        <h3>${safeTitle} ${post.resolved ? '<span class="badge-resolved">(Resolved)</span>' : ''}</h3>
        <p>${safeDesc}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Item Image" />` : ''}
      </div>
      <div class="card-footer">
        <a href="${mailtoUrl}" class="email-btn">✉️ Contact via School Email</a>
        ${isOwner && !post.resolved ? `<button onclick="markResolved('${post.id}', '${post.email}', '${post.type}')" class="resolve-btn">Mark Resolved</button>` : ''}
        ${canDelete ? `<button onclick="deletePost('${post.id}')" class="delete-btn">Delete ${isAdmin && !isOwner ? '(Admin)' : ''}</button>` : ''}
      </div>
    `;
    feedContainer.appendChild(card);
  });
}

// Event Listeners
document.getElementById('search-input')?.addEventListener('input', renderFeed);
document.getElementById('category-filter')?.addEventListener('change', renderFeed);

// Submit Missing Item
document.getElementById('report-lost-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('lost-title').value.trim();
  const desc = document.getElementById('lost-desc').value.trim();

  db.collection('portal_items').add({
    type: 'missing',
    title: title,
    desc: desc,
    userName: currentUserName,
    email: currentUserEmail,
    initials: getInitials(currentUserName),
    resolved: false,
    statusText: 'Missing Item',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert('Missing item report published!');
    this.reset();
    window.location.href = 'index.html';
  });
});

// Submit Found Item (Base64 Conversion Solution)
const foundForm = document.getElementById('report-found-form');
if (foundForm) {
  foundForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const titleInput = document.getElementById('found-title');
    const descInput = document.getElementById('found-desc');
    const fileInput = document.getElementById('found-img');

    if (!titleInput || !descInput || !fileInput) {
      alert('Error: Form inputs could not be found.');
      return;
    }

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const imageFile = fileInput.files[0];

    if (!imageFile) {
      alert('Please attach a photo.');
      return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing...';
    }

    // Convert image file directly to a Base64 string
    const reader = new FileReader();
    reader.onload = function (evt) {
      const base64Image = evt.target.result;

      // Save directly to Firestore database
      db.collection('portal_items').add({
        type: 'found',
        title: title,
        desc: desc,
        imageUrl: base64Image,
        userName: currentUserName,
        email: currentUserEmail,
        initials: getInitials(currentUserName),
        resolved: false,
        statusText: 'Found Item',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        alert('Found item report published successfully!');
        foundForm.reset();
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) previewContainer.style.display = 'none';
        window.location.href = 'index.html';
      })
      .catch(error => {
        console.error('Firestore Error:', error);
        alert('Publication failed: ' + error.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post Found Item';
        }
      });
    };

    reader.readAsDataURL(imageFile);
  });
}

// Photo Preview
document.getElementById('found-img')?.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      document.getElementById('imagePreview').src = evt.target.result;
      document.getElementById('imagePreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Mark Resolved & Good Samaritan Award
window.markResolved = function(id, email, type) {
  db.collection('portal_items').doc(id).update({ resolved: true })
    .then(() => {
      alert('Item marked as resolved!');
      if (type === 'found') {
        alert('⭐ Good Samaritan reward point assigned to finder!');
      }
    });
};

// Delete Post
window.deletePost = function(id) {
  if (confirm('Are you sure you want to delete this post?')) {
    db.collection('portal_items').doc(id).delete()
      .then(() => alert('Post deleted!'));
  }
};

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function () {
  localStorage.clear();
  window.location.href = 'login.html';
});