const perfilInfo = document.getElementById('perfil-info');
const btnLogout = document.getElementById('btn-logout');
const jwtTokenArea = document.getElementById('jwt-token-value');

const perfilForm = document.getElementById('perfil-form');
const perfilAvatar = document.getElementById('perfil-avatar');
const perfilAvatarPreview = document.getElementById('perfil-avatar-preview');
const perfilFoto = document.getElementById('perfil-foto');

const perfilNome = document.getElementById('perfil-nome');
const perfilEmail = document.getElementById('perfil-email');
const perfilTelefone = document.getElementById('perfil-telefone');
const perfilProfissao = document.getElementById('perfil-profissao');
const perfilSenha = document.getElementById('perfil-senha');

const IMAGEM_PADRAO = 'img/img-default.svg';
let perfilAtual = {};
let fotoSelecionada = null;

function atualizarAvatar(src) {
    const foto = src || IMAGEM_PADRAO;

    if (perfilAvatar) {
        perfilAvatar.src = foto;
    }

    if (perfilAvatarPreview) {
        perfilAvatarPreview.src = foto;
    }
}

function preencherFormulario(perfil) {
    if (perfilNome) perfilNome.value = perfil.nome || '';
    if (perfilEmail) perfilEmail.value = perfil.email || '';
    if (perfilTelefone) perfilTelefone.value = perfil.telefone || '';
    if (perfilProfissao) perfilProfissao.value = perfil.profissao || '';
    if (perfilSenha) perfilSenha.value = '';
}

function criarItemPerfil(label, valor) {
    return `
        <div class="col-12 col-md-6 col-xl-3">
            <div class="perfil-item h-100">
                <div class="pi-label">${label}</div>
                <div class="pi-value">${valor || '—'}</div>
            </div>
        </div>
    `;
}

function renderizarPerfil(perfil) {
    perfilAtual = { ...perfil };

    if (perfilInfo) {
        perfilInfo.innerHTML = `
            ${criarItemPerfil('ID', perfil.id)}
            ${criarItemPerfil('Nome', perfil.nome)}
            ${criarItemPerfil('E-mail', perfil.email)}
            ${criarItemPerfil('Telefone', perfil.telefone)}
            ${criarItemPerfil('Profissao', perfil.profissao)}
        `;
    }

    preencherFormulario(perfilAtual);
    atualizarAvatar(perfil.foto || perfil.avatar || '');
}

async function carregarPerfil() {
    try {
        const perfil = await apiRequest('/usuarios/perfil');
        renderizarPerfil(perfil || {});
    } catch (erro) {
        mostrarResultado(`Falha ao carregar perfil: ${erro.message}`, 'error');
        logout();
    }
}

function onSelecionarFoto(event) {
    const arquivo = event.target.files && event.target.files[0];

    if (!arquivo) {
        fotoSelecionada = null;
        atualizarAvatar('');
        return;
    }

    fotoSelecionada = arquivo;
    atualizarAvatar(URL.createObjectURL(arquivo));
}

async function salvarPerfil(event) {
    event.preventDefault();

    const senha = (perfilSenha?.value || '').trim();
    const formData = new FormData();
    formData.append('nome', (perfilNome?.value || '').trim());
    formData.append('email', (perfilEmail?.value || '').trim());
    formData.append('telefone', (perfilTelefone?.value || '').trim());
    formData.append('profissao', (perfilProfissao?.value || '').trim());

    if (senha) formData.append('senha', senha);
    if (fotoSelecionada) formData.append('foto', fotoSelecionada);

    try {
        await apiRequest('/usuarios/' + perfilAtual.id, {
            method: 'PUT',
            body: formData,
        });

        await carregarPerfil();
        fotoSelecionada = null;
        mostrarResultado('Perfil atualizado com sucesso.');

        const modal = document.getElementById('perfilModal');
        if (modal && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
    } catch (erro) {
        mostrarResultado(`Falha ao atualizar perfil: ${erro.message}`, 'error');
    }
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => logout(true));
}

if (perfilFoto) {
    perfilFoto.addEventListener('change', onSelecionarFoto);
}

if (perfilForm) {
    perfilForm.addEventListener('submit', salvarPerfil);
}

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    if (jwtTokenArea) {
        jwtTokenArea.textContent = getToken() || 'Token não encontrado';
    }

    atualizarAvatar('');
    await carregarPerfil();
});
