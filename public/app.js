// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnAwZp9mJKSeghiirTlV8LX5VxTNiHje4",
    authDomain: "forum-smarta-2026.firebaseapp.com",
    databaseURL: "https://forum-smarta-2026-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "forum-smarta-2026",
    storageBucket: "forum-smarta-2026.firebasestorage.app",
    messagingSenderId: "933600073624",
    appId: "1:933600073624:web:2e2067094bd7cf2cf97ded"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// State Management
const store = {
    currentUser: null,
    activeCategory: 'all',
    activeThread: null,
    expandedPosts: new Set(),
    categoriesData: [],
    threadsData: []
};

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    categoryList: document.getElementById('category-list'),
    contentArea: document.getElementById('content-area'),
    pageTitle: document.getElementById('page-title'),
    userProfileSection: document.getElementById('user-profile-section'),
    loginBtn: document.getElementById('login-btn'),
    addCategoryBtn: document.getElementById('add-category-btn'),
    newDiscussionBtn: document.getElementById('new-discussion-btn'),
    searchInput: document.getElementById('search-input'),
    modalOverlay: document.getElementById('modal-overlay'),
    loginModal: document.getElementById('login-modal'),
    createCategoryModal: document.getElementById('create-category-modal'),
    createThreadModal: document.getElementById('create-thread-modal'),
    usernameInput: document.getElementById('username-input'),
    adminCheckbox: document.getElementById('admin-checkbox'),
    newCategoryName: document.getElementById('new-category-name'),
    threadCategorySelect: document.getElementById('thread-category-select'),
    newThreadTitle: document.getElementById('new-thread-title'),
    newThreadContent: document.getElementById('new-thread-content'),
    confirmLogin: document.getElementById('confirm-login'),
    confirmCreateCategory: document.getElementById('confirm-create-category'),
    confirmCreateThread: document.getElementById('confirm-create-thread'),
    acceptRulesBtn: document.getElementById('accept-rules-btn'), // Added
    closeModalBtns: document.querySelectorAll('.close-modal'),
    menuToggleBtn: document.getElementById('menu-toggle-btn'),
    closeSidebarBtn: document.getElementById('close-sidebar-btn'),
    sidebar: document.getElementById('sidebar'),
    rulesModal: document.getElementById('rules-modal') // Added
};

function init() {
    setupEventListeners();
    checkUserStatus();

    // Listeners for real-time updates - Start only when authenticated
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("Utente autenticato. Avvio listener...");
            listenToCategories();
            listenToThreads();
        } else {
            console.log("Utente non autenticato. Nessun dato verrà caricato finché non effettui il login.");
            // Optional: Clear data if needed, but for now we just stop updating
            store.categoriesData = [];
            store.threadsData = [];
            renderCategories();
            renderDiscussions();
        }
    });
}

// --- Realtime Database Listeners ---

