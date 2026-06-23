const API_BASE = 'https://prazu-api.vercel.app';
// const API_BASE = 'http://localhost:3000';

const TOKEN_KEY = 'token-api-1234';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function setupTopbarAuth() {
    const nav = document.querySelector('.topbar-nav');
    if (!nav) return;

    const token = getToken();
    const links = Array.from(nav.querySelectorAll('.nav-link'));

    links.forEach((link) => {
        const href = (link.getAttribute('href') || '').trim();
        const show = href === 'index.html'
            || href === 'produtos.html'
            || href === 'login.html'
            || href === 'cadastro.html'
            || (token && href === 'perfil.html');

        link.classList.toggle('d-none', !show);
    });

    const topbarLogout = document.getElementById('topbar-logout');
    if (topbarLogout) {
        if (token) {
            topbarLogout.classList.remove('is-hidden');
            topbarLogout.classList.remove('d-none');
        } else {
            topbarLogout.classList.add('is-hidden');
            topbarLogout.classList.add('d-none');
        }
    }
}

function getResultadoArea() {
    return document.getElementById('resultado');
}

function mostrarResultado(texto, tipo = 'success') {
    const resultadoArea = getResultadoArea();
    const isSuccess = tipo === 'success';

    if (window.Swal) {
        Swal.fire({
            icon: isSuccess ? 'success' : 'error',
            text: texto,
            confirmButtonColor: '#2563eb',
        });
    }

    if (resultadoArea) {
        resultadoArea.className = `alert alert-${isSuccess ? 'success' : 'danger'} mt-3 mb-0`;
        resultadoArea.textContent = texto;
    } else if (!window.Swal) {
        console.log(texto);
    }
}

function setupValidation(form) {
    if (!form) return;
}

async function apiRequest(path, options = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;
    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (options.auth !== false && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_BASE}${path}`, {
        method: options.method || 'PUT',
        headers,
        body: options.body
            ? (isFormData ? options.body : JSON.stringify(options.body))
            : undefined,
    });

    const textoResposta = await resposta.text();
    let dados;

    try {
        dados = JSON.parse(textoResposta);
    } catch (erro) {
        dados = { message: textoResposta };
    }

    if (!resposta.ok) {
        const mensagem = dados.message || `Erro ${resposta.status}`;
        throw new Error(mensagem);
    }

    return dados;
}

function logout(redirect = true) {
    clearToken();
    setupTopbarAuth();
    if (redirect) {
        window.location.href = 'login.html';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setupTopbarAuth();

    const topbarLogout = document.getElementById('topbar-logout');
    if (topbarLogout) {
        topbarLogout.addEventListener('click', (event) => {
            event.preventDefault();
            logout(true);
        });
    }
});
