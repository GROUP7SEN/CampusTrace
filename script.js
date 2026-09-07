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

// Universal Read More / Read Less Toggle for Long Descriptions
window.toggleReadMore = function(btn) {
  const container = btn.parentElement;
  const preview = container.querySelector('.text-preview');
  const full = container.querySelector('.text-full');
  if (!preview || !full) return;

  if (full.style.display === 'none') {
    full.style.display = 'inline';
    preview.style.display = 'none';
    btn.textContent = 'Read Less';
  } else {
    full.style.display = 'none';
    preview.style.display = 'inline';
    btn.textContent = 'Read More';
  }
};

// Helper: Format WhatsApp phone numbers to valid international format (234...)
function formatWhatsappNumber(rawWa) {
  if (!rawWa) return '';
  let clean = rawWa.replace(/[^0-9]/g, '');
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '234' + clean.slice(1);
  } else if (clean.length === 10 && (clean.startsWith('7') || clean.startsWith('8') || clean.startsWith('9'))) {
    clean = '234' + clean;
  }
  return clean;
}

function formatDescWithReadMore(text, limit = 90) {
  if (!text) return '';
  if (text.length <= limit) return text;
  const truncated = text.substring(0, limit);
  return `
    <span class="read-more-wrapper">
      <span class="text-preview">${truncated}...</span>
      <span class="text-full nav-dash-hidden">${text}</span>
      <button type="button" onclick="toggleReadMore(this)" class="read-more-btn">Read More</button>
    </span>
  `;
}

// Fullscreen Image Lightbox Modal Viewer
window.openImageLightbox = function(src) {
  if (!src) return;
  let lightbox = document.getElementById('image-lightbox-modal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox-modal';
    lightbox.className = 'modal-overlay lightbox-overlay-custom';
    lightbox.innerHTML = `
      <div class="lightbox-wrapper" onclick="event.stopPropagation()">
        <button class="modal-close lightbox-close-btn" onclick="closeModal('image-lightbox-modal')" title="Close preview">&times;</button>
        <img id="lightbox-target-img" src="" alt="Full Resolution Preview" class="lightbox-img-element" />
      </div>
    `;
    lightbox.onclick = function() { closeModal('image-lightbox-modal'); };
    document.body.appendChild(lightbox);
  }

  const imgEl = document.getElementById('lightbox-target-img');
  if (imgEl) imgEl.src = src;
  openModal('image-lightbox-modal');
};

// Universal Password Visibility Toggle Handler
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
};

// Auth Guard & User Session
const currentUserName = (localStorage.getItem('userName') || '').trim();
const currentUserEmail = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
const currentUserMatric = (localStorage.getItem('userMatric') || '').trim().toUpperCase();
const currentUserWhatsapp = localStorage.getItem('userWhatsapp') || '';
const currentUserContactPref = localStorage.getItem('userContactPref') || 'both';

if (!currentUserEmail && window.location.pathname.includes('dashboard.html')) {
  // Show brief message before redirect
  setTimeout(() => { window.location.href = 'login.html'; }, 800);
}

const userDisplay = document.getElementById('user-display');
if (userDisplay && currentUserName) {
  userDisplay.textContent = `👤 ${currentUserName} (${currentUserMatric})`;
}

// Helpers & Toast Notifications
window.showToast = function(message, type = 'success', duration = 3000) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: '✅',
    error: '⚠️',
    danger: '❌',
    warning: '📢',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '🔔'}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// Real-Time Account Suspension Guard
function checkUserAccountStatus() {
  if (!currentUserEmail) return;

  // 1. Check local storage status
  const localAccounts = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
  const myLocalAccount = localAccounts.find(a => (a.email || '').toLowerCase() === currentUserEmail.toLowerCase());
  
  if (myLocalAccount && myLocalAccount.status === 'suspended') {
    localStorage.setItem('userStatus', 'suspended');
    applySuspensionUI();
  }

  // 2. Real-time Firestore sync
  if (typeof db !== 'undefined') {
    db.collection('users').doc(currentUserEmail.toLowerCase()).onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data && data.status === 'suspended') {
          localStorage.setItem('userStatus', 'suspended');
          applySuspensionUI();
        } else if (data && data.status === 'active') {
          localStorage.setItem('userStatus', 'active');
          removeSuspensionUI();
        }
      }
    }, err => console.warn('Suspension listener fallback:', err));
  }
}

