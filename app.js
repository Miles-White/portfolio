const API_URL = 'api.php'; // Chemin relatif vers l'API

document.addEventListener('DOMContentLoaded', () => {
    // Détection de la page actuelle pour charger les bons projets
    const page = document.body.getAttribute('data-page');
    if (['home', 'perso', 'univ', 'pro'].includes(page)) {
        loadProjects(page === 'home' ? 'all' : page);
    }

    // Gestion Admin
    if (page === 'admin') {
        if (sessionStorage.getItem('isAdmin') === 'true') {
            showDashboard();
        } else {
            document.getElementById('login-box').style.display = 'block';
        }
    }
});

// --- FONCTIONS PUBLIQUES ---
function loadProjects(category) {
    const url = category === 'all' ? `${API_URL}?action=get_projects` : `${API_URL}?action=get_projects&category=${category}`;
    
    fetch(url)
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        container.innerHTML = '';
        // Sur la page d'accueil, on ne montre que les 3 derniers, sinon tous
        const projectsToShow = category === 'all' ? data.slice(0, 3) : data;

        projectsToShow.forEach(p => {
            container.innerHTML += `
            <div class="card">
                <div class="card-img-wrap">
                    <img src="../${p.image}" onerror="this.src='images/placeholder.jpg'" alt="${p.title}">
                </div>
                <div class="card-content">
                    <span class="tag">${p.category}</span>
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                </div>
            </div>`;
        });
    })
    .catch(err => console.error("Erreur chargement projets:", err));
}

// --- FONCTIONS ADMIN ---
function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    fetch(`${API_URL}?action=login`, {
        method: 'POST', body: JSON.stringify({ username: u, password: p })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('isAdmin', 'true');
            showDashboard();
        } else { alert('Erreur: ' + data.error); }
    });
}

function showDashboard() {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminList();
}

function loadAdminList() {
    fetch(`${API_URL}?action=get_projects`)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById('admin-list');
        list.innerHTML = '';
        data.forEach(p => {
            list.innerHTML += `
            <div class="admin-item">
                <strong>[${p.category}] ${p.title}</strong>
                <button class="btn-delete" onclick="deleteProject(${p.id})">Supprimer</button>
            </div>`;
        });
    });
}

function addProject() {
    const data = {
        title: document.getElementById('p-title').value,
        category: document.getElementById('p-cat').value,
        image: document.getElementById('p-img').value,
        desc: document.getElementById('p-desc').value
    };
    if(!data.title || !data.desc) return alert("Titre et description obligatoires");

    fetch(`${API_URL}?action=add`, { method: 'POST', body: JSON.stringify(data) })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert('Projet ajouté !');
            loadAdminList();
            document.getElementById('p-title').value = '';
            document.getElementById('p-desc').value = '';
        } else { alert('Erreur: ' + data.error); }
    });
}

function deleteProject(id) {
    if(confirm('Supprimer définitivement ?')) {
        fetch(`${API_URL}?action=delete&id=${id}`).then(() => loadAdminList());
    }
}