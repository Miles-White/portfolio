<?php
header("Content-Type: application/json");
session_start();

// --- TES INFOS IONOS (A REMPLIR) ---
$host = 'db5019071145.hosting-data.io'; 
$db   = 'dbs15000313';                
$user = 'dbu1094243';                
$pass = 'noctaw-fynZiz-dens7';  
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur connexion SQL']); exit;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents("php://input"), true);

// 1. Lire les projets (Public) - Peut filtrer par catégorie
if ($action === 'get_projects') {
    $cat = $_GET['category'] ?? 'all';
    if ($cat === 'all') {
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY id DESC");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE category = ? ORDER BY id DESC");
        $stmt->execute([$cat]);
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// 2. Connexion Admin
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch();
    if ($user && password_verify($input['password'], $user['password'])) {
        $_SESSION['admin'] = true; echo json_encode(['success' => true]);
    } else { echo json_encode(['success' => false, 'error' => 'Identifiants incorrects']); }
    exit;
}

// 3. Ajouter un projet (Admin)
if ($action === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['admin'])) { echo json_encode(['success' => false, 'error' => 'Non connecté']); exit; }
    $sql = "INSERT INTO projects (title, category, description, image) VALUES (?,?,?,?)";
    $pdo->prepare($sql)->execute([$input['title'], $input['category'], $input['desc'], $input['image']]);
    echo json_encode(['success' => true]); exit;
}

// 4. Supprimer (Admin)
if ($action === 'delete' && isset($_SESSION['admin'])) {
    $pdo->prepare("DELETE FROM projects WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(['success' => true]); exit;
}
?>