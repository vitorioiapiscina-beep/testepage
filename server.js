const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const app = express();

// 1. CONFIGURAÇÕES INICIAIS
app.use(express.urlencoded({ extended: true }));

// Configuração do Sistema de Sessão 📦
app.use(session({
    secret: 'meusegredomuitoseguro',
    resave: false,
    saveUninitialized: true
}));

// Conexão com o Banco de Dados SQLite 🗄️
const db = new sqlite3.Database('./banco.db', (err) => {
    if (err) console.error('Erro ao conectar ao banco:', err.message);
    else console.log('Conectado ao banco de dados SQLite.');
});

// 2. MIDDLEWARE DE SEGURANÇA 🛡️
function verificarAutenticacao(req, res, next) {
    if (req.session && req.session.logado) {
        return next();
    }
    res.redirect('/login');
}

// 3. ROTAS DE AUTENTICAÇÃO (LOGIN / LOGOUT) 🔐
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === 'senha123') {
        req.session.logado = true;
        res.redirect('/');
    } else {
        res.redirect('/login?erro=1');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// 4. ROTAS PROTEGIDAS DO PAINEL DE CLIENTES 🖥️
app.get('/', verificarAutenticacao, (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/clientes', verificarAutenticacao, (req, res) => {
    db.all('SELECT * FROM clientes', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

app.post('/clientes/excluir', verificarAutenticacao, (req, res) => {
    const { id } = req.body;
    db.run('DELETE FROM clientes WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).send('Erro ao excluir.');
        res.redirect('/');
    });
});

// INICIALIZAÇÃO DO SERVIDOR
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000 🚀');
});