function listenToCategories() {
    db.ref('categories').on('value', (snapshot) => {
        const categories = [];
        snapshot.forEach((childSnapshot) => {
            categories.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        store.categoriesData = categories;
        renderCategories();
    });
}

function listenToThreads() {
    // In Realtime DB, filtering is a bit different. 
    // For simplicity, we'll fetch all threads and filter client-side 
    // (acceptable for small scale). For larger scale, we'd use query parameters.
    db.ref('threads').on('value', (snapshot) => {
        const threads = [];
        snapshot.forEach((childSnapshot) => {
            const threadData = childSnapshot.val();
            // Convert posts object to array if it exists
            let posts = [];
            if (threadData.posts) {
                posts = Object.keys(threadData.posts).map(key => ({
                    id: key,
                    ...threadData.posts[key]
                }));
            }
            threads.push({
                id: childSnapshot.key,
                ...threadData,
                posts: posts
            });
        });

        // Sort by date desc
        threads.sort((a, b) => new Date(b.date) - new Date(a.date));

        store.threadsData = threads;
        renderDiscussions();
    });
}

// --- Rendering ---

function renderCategories() {
    // Determine effective active category for highlighting
    let highlightId = store.activeCategory;
    if (store.activeThread) {
        const thread = store.threadsData.find(t => t.id === store.activeThread);
        if (thread) highlightId = thread.categoryId;
    }

    elements.categoryList.innerHTML = `
        <li class="category-item ${highlightId === 'all' ? 'active' : ''}" onclick="setActiveCategory('all')">
            <span><i class="fa-solid fa-globe"></i> Tutte le discussioni</span>
        </li>
    `;

    store.categoriesData.forEach((cat, index) => {
        const li = document.createElement('li');
        li.className = `category-item ${highlightId === cat.id ? 'active' : ''}`;
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        const color = colors[index % colors.length];
        li.innerHTML = `
            <span onclick="setActiveCategory('${cat.id}')"><span class="category-badge" style="background-color: ${color};"></span> ${cat.name}</span>
            ${store.currentUser?.isAdmin ? `<i class="fa-solid fa-trash delete-btn" onclick="deleteCategory('${cat.id}')"></i>` : ''}
        `;
        elements.categoryList.appendChild(li);
    });
}

function renderDiscussions() {
    renderCategories(); // Update sidebar highlight
    elements.contentArea.innerHTML = '';

    if (store.activeThread) {
        const thread = store.threadsData.find(t => t.id === store.activeThread);
        if (thread) {
            renderThreadDetail(thread);
        } else {
            store.activeThread = null;
            renderDiscussions();
        }
        return;
    }

    // Filter threads based on active category
    let filteredThreads = store.threadsData;
    if (store.activeCategory !== 'all') {
        filteredThreads = filteredThreads.filter(t => t.categoryId === store.activeCategory);
        const cat = store.categoriesData.find(c => c.id === store.activeCategory);
        elements.pageTitle.textContent = cat ? cat.name : 'Discussioni';
    } else {
        elements.pageTitle.textContent = 'Discussioni Recenti';
    }

    // Local Search Filter
    const searchInput = document.getElementById('search-input');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (searchQuery) {
        filteredThreads = filteredThreads.filter(t =>
            t.title.toLowerCase().includes(searchQuery) ||
            t.content.toLowerCase().includes(searchQuery)
        );
    }

    if (filteredThreads.length === 0) {
        elements.contentArea.innerHTML = '<div style="text-align:center; color:var(--text-secondary); padding: 2rem;">Nessuna discussione trovata.</div>';
        return;
    }

    // Sort by Pin and Date
    filteredThreads.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    filteredThreads.forEach(thread => {
        const card = document.createElement('div');
        card.className = `discussion-card ${thread.isPinned ? 'pinned-thread' : ''}`;
        card.onclick = (e) => {
            if (!e.target.closest('.delete-thread-btn') && !e.target.closest('.pin-thread-btn')) {
                openThread(thread.id);
            }
        };
        card.innerHTML = `
            ${store.currentUser?.isAdmin ? `<button class="delete-thread-btn" onclick="deleteThread('${thread.id}')" title="Elimina"><i class="fa-solid fa-trash"></i></button>` : ''}
            ${store.currentUser?.isAdmin ? `<button class="pin-thread-btn" onclick="togglePinThread('${thread.id}', ${!!thread.isPinned})" title="${thread.isPinned ? 'Rimuovi dalla bacheca' : 'Fissa in alto'}" style="position: absolute; right: ${store.currentUser?.isAdmin ? '3rem' : '1rem'}; top: 1rem; background: none; border: none; color: ${thread.isPinned ? '#ca8a04' : 'var(--text-secondary)'}; cursor: pointer; font-size: 1.1rem; z-index: 2;"><i class="fa-solid fa-thumbtack"></i></button>` : ''}
            <div class="discussion-header">
                <div class="discussion-title">${thread.isPinned ? '<i class="fa-solid fa-thumbtack" style="color: #ca8a04; margin-right: 0.5rem; font-size: 0.9em;"></i>' : ''}${escapeHtml(thread.title)}</div>
            </div>
            <div class="discussion-meta">
                <span style="color: ${getUserColor(thread.author)}"><i class="fa-regular fa-user"></i> ${escapeHtml(thread.author)}</span>
                <span><i class="fa-regular fa-calendar"></i> ${formatDate(thread.date)}</span>
                <span><i class="fa-regular fa-comment"></i> ${thread.posts ? thread.posts.length : 0}</span>
                ${(() => {
                    const likesObj = thread.likes || {};
                    const lCount = Object.keys(likesObj).length;
                    return lCount > 0 ? `<span style="color: #4f46e5;"><i class="fa-solid fa-thumbs-up"></i> ${lCount}</span>` : '';
                })()}
            </div>
            <div class="discussion-snippet">
                ${escapeHtml(thread.content).substring(0, 100)}${thread.content.length > 100 ? '...' : ''}
            </div>
        `;
        elements.contentArea.appendChild(card);
    });
}

function renderThreadDetail(thread) {
    elements.pageTitle.textContent = 'Discussione';
    const posts = thread.posts || [];

    // Build Post Tree
    const postTree = buildPostTree(posts);

    elements.contentArea.innerHTML = `
        <button class="btn-ghost" onclick="closeThread()" style="margin-bottom: 1rem; width: auto;"><i class="fa-solid fa-arrow-left"></i> Torna indietro</button>
        
        <div class="thread-layout">
            <!-- Main Content -->
            <div class="thread-main">
                <div class="discussion-card" style="cursor: default; border-color: var(--accent-primary);">
                    <div class="discussion-header">
                        <div class="discussion-title" style="font-size: 1.5rem;">${escapeHtml(thread.title)}</div>
                    </div>
                    <div class="discussion-meta">
                        <span style="color: ${getUserColor(thread.author)}"><i class="fa-regular fa-user"></i> ${escapeHtml(thread.author)}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(thread.date)}</span>
                        ${(() => {
                            const likesObj = thread.likes || {};
                            const likesCount = Object.keys(likesObj).length;
                            const userLiked = store.currentUser && likesObj[store.currentUser.username];
                            return `<span style="cursor: pointer; color: ${userLiked ? '#4f46e5' : 'inherit'}; font-weight: ${userLiked ? 'bold' : 'normal'}; border-left: 1px solid var(--border-color); padding-left: 0.75rem;" onclick="toggleLike('${thread.id}')"><i class="fa-${userLiked ? 'solid' : 'regular'} fa-thumbs-up"></i> ${likesCount > 0 ? likesCount : 'Mi piace'}</span>`;
                        })()}
                    </div>
                    <div class="post-content" style="margin-top: 1.5rem; line-height: 1.8; font-size: 1.05rem;">${escapeHtml(thread.content)}</div>
                </div>

                <!-- Replies -->
                <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <button class="btn-ghost" onclick="toggleReplies('${thread.id}')" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; text-align: left;">
                        <i class="fa-regular fa-comment"></i> ${posts.length} ${posts.length === 1 ? 'Risposta' : 'Risposte'}
                        <i class="fa-solid fa-chevron-${store.expandedPosts.has(thread.id) ? 'up' : 'down'}" style="margin-left: 0.5rem; font-size: 0.7rem; float: right; margin-top: 0.3rem;"></i>
                    </button>
                    <div id="replies-${thread.id}" class="replies-container" style="display: ${store.expandedPosts.has(thread.id) ? 'block' : 'none'}; margin-top: 1rem;">
                        ${renderPostTree(postTree, thread.id)}
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="thread-sidebar">
                ${store.currentUser ? `
                    <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 1rem; font-size: 1rem;"><i class="fa-regular fa-comment"></i> Rispondi</h4>
                        <div id="replying-to-indicator" class="hidden" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                            <span>Risposta a <b id="replying-to-author"></b></span>
                            <button onclick="cancelReplyTo()" style="background:none; color: inherit;"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <textarea id="reply-content" class="input-field" rows="4" placeholder="Scrivi una risposta..." style="margin-bottom: 0.75rem;"></textarea>
                        <button class="btn-primary" onclick="addReply('${thread.id}')" style="width: 100%;">Invia Risposta</button>
                    </div>
                    
                    <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 0.5rem; font-size: 1rem;"><i class="fa-regular fa-file-lines"></i> Nuova Discussione</h4>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">Crea un nuovo thread in questa categoria</p>
                        <button class="btn-secondary" onclick="openNewThreadInCategory('${thread.categoryId}')" style="width: 100%;">Crea Discussione</button>
                    </div>
                ` : `
                    <div style="padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-color);">
                        <p style="font-size: 0.9rem;">Devi <a href="#" onclick="openModal('login-modal')" style="color: var(--accent-primary);">accedere</a> per rispondere o creare discussioni.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function buildPostTree(posts) {
    const postMap = {};
    const roots = [];

    // Initialize map
    posts.forEach(post => {
        post.children = [];
        postMap[post.id] = post;
    });

    // Build tree
    posts.forEach(post => {
        if (post.replyTo && postMap[post.replyTo]) {
            postMap[post.replyTo].children.push(post);
        } else {
            roots.push(post);
        }
    });

    // Sort by date
    const sortPosts = (list) => {
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        list.forEach(p => sortPosts(p.children));
    };
    sortPosts(roots);

    return roots;
}

function renderPostTree(posts, threadId, level = 0) {
    return posts.map(post => `
        <div class="post-card" style="--level: ${level}; margin-bottom: 0.75rem; border-left: ${level > 0 ? '2px solid var(--border-color)' : 'none'};">
            <div class="post-header">
                <div class="post-header-info">
                    <span class="post-author" style="color: ${getUserColor(post.author)}">${escapeHtml(post.author)}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
                <div class="post-actions">
                    ${(() => {
                        const likesObj = post.likes || {};
                        const likesCount = Object.keys(likesObj).length;
                        const userLiked = store.currentUser && likesObj[store.currentUser.username];
                        return `<button class="btn-ghost" style="color: ${userLiked ? '#4f46e5' : 'inherit'}; font-weight: ${userLiked ? 'bold' : 'normal'};" onclick="toggleLike('${threadId}', '${post.id}')"><i class="fa-${userLiked ? 'solid' : 'regular'} fa-thumbs-up"></i> <span>Mi piace${likesCount > 0 ? ` (${likesCount})` : ''}</span></button>`;
                    })()}
                    ${store.currentUser ? `<button class="btn-ghost" onclick="setReplyTo('${post.id}', '${escapeHtml(post.author)}')"><i class="fa-solid fa-reply"></i> <span>Rispondi</span></button>` : ''}
                    ${store.currentUser?.isAdmin ? `<button class="btn-ghost danger" onclick="deletePost('${threadId}', '${post.id}')"><i class="fa-solid fa-trash"></i> <span>Elimina</span></button>` : ''}
                </div>
            </div>
            <div class="post-content" style="font-size: 0.95rem;">${escapeHtml(post.content)}</div>
        </div>
        ${renderPostTree(post.children, threadId, level + 1)}
    `).join('');
}

// --- Helpers ---

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
}

function getUserColor(username) {
    if (!username) return 'var(--accent-primary)';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

// --- Actions ---

window.setActiveCategory = (catId) => {
    store.activeCategory = catId;
    store.activeThread = null;
    renderDiscussions();

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
    }
};

window.openThread = (threadId) => {
    store.activeThread = threadId;
    renderDiscussions();
};

window.closeThread = () => {
    store.activeThread = null;
    renderDiscussions();
};

window.openNewThreadInCategory = (categoryId) => {
    populateCategorySelect();
    setTimeout(() => {
        elements.threadCategorySelect.value = categoryId;
    }, 0);
    showModal('create-thread-modal');
};

window.toggleReplies = (threadId) => {
    if (store.expandedPosts.has(threadId)) {
        store.expandedPosts.delete(threadId);
    } else {
        store.expandedPosts.add(threadId);
    }
    // Re-render current view
    const replyContainer = document.getElementById(`replies-${threadId}`);
    const icon = document.querySelector(`button[onclick="toggleReplies('${threadId}')"] .fa-solid`);
    if (replyContainer && icon) {
        replyContainer.style.display = store.expandedPosts.has(threadId) ? 'block' : 'none';
        icon.className = `fa-solid fa-chevron-${store.expandedPosts.has(threadId) ? 'up' : 'down'}`;
    }
};

window.addReply = (threadId) => {
    const content = document.getElementById('reply-content').value.trim();
    if (!content) return;

    const newPost = {
        author: store.currentUser.username,
        date: new Date().toISOString(),
        content: content,
        replyTo: store.replyingTo ? store.replyingTo.id : null
    };

    // Push to 'posts' node under the thread
    db.ref(`threads/${threadId}/posts`).push(newPost)
        .then(() => {
            store.expandedPosts.add(threadId);
            cancelReplyTo(); // Reset reply state
            document.getElementById('reply-content').value = '';
            
            // Resolve category name and get last 5 replies
            const thread = store.threadsData.find(t => t.id === threadId);
            let categoryName = 'Varie';
            let recentReplies = [];
            if (thread) {
                const category = store.categoriesData.find(c => c.id === thread.categoryId);
                if (category) categoryName = category.name;
                
                // Determina il messaggio "padre" a cui si sta rispondendo
                if (newPost.replyTo && thread.posts) {
                    const parentPost = thread.posts.find(p => p.id === newPost.replyTo);
                    if (parentPost) {
                        recentReplies.push({
                            author: parentPost.author,
                            content: parentPost.content
                        });
                    }
                } else {
                    // Nessuna risposta specifica -> il contesto è l'apertura della discussione
                    recentReplies.push({
                        author: thread.author,
                        content: thread.content
                    });
                }
            }

            // Invia notifica email
            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: newPost.author,
                    content: newPost.content,
                    category: categoryName,
                    discussionTitle: thread.title,
                    recentReplies: recentReplies
                })
            }).catch(e => console.error('Errore notifica:', e));
        })
        .catch(error => {
            console.error("Errore durante l'invio della risposta: ", error);
            alert("Errore nell'invio della risposta.");
        });
};

