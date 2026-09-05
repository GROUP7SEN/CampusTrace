// Firebase Configuration
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

// Get Saved User Details
const currentUserName = localStorage.getItem('userName') || 'Anonymous Student';
const currentUserEmail = localStorage.getItem('userEmail') || '';
const currentUserMatric = localStorage.getItem('userMatric') || '';

if (!currentUserEmail) {
  window.location.href = 'login.html';
}

const userDisplay = document.getElementById('user-display');
if (userDisplay) {
  userDisplay.textContent = `${currentUserName} (${currentUserMatric})`;
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

let localPostsCache = [];

// Real-Time Firestore Listener
db.collection('portal_items').onSnapshot((snapshot) => {
  localPostsCache = [];
  snapshot.docs.forEach((doc) => {
    localPostsCache.push({ id: doc.id, ...doc.data() });
  });
  renderFeed();
});

// Render Feed with Filtering and Custom Controls
function renderFeed() {
  const feedContainer = document.querySelector('.feed-container');
  const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
  const filterCategory = document.getElementById('category-filter')?.value || 'all';

  if (!feedContainer) return;
  feedContainer.innerHTML = '';

  const filteredPosts = localPostsCache.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery) || post.desc.toLowerCase().includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || post.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (filteredPosts.length === 0) {
    feedContainer.innerHTML = `<p class="no-posts">No items match your search criteria.</p>`;
    return;
  }

  filteredPosts.forEach(post => {
    const isOwner = post.email === currentUserEmail;
    const card = document.createElement('div');
    card.className = `feed-card ${post.type}-card ${post.resolved ? 'resolved-card' : ''}`;

    card.innerHTML = `
      <div class="card-header">
        <div class="user-avatar ${post.type}-avatar">${post.initials}</div>
        <div class="user-info">
          <strong>${post.userName}</strong>
          <span class="post-time">${post.type.toUpperCase()} • ${post.statusText || 'Active'}</span>
        </div>
      </div>
      <div class="card-body">
        <h3>${post.title} ${post.resolved ? '<span class="badge-resolved">(Resolved)</span>' : ''}</h3>
        <p>${post.desc}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Item Image" />` : ''}
      </div>
      <div class="card-footer">
        <a href="mailto:${post.email}?subject=Regarding ${post.title} on OAU Lost Portal" class="email-btn">
          ✉️ Contact Owner
        </a>
        ${isOwner && !post.resolved ? `<button onclick="markResolved('${post.id}')" class="resolve-btn">Mark Resolved</button>` : ''}
        ${isOwner ? `<button onclick="deletePost('${post.id}')" class="delete-btn">Delete</button>` : ''}
      </div>
    `;
    feedContainer.appendChild(card);
  });
}

// Search and Filter Input Events
document.getElementById('search-input')?.addEventListener('input', renderFeed);
document.getElementById('category-filter')?.addEventListener('change', renderFeed);

// Submit Missing Item
document.getElementById('report-lost-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('lost-title').value;
  const desc = document.getElementById('lost-desc').value;

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
  });
});

// Submit Found Item with Firebase Storage Upload
document.getElementById('report-found-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('found-title').value;
  const desc = document.getElementById('found-desc').value;
  const imageFile = document.getElementById('found-img').files[0];

  if (!imageFile) return alert('Please select a photo of the item.');

  const storageRef = storage.ref(`found_items/${Date.now()}_${imageFile.name}`);

  storageRef.put(imageFile)
    .then(snapshot => snapshot.ref.getDownloadURL())
    .then(downloadURL => {
      return db.collection('portal_items').add({
        type: 'found',
        title: title,
        desc: desc,
        imageUrl: downloadURL,
        userName: currentUserName,
        email: currentUserEmail,
        initials: getInitials(currentUserName),
        resolved: false,
        statusText: 'Found Item',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert('Found item report published with image!');
      this.reset();
      document.getElementById('imagePreviewContainer').style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      alert('Error uploading image. Make sure Storage is enabled in Firebase Console.');
    });
});

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

// Mark Item as Resolved
window.markResolved = function(id) {
  db.collection('portal_items').doc(id).update({ resolved: true })
    .then(() => alert('Item status updated to Resolved!'));
};

// Delete Post
window.deletePost = function(id) {
  if (confirm('Are you sure you want to delete this post?')) {
    db.collection('portal_items').doc(id).delete()
      .then(() => alert('Post deleted successfully!'));
  }
};

// Logout Handler
document.getElementById('logoutBtn')?.addEventListener('click', function () {
  localStorage.clear();
  window.location.href = 'login.html';
});