function applySuspensionUI() {
  const lostBtn = document.querySelector("button[onclick*='lost-modal']");
  const foundBtn = document.querySelector("button[onclick*='found-modal']");
  if (lostBtn) {
    lostBtn.disabled = true;
    lostBtn.style.opacity = '0.5';
    lostBtn.style.cursor = 'not-allowed';
    lostBtn.title = 'Account suspended by campus administration';
  }
  if (foundBtn) {
    foundBtn.disabled = true;
    foundBtn.style.opacity = '0.5';
    foundBtn.style.cursor = 'not-allowed';
    foundBtn.title = 'Account suspended by campus administration';
  }

  let banner = document.getElementById('suspension-banner');
  if (!banner && document.querySelector('main')) {
    banner = document.createElement('div');
    banner.id = 'suspension-banner';
    banner.style.background = 'rgba(239, 68, 68, 0.12)';
    banner.style.border = '1px solid rgba(239, 68, 68, 0.35)';
    banner.style.color = '#f87171';
    banner.style.padding = '14px 18px';
    banner.style.borderRadius = '8px';
    banner.style.marginBottom = '20px';
    banner.style.fontSize = '0.85rem';
    banner.style.fontWeight = '500';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '10px';
    banner.innerHTML = `🚫 <div><strong>Account Suspended:</strong> Your account has been suspended by campus administration. Reporting features are disabled. Please contact the Division of Student Affairs (DSA).</div>`;
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.insertBefore(banner, mainContainer.firstChild);
  }
}

function removeSuspensionUI() {
  const lostBtn = document.querySelector("button[onclick*='lost-modal']");
  const foundBtn = document.querySelector("button[onclick*='found-modal']");
  if (lostBtn) {
    lostBtn.disabled = false;
    lostBtn.style.opacity = '1';
    lostBtn.style.cursor = 'pointer';
    lostBtn.title = '';
  }
  if (foundBtn) {
    foundBtn.disabled = false;
    foundBtn.style.opacity = '1';
    foundBtn.style.cursor = 'pointer';
    foundBtn.title = '';
  }
  const banner = document.getElementById('suspension-banner');
  if (banner) banner.remove();
}

document.addEventListener('DOMContentLoaded', checkUserAccountStatus);

// Modal Dialog Controls
window.openModal = function(modalId) {
  if ((modalId === 'lost-modal' || modalId === 'found-modal') && localStorage.getItem('userStatus') === 'suspended') {
    return showToast('🚫 Account suspended by campus administration. You cannot publish new listings.', 'error');
  }
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Close modal on backdrop click or Escape key
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

const getInitials = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'CT';

let localPostsCache = [];
let currentActiveTab = 'feed';

// Tab Switcher Handler
window.switchTab = function(tabName) {
  currentActiveTab = tabName;

  // Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  renderFeed();
};

// Real-time Firestore Feed Listener
if (document.getElementById('feed-container')) {
  db.collection('portal_items').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    localPostsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updateStats();
    renderFeed();
  }, err => {
    console.warn('Firestore snapshot fallback:', err);
    // Secondary fallback without ordering if index is building
    db.collection('portal_items').onSnapshot(snap => {
      localPostsCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateStats();
      renderFeed();
    });
  });
}

// Update Overview Stats Counters
function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const missingEl = document.getElementById('stat-missing');
  const foundEl = document.getElementById('stat-found');
  const resolvedEl = document.getElementById('stat-resolved');

  if (!totalEl) return;

  const total = localPostsCache.length;
  const missing = localPostsCache.filter(p => p.type === 'missing').length;
  const found = localPostsCache.filter(p => p.type === 'found').length;
  const resolved = localPostsCache.filter(p => p.resolved).length;

  totalEl.textContent = total;
  missingEl.textContent = missing;
  foundEl.textContent = found;
  resolvedEl.textContent = resolved;
}