window.setReplyTo = (postId, author) => {
    store.replyingTo = { id: postId, author: author };
    const indicator = document.getElementById('replying-to-indicator');
    const authorSpan = document.getElementById('replying-to-author');
    const textarea = document.getElementById('reply-content');

    if (indicator && authorSpan && textarea) {
        indicator.classList.remove('hidden');
        authorSpan.textContent = author;
        textarea.focus();
        textarea.placeholder = `Rispondi a ${author}...`;
    }
};

window.cancelReplyTo = () => {
    store.replyingTo = null;
    const indicator = document.getElementById('replying-to-indicator');
    const textarea = document.getElementById('reply-content');

    if (indicator && textarea) {
        indicator.classList.add('hidden');
        textarea.placeholder = "Scrivi una risposta...";
    }
};

window.deleteCategory = (id) => {
    if (!confirm('Sei sicuro? Questa azione eliminerà DEFINITIVAMENTE la categoria e TUTTE le discussioni in essa contenute.')) return;

    // First find all threads in this category
    const updates = {};
    updates[`categories/${id}`] = null; // Delete category

    // Find threads to delete
    if (store.threadsData) {
        store.threadsData.forEach(thread => {
            if (thread.categoryId === id) {
                updates[`threads/${thread.id}`] = null;
            }
        });
    }

    // Atomic update
    db.ref().update(updates)
        .then(() => {
            if (store.activeCategory === id) {
                store.activeCategory = 'all';
                renderDiscussions();
                populateCategorySelect();
            }
        })
        .catch(error => {
            console.error("Errore durante l'eliminazione della categoria:", error);
            alert("Errore durante l'eliminazione.");
        });
};

window.deleteThread = (id) => {
    if (!confirm('Eliminare questa discussione?')) return;
    db.ref(`threads/${id}`).remove().then(() => {
        if (store.activeThread === id) {
            store.activeThread = null;
            renderDiscussions();
        }
    });
};

window.deletePost = (threadId, postId) => {
    if (!confirm('Eliminare questo messaggio?')) return;
    db.ref(`threads/${threadId}/posts/${postId}`).remove();
};

window.togglePinThread = (threadId, currentStatus) => {
    db.ref(`threads/${threadId}`).update({ isPinned: !currentStatus });
};

window.toggleLike = (threadId, postId = null) => {
    if (!store.currentUser) {
        alert('Devi accedere per mettere Mi piace.');
        return;
    }
    const username = store.currentUser.username;
    const path = postId 
        ? `threads/${threadId}/posts/${postId}/likes/${username}` 
        : `threads/${threadId}/likes/${username}`;
    
    const ref = db.ref(path);
    ref.once('value').then(snap => {
        if (snap.exists()) {
            ref.remove();
        } else {
            ref.set(true);
        }
    });
};

window.logout = () => {
    firebase.auth().signOut().then(() => {
        store.currentUser = null;
        store.activeThread = null;
        checkUserStatus();
    });
};

window.openModal = showModal;