// Render Feed Posts with Search, Category, and Status Filters
function renderFeed() {
  const feedContainer = document.getElementById('feed-container');
  const searchQuery = (document.getElementById('search-input')?.value || '').toLowerCase();
  const filterCategory = document.getElementById('category-filter')?.value || 'all';
  const filterStatus = document.getElementById('status-filter')?.value || 'all';

  if (!feedContainer) return;

  const posts = localPostsCache.filter(post => {
    const titleMatch = (post.title || '').toLowerCase().includes(searchQuery);
    const descMatch = (post.desc || '').toLowerCase().includes(searchQuery);
    const userMatch = (post.userName || '').toLowerCase().includes(searchQuery);
    const matchesSearch = titleMatch || descMatch || userMatch;

    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    
    let matchesStatus = true;
    if (currentActiveTab === 'my') {
      matchesStatus = post.email === currentUserEmail;
    } else if (filterStatus === 'missing') {
      matchesStatus = post.type === 'missing' && !post.resolved;
    } else if (filterStatus === 'found') {
      matchesStatus = post.type === 'found' && !post.resolved;
    } else if (filterStatus === 'resolved') {
      matchesStatus = post.resolved === true;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (posts.length === 0) {
    const isMyTab = currentActiveTab === 'my';
    feedContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-tab-icon">${isMyTab ? '📋' : '🔍'}</div>
        <h3>${isMyTab ? 'No listings yet' : 'No items found'}</h3>
        <p>${isMyTab 
          ? 'You have not posted any missing or found item reports yet. Use the buttons above to submit your first report.' 
          : 'No listings match your search or filter criteria. Try resetting filters or submit a new report.'}
        </p>
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = posts.map(post => {
    const isOwner = Boolean(post.email && currentUserEmail && (post.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()));

    let dateFormatted = 'Recently';
    if (post.createdAt) {
      const d = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      if (!isNaN(d.getTime())) {
        dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }

    // Sync poster contact info with latest registered account profile if available
    const registeredAccounts = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
    const userAcc = registeredAccounts.find(acc => (acc.email || '').trim().toLowerCase() === (post.email || '').trim().toLowerCase());

    const posterWhatsapp = (userAcc && userAcc.whatsapp) ? userAcc.whatsapp : (post.whatsapp || '');
    const posterEmail = (userAcc && userAcc.email) ? userAcc.email : (post.email || '');
    const pref = ((userAcc && userAcc.contactPref) ? userAcc.contactPref : (post.contactPref || 'both')).toLowerCase();

    const formattedWa = formatWhatsappNumber(posterWhatsapp);
    const allowWa = (pref === 'whatsapp' || pref === 'both') && formattedWa.length >= 10;
    const allowEmail = (pref === 'email' || pref === 'both');

    return `
      <div class="feed-card ${post.type} ${post.resolved ? 'resolved' : ''}">
        ${post.resolved ? '<div class="card-resolved-ribbon">RECONNECTED</div>' : ''}
        <div class="card-header">
          <div class="avatar">${post.initials || getInitials(post.userName)}</div>
          <div class="meta">
            <strong>${post.userName || 'Anonymous Student'}</strong>
            <span>📅 ${dateFormatted}</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="post-tags-wrapper">
            ${post.type === 'missing' 
              ? '<span class="badge badge-missing">📢 Missing</span>' 
              : '<span class="badge badge-found">🔍 Found</span>'}
            ${post.category ? `<span class="badge badge-cat">🏷️ ${post.category}</span>` : ''}
          </div>
          
          <h3>${post.title}</h3>
          <p>${formatDescWithReadMore(post.desc, 90)}</p>
          ${post.delegatedTo ? `
            <div class="delegated-banner-box">
              🛡️ <strong>Delegated Official Unit:</strong> ${post.delegatedTo}
              ${post.delegatedNotes ? `<div class="delegated-notes-sub">Instructions: ${post.delegatedNotes}</div>` : ''}
            </div>
          ` : ''}
          ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-img post-img-clickable" alt="${post.title}" onclick="openImageLightbox('${post.imageUrl}')" title="Click to view full screen photo" />` : ''}
        </div>

        <div class="card-footer">
          ${(!isOwner && !post.resolved) ? `
            <div class="card-footer-flex">
              ${allowWa ? `
                <a href="https://wa.me/${formattedWa}?text=${encodeURIComponent("Hi, I'm contacting you regarding your CampusTrace post: " + post.title)}" target="_blank" class="btn btn-outline btn-contact-wa">
                  💬 WhatsApp Poster
                </a>
              ` : ''}
              ${allowEmail ? `
                <a href="mailto:${posterEmail}?subject=Regarding '${encodeURIComponent(post.title)}' on CampusTrace" class="btn btn-outline btn-contact-email">
                  ✉️ Email Poster
                </a>
              ` : ''}
            </div>
          ` : '<div></div>'}
          <div class="card-footer-flex">
            ${isOwner && !post.resolved ? `<button onclick="markResolved('${post.id}')" class="btn btn-primary btn-mark-resolved">Mark Resolved</button>` : ''}
            ${isOwner ? `<button onclick="deletePost('${post.id}')" class="btn btn-danger btn-delete-post">Delete</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Search and Filter Event Listeners
document.getElementById('search-input')?.addEventListener('input', renderFeed);
document.getElementById('category-filter')?.addEventListener('change', renderFeed);
document.getElementById('status-filter')?.addEventListener('change', renderFeed);

// Submit Missing Item Report
document.getElementById('report-lost-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  if (localStorage.getItem('userStatus') === 'suspended') {
    return showToast('🚫 Account suspended by campus administration. You cannot publish new listings.', 'error');
  }

  const submitBtn = this.querySelector('button[type="submit"]');
  const origText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Publishing Report...';
  }

  const title = document.getElementById('lost-title').value.trim();
  const category = document.getElementById('lost-category').value;
  const desc = document.getElementById('lost-desc').value.trim();

  db.collection('portal_items').add({
    type: 'missing',
    title, 
    category,
    desc,
    userName: currentUserName,
    email: currentUserEmail,
    whatsapp: currentUserWhatsapp,
    contactPref: currentUserContactPref,
    initials: getInitials(currentUserName),
    resolved: false,
    statusText: 'Missing Item',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showToast('Missing item report published successfully!', 'success');
    this.reset();
    closeModal('lost-modal');
  }).catch(err => {
    console.error(err);
    showToast('Failed to publish report. Please check connection.', 'error');
  }).finally(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
});

// Helper: Image Compression & Base64 Data URL Converter
function compressAndReadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = err => reject(err);
    reader.onload = e => {
      const img = new Image();
      img.onerror = err => reject(err);
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG data URL for fast transmission
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Submit Found Item Report (with Resilient Image Upload Strategy)
document.getElementById('report-found-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (localStorage.getItem('userStatus') === 'suspended') {
    return showToast('🚫 Account suspended by campus administration. You cannot publish new listings.', 'error');
  }
  const title = document.getElementById('found-title').value.trim();
  const category = document.getElementById('found-category').value;
  const desc = document.getElementById('found-desc').value.trim();
  const imageFile = document.getElementById('found-img').files[0];
  const submitBtn = document.getElementById('submit-found-btn');

  if (!imageFile) return showToast('Please attach a photo of the found item.', 'warning');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Uploading & Publishing...';

  try {
    // Step 1: Compress image client-side to ensure fast upload
    const compressedDataUrl = await compressAndReadImage(imageFile);

    // Step 2: Attempt Firebase Storage upload with 8s timeout — fallback to data URL
    let finalImageUrl = compressedDataUrl;
    try {
      if (typeof storage !== 'undefined' && storage.ref) {
        const cleanName = (imageFile.name || 'image').replace(/[^a-zA-Z0-9.]/g, '_');
        const storageRef = storage.ref(`found_items/${Date.now()}_${cleanName}`);
        const uploadTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Storage upload timed out')), 8000)
        );
        const snap = await Promise.race([storageRef.put(imageFile), uploadTimeout]);
        finalImageUrl = await snap.ref.getDownloadURL();
      }
    } catch (storageErr) {
      console.warn('Storage upload skipped, using compressed data URL fallback:', storageErr.message);
    }

    // Step 3: Add document to Firestore
    await db.collection('portal_items').add({
      type: 'found',
      title,
      category,
      desc,
      imageUrl: finalImageUrl,
      userName: currentUserName,
      email: currentUserEmail,
      whatsapp: currentUserWhatsapp,
      contactPref: currentUserContactPref,
      initials: getInitials(currentUserName),
      resolved: false,
      statusText: 'Found Item',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast('Found item report published successfully!', 'success');
    this.reset();
    document.getElementById('imagePreviewContainer').style.display = 'none';
    closeModal('found-modal');
  } catch (err) {
    console.error('Submit found item error:', err);
    showToast('Failed to publish report. Please try another image file.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publish Found Item';
  }
});

// Image Upload Preview Listener
document.getElementById('found-img')?.addEventListener('change', async function (e) {
  const file = e.target.files[0];
  if (file) {
    try {
      const previewUrl = await compressAndReadImage(file);
      const imgPreview = document.getElementById('imagePreview');
      const container = document.getElementById('imagePreviewContainer');
      if (imgPreview && container) {
        imgPreview.src = previewUrl;
        container.style.display = 'block';
      }
    } catch (err) {
      console.error('Preview error:', err);
    }
  }
});

// Settings Modal Handler
window.openSettingsModal = function() {
  document.getElementById('set-name').value = localStorage.getItem('userName') || '';
  document.getElementById('set-email').value = localStorage.getItem('userEmail') || '';
  document.getElementById('set-whatsapp').value = localStorage.getItem('userWhatsapp') || '';
  document.getElementById('set-contact-pref').value = localStorage.getItem('userContactPref') || 'both';
  document.getElementById('set-password').value = '';
  openModal('settings-modal');
};

document.getElementById('settings-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('set-name').value.trim();
  const whatsapp = document.getElementById('set-whatsapp').value.trim();
  const contactPref = document.getElementById('set-contact-pref').value;
  const newPassword = document.getElementById('set-password').value.trim();

  if (name.length < 3) {
    return showToast('Full name must be at least 3 characters.', 'warning');
  }
  if (whatsapp.length < 10) {
    return showToast('Please enter a valid WhatsApp number.', 'warning');
  }

  // Update localStorage session
  localStorage.setItem('userName', name);
  localStorage.setItem('userWhatsapp', whatsapp);
  localStorage.setItem('userContactPref', contactPref);

  // Update stored accounts array
  const registeredAccounts = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
  const email = currentUserEmail.toLowerCase();
  const index = registeredAccounts.findIndex(acc => acc.email.toLowerCase() === email);

  if (index >= 0) {
    registeredAccounts[index].name = name;
    registeredAccounts[index].whatsapp = whatsapp;
    registeredAccounts[index].contactPref = contactPref;
    if (newPassword && newPassword.length >= 4) {
      registeredAccounts[index].password = newPassword;
    }
    localStorage.setItem('registeredAccounts', JSON.stringify(registeredAccounts));
  }

  // Update Firestore user document
  if (typeof db !== 'undefined' && email) {
    const updatePayload = {
      name,
      whatsapp,
      contactPref,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (newPassword && newPassword.length >= 4) {
      updatePayload.password = newPassword;
    }
    db.collection('users').doc(email).set(updatePayload, { merge: true })
      .catch(err => console.warn('Firestore user update fallback:', err));

    // Sync updated contact info to all posts published by this user in Firestore
    db.collection('portal_items').where('email', '==', email).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.update({ whatsapp, contactPref, userName: name });
        });
      }).catch(err => console.warn('Sync user posts fallback:', err));
  }

  // Update display UI
  const userDisplay = document.getElementById('user-display');
  if (userDisplay) {
    userDisplay.textContent = `👤 ${name} (${currentUserMatric})`;
  }

  showToast('Settings saved successfully!', 'success');
  closeModal('settings-modal');
});

// Mark Post as Resolved
window.markResolved = function(id) {
  db.collection('portal_items').doc(id).update({ resolved: true })
    .then(() => showToast('Item status updated to Resolved!', 'success'));
};

// Delete Post
window.deletePost = function(id) {
  if (confirm('Delete this post permanently?')) {
    db.collection('portal_items').doc(id).delete()
      .then(() => showToast('Post deleted.', 'info'));
  }
};

// Logout Handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});
// Mobile Navbar Menu Toggle
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburgerBtn.classList.toggle('open');
  });
}