function checkUserStatus() {
    if (store.currentUser) {
        elements.app.style.display = 'flex';
        elements.loginBtn.classList.add('hidden');
        elements.userProfileSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; background: var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${store.currentUser.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${store.currentUser.username}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${store.currentUser.isAdmin ? 'Amministratore' : 'Utente'}</div>
                </div>
                <button onclick="logout()" style="margin-left: auto; background: none; color: var(--text-secondary);"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
            ${store.currentUser.isAdmin ? `
                <div style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                    <button onclick="toggleNotifications()" id="admin-notify-btn" class="btn-secondary" style="width: 100%; font-size: 0.85rem; padding: 0.5rem; transition: all 0.2s;">
                        <i class="fa-solid fa-bell"></i> <span id="notify-btn-text">Verifica stato...</span>
                    </button>
                </div>
            ` : ''}
        `;

        if (store.currentUser.isAdmin) {
            elements.addCategoryBtn.classList.remove('hidden');
            fetchNotificationSettings();
        } else {
            elements.addCategoryBtn.classList.add('hidden');
        }
    } else {
        elements.app.style.display = 'none';
        elements.loginBtn.classList.remove('hidden');
        elements.userProfileSection.innerHTML = '';
        elements.addCategoryBtn.classList.add('hidden');

        // Force Login
        showModal('login-modal');
        const loginCloseBtn = document.querySelector('#login-modal .close-modal');
        if (loginCloseBtn) loginCloseBtn.style.display = 'none';
    }

    // Re-render views to update permissions (e.g. delete buttons)
    if (store.categoriesData && store.categoriesData.length > 0) renderCategories();
    if (store.threadsData && store.threadsData.length > 0) renderDiscussions();
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderDiscussions();
        });
    }

    elements.loginBtn.addEventListener('click', () => showModal('login-modal'));
    elements.addCategoryBtn.addEventListener('click', () => showModal('create-category-modal'));
    elements.newDiscussionBtn.addEventListener('click', () => {
        if (!store.currentUser) {
            alert('Devi effettuare il login per creare una discussione.');
            showModal('login-modal');
            return;
        }

        // Remove all old category labels first
        const oldLabels = elements.threadCategorySelect.parentElement.querySelectorAll('.category-label');
        oldLabels.forEach(label => label.remove());

        // If a specific category is selected, hide the category select
        if (store.activeCategory !== 'all') {
            const categoryName = store.categoriesData?.find(c => c.id === store.activeCategory)?.name;
            elements.threadCategorySelect.style.display = 'none';

            // Hide reminder text
            const reminder = document.getElementById('category-reminder');
            if (reminder) reminder.style.display = 'none';

            // Add a label showing the selected category
            const label = document.createElement('div');
            label.className = 'category-label';
            label.style.cssText = 'padding: 0.75rem; background: rgba(99, 102, 241, 0.15); border-radius: 6px; margin-bottom: 0.75rem; color: var(--accent-primary); font-weight: 500;';
            label.innerHTML = `<i class="fa-solid fa-folder"></i> Categoria: ${categoryName}`;
            elements.threadCategorySelect.parentElement.insertBefore(label, elements.threadCategorySelect);
        } else {
            // Show category select if "all" is selected
            elements.threadCategorySelect.style.display = 'block';

            // Show reminder text
            const reminder = document.getElementById('category-reminder');
            if (reminder) reminder.style.display = 'inline';

            populateCategorySelect();
        }

        showModal('create-thread-modal');
    });

    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    elements.adminCheckbox.addEventListener('change', (e) => {
        const passwordInput = document.getElementById('admin-password-input');
        if (e.target.checked) {
            passwordInput.classList.remove('hidden');
            elements.usernameInput.classList.add('hidden');
        } else {
            passwordInput.classList.add('hidden');
            elements.usernameInput.classList.remove('hidden');
        }
    });

    elements.confirmLogin.addEventListener('click', () => {
        const username = elements.usernameInput.value.trim();
        const isAdmin = elements.adminCheckbox.checked;
        const password = document.getElementById('admin-password-input').value;

        if (isAdmin) {
            if (password === 'admin123') {
                store.currentUser = { username: 'Amministratore', isAdmin: true };
            } else {
                alert('Password errata!');
                return;
            }
        } else {
            if (!username) return;

            // Whitelist Check
            const normalizedInput = username.trim().toLowerCase();
            const isAllowed = ALLOWED_USERS.some(user => user.toLowerCase() === normalizedInput);

            if (!isAllowed) {
                alert('Accesso negato: Utente non autorizzato.');
                return;
            }

            // Strip domain for display
            let displayUsername = username.trim();
            const domainIndex = displayUsername.toLowerCase().indexOf('@alberghieropesaro.it');
            if (domainIndex !== -1) {
                displayUsername = displayUsername.substring(0, domainIndex);
            }

            store.currentUser = { username: displayUsername, isAdmin: false };
        }

        checkUserStatus();

        // Firebase Anonymous Login for DB access
        firebase.auth().signInAnonymously()
            .then(() => {
                console.log("Logged in anonymously to Firebase");
            })
            .catch((error) => {
                console.error("Firebase Auth Error:", error);
                alert("Errore di connessione al database. Verifica di aver abilitato l'autenticazione Anonima nella console Firebase.");
            });

        // --- MODIFIED LOGIN FLOW ---
        // Instead of immediate checkUserStatus(), we show rules
        // closeModal(); 
        document.getElementById('login-modal').classList.add('hidden');
        showModal('rules-modal');
        // -----------------------------

        elements.usernameInput.value = '';
        elements.adminCheckbox.checked = false;
        document.getElementById('admin-password-input').value = '';
        document.getElementById('admin-password-input').classList.add('hidden');
        elements.usernameInput.classList.remove('hidden');
    });

    // NEW RULES ACCEPTANCE LISTENER
    if (elements.acceptRulesBtn) {
        elements.acceptRulesBtn.addEventListener('click', () => {
            closeModal(); // This now works because store.currentUser is set
        });
    }

    elements.confirmCreateCategory.addEventListener('click', () => {
        const name = elements.newCategoryName.value.trim();
        if (!name) return;

        db.ref('categories').push({
            name: name
        }).then(() => {
            closeModal();
            elements.newCategoryName.value = '';
        });
    });

    elements.confirmCreateThread.addEventListener('click', () => {
        const title = elements.newThreadTitle.value.trim();
        const content = elements.newThreadContent.value.trim();

        const categoryId = store.activeCategory !== 'all'
            ? store.activeCategory
            : elements.threadCategorySelect.value;

        if (!title || !content || !categoryId) return;

        db.ref('threads').push({
            categoryId: categoryId,
            title: title,
            content: content,
            author: store.currentUser.username,
            date: new Date().toISOString()
        }).then(() => {
            closeModal();
            elements.newThreadTitle.value = '';
            elements.newThreadContent.value = '';
            
            // Resolve category name
            const category = store.categoriesData.find(c => c.id === categoryId);
            const categoryName = category ? category.name : 'Varie';

            // Invia notifica email
            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: store.currentUser.username,
                    title: title,
                    discussionTitle: title,
                    content: content,
                    category: categoryName
                })
            }).catch(e => console.error('Errore notifica:', e));
        });
    });

    // Mobile Menu Listeners
    if (elements.menuToggleBtn) {
        elements.menuToggleBtn.addEventListener('click', () => {
            elements.sidebar.classList.add('active');
        });
    }

    if (elements.closeSidebarBtn) {
        elements.closeSidebarBtn.addEventListener('click', () => {
            elements.sidebar.classList.remove('active');
        });
    }
}

function showModal(modalId) {
    elements.modalOverlay.classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal() {
    // Prevent closing if not logged in
    if (!store.currentUser) return;

    elements.modalOverlay.classList.add('hidden');
    elements.loginModal.classList.add('hidden');
    elements.createCategoryModal.classList.add('hidden');
    elements.createThreadModal.classList.add('hidden');
    elements.rulesModal?.classList.add('hidden');
}

function populateCategorySelect() {
    if (store.categoriesData) {
        elements.threadCategorySelect.innerHTML = store.categoriesData.map(cat =>
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }
}

// --- Admin Notification Logic ---

window.toggleNotifications = () => {
    if (store.notificationsEnabled === undefined) return;
    const btn = document.getElementById('admin-notify-btn');
    if (btn) btn.style.opacity = '0.5';

    const newState = !store.notificationsEnabled;
    fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
    })
    .then(res => res.json())
    .then(data => {
        store.notificationsEnabled = data.enabled;
        updateNotificationBtn();
        if (btn) btn.style.opacity = '1';
    })
    .catch(err => {
        console.error("Errore aggiornamento notifiche", err);
        if (btn) btn.style.opacity = '1';
    });
};

function fetchNotificationSettings() {
    fetch('/api/settings/notifications')
    .then(res => res.json())
    .then(data => {
        store.notificationsEnabled = data.enabled;
        updateNotificationBtn();
    })
    .catch(err => console.error("Errore lettura notifiche", err));
}

function updateNotificationBtn() {
    const btnText = document.getElementById('notify-btn-text');
    const btn = document.getElementById('admin-notify-btn');
    const icon = btn ? btn.querySelector('.fa-solid') : null;

    if (btnText && btn && icon) {
        if (store.notificationsEnabled) {
            btnText.textContent = 'Notifiche Email: ON';
            btn.style.borderColor = 'var(--accent-primary)';
            btn.style.color = 'var(--accent-primary)';
            btn.style.background = 'rgba(99, 102, 241, 0.1)';
            icon.className = 'fa-solid fa-bell';
        } else {
            btnText.textContent = 'Notifiche Email: OFF';
            btn.style.borderColor = 'var(--text-secondary)';
            btn.style.color = 'var(--text-secondary)';
            btn.style.background = 'transparent';
            icon.className = 'fa-solid fa-bell-slash';
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
