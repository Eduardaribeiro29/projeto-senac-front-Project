const formProduto = document.getElementById('form-produto');
const inputId = document.getElementById('produto-id');
const inputTitulo = document.getElementById('produto-titulo');
const inputData_validade = document.getElementById('produto-data-validade');
const inputData_fabricacao = document.getElementById('produto-data-fabricacao');
const inputQuantidade = document.getElementById('produto-quantidade');
const inputFoto = document.getElementById('produto-foto');
const inputStatus = document.getElementById('produto-status');
const modalTitle = document.getElementById('produtoModalTitle');
const btnNovoProduto = document.getElementById('btn-novo-produto');
const btnModalSalvar = document.getElementById('btn-modal-salvar');
const btnModalEditar = document.getElementById('btn-modal-editar');
const btnModalExcluir = document.getElementById('btn-modal-excluir');

const listaCards = document.getElementById('lista-produtos-cards');
const listaTabela = document.getElementById('lista-produtos-tabela');

const cardsWrapper = document.getElementById('produtos-cards-wrapper');
const kanbanWrapper = document.getElementById('produtos-kanban-wrapper');
const tabelaWrapper = document.getElementById('produtos-tabela-wrapper');

const colunaNovo = document.getElementById('kanban-novo');
const colunaValido = document.getElementById('kanban-valido');
const colunaVencido = document.getElementById('kanban-vencido');

const btnViewCards = document.getElementById('view-cards');
const btnViewKanban = document.getElementById('view-kanban');
const btnViewTable = document.getElementById('view-table');
const produtoModalEl = document.getElementById('produtoModal');

const produtoModal = produtoModalEl && window.bootstrap
    ? bootstrap.Modal.getOrCreateInstance(produtoModalEl)
    : null;
let fotoSelecionada = null;

const STATUS_LABEL = {
    novo: 'Novo',
    valido: 'Dentro da Validade',
    vencido: 'Vencido',
};

let produtos = [];
let viewMode = 'cards';
let produtoSelecionadoId = null;
let modalMode = 'create';

function normalizarStatus(produto) {
    const bruto = String(produto?.status || '').toLowerCase();

    if (bruto.includes('and')) return 'valido';
    if (bruto.includes('concl')) return 'vencido';
    if (produto?.vencido) return 'vencido';

    return 'novo';
}

function aplicarViewMode() {
    cardsWrapper.classList.toggle('is-hidden', viewMode !== 'cards');
    kanbanWrapper.classList.toggle('is-hidden', viewMode !== 'kanban');
    tabelaWrapper.classList.toggle('is-hidden', viewMode !== 'table');

    btnViewCards.classList.toggle('active', viewMode === 'cards');
    btnViewKanban.classList.toggle('active', viewMode === 'kanban');
    btnViewTable.classList.toggle('active', viewMode === 'table');
}

function criarBadgeStatus(status) {
    return `<span class="status-pill ${status}">${STATUS_LABEL[status] || 'Novo'}</span>`;
}

function criarCardHtml(produto) {
    const status = normalizarStatus(produto);
    const titulo = produto.titulo || '';
    return `
        <div class="produto-card ${status}">
            <div class="produto-card-title"><b>#${produto.id}</b> ${produto.titulo}</div>
            ${titulo ? `<div class="produto-card-desc">${titulo}</div>` : ''}
            <div>${criarBadgeStatus(status)}</div>
        </div>
    `;
}

function criarKanbanItem(produto) {
    const status = normalizarStatus(produto);
    const item = document.createElement('div');
    item.className = `kanban-card ${status}`;
    item.draggable = true;
    item.dataset.id = produto.id;

    item.innerHTML = `
        <div class="produto-card-title"><b>#${produto.id}</b> ${produto.titulo}</div>
        ${produto.titulo ? `<div class="produto-card-desc">${produto.titulo}</div>` : ''}
        <div>${criarBadgeStatus(status)}</div>
    `;

    item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', String(produto.id));
    });

    item.addEventListener('click', () => {
        verProduto(produto.id);
    });

    return item;
}

function renderCards() {
    listaCards.innerHTML = '';

    if (!produtos.length) {
        listaCards.innerHTML = '<div class="empty-state"><p>Nenhum produto encontrado.</p></div>';
        return;
    }

    produtos.forEach((produto) => {
        const card = document.createElement('div');
        card.innerHTML = criarCardHtml(produto);
        const item = card.firstElementChild;
        item.addEventListener('click', () => {
            verProduto(produto.id);
        });
        listaCards.appendChild(item);
    });
}

function renderTabela() {
    listaTabela.innerHTML = '';

    if (!produtos.length) {
        listaTabela.innerHTML = '<tr><td colspan="5">Nenhum produto encontrado.</td></tr>';
        return;
    }

    produtos.forEach((produto) => {
        const status = normalizarStatus(produto);
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.titulo}</td>
            <td>${produto.data_fabricacao || '-'}</td>
            <td>${produto.data_validade || '-'}</td>
            <td>${produto.quantidade || '-'}</td>
            <td>${criarBadgeStatus(status)}</td>
            <td class="table-actions">
                <button type="button" class="small" onclick="verProduto(${produto.id})">Ver</button>
                <button type="button" class="small" onclick="editarProduto(${produto.id})">Editar</button>
                <button type="button" class="small danger" onclick="excluirProduto(${produto.id})">Excluir</button>
            </td>
        `;
        listaTabela.appendChild(linha);
    });
}

function renderKanban() {
    colunaNovo.innerHTML = '';
    colunaValido.innerHTML = '';
    colunaVencido.innerHTML = '';

    produtos.forEach((produto) => {
        const status = normalizarStatus(produto);
        const card = criarKanbanItem(produto);

        if (status === 'valido') {
            colunaValido.appendChild(card);
        } else if (status === 'vencido') {
            colunaVencido.appendChild(card);
        } else {
            colunaNovo.appendChild(card);
        }
    });
}

function renderTudo() {
    renderCards();
    renderKanban();
    renderTabela();
    aplicarViewMode();
}

async function carregarProdutos() {
    try {
        const resposta = await apiRequest('/produtos');

        if (Array.isArray(resposta)) {
            produtos = resposta;
        } else if (Array.isArray(resposta?.produtos)) {
            produtos = resposta.produtos;
        } else if (Array.isArray(resposta?.data)) {
            produtos = resposta.data;
        } else {
            produtos = [];
        }

        renderTudo();
    } catch (erro) {
        mostrarResultado(`Erro ao carregar produtos: ${erro.message}`, 'error');
    }
}

async function atualizarStatusApi(produto, novoStatus) {
    const payload = {
        titulo: produto.titulo,
        status: novoStatus,
        vencido: novoStatus === 'vencido',
    };

    await apiRequest(`/produtos/${produto.id}`, {
        method: 'PUT',
        body: payload,
    });
}

async function moverProduto(id, novoStatus) {
    const produto = produtos.find((item) => String(item.id) === String(id));
    if (!produto) return;

    try {
        await atualizarStatusApi(produto, novoStatus);

        produto.status = novoStatus;
        produto.vencido = novoStatus === 'vencido';

        renderTudo();
        mostrarResultado(`Status atualizado para ${STATUS_LABEL[novoStatus]}.`);
    } catch (erro) {
        mostrarResultado(`Erro ao atualizar status: ${erro.message}`, 'error');
    }
}

function configurarDrop(coluna, statusDestino) {
    coluna.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    coluna.addEventListener('drop', async (event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        await moverProduto(id, statusDestino);
    });
}

function getProdutoById(id) {
    return produtos.find((item) => String(item.id) === String(id));
}

function setCamposSomenteLeitura(somenteLeitura) {
    inputTitulo.readOnly = somenteLeitura;
    inputData_validade.readOnly = somenteLeitura;
    inputData_fabricacao.readOnly = somenteLeitura;
    inputQuantidade.readOnly = somenteLeitura;
    inputStatus.disabled = somenteLeitura;
}

function preencherModal(produto) {
    inputId.value = produto?.id || '';
    inputTitulo.value = produto?.titulo || '';
    inputData_validade.value = produto?.data_validade || '';
    inputData_fabricacao.value = produto?.data_fabricacao || '';
    inputQuantidade.value = produto?.quantidade || '';
    inputStatus.value = normalizarStatus(produto || {});
}

function aplicarModoModal() {
    const isCreate = modalMode === 'create';
    const isView = modalMode === 'view';

    setCamposSomenteLeitura(isView);

    btnModalSalvar.classList.toggle('is-hidden', isView);
    btnModalEditar.classList.toggle('is-hidden', !isView);
    btnModalExcluir.classList.toggle('is-hidden', isCreate);

    if (isCreate) {
        modalTitle.textContent = 'Novo produto';
        btnModalSalvar.textContent = 'Salvar';
    } else if (isView) {
        modalTitle.textContent = 'Detalhes do produto';
    } else {
        modalTitle.textContent = 'Editar produto';
        btnModalSalvar.textContent = 'Salvar alterações';
    }
}

function abrirNovoProduto() {
    produtoSelecionadoId = null;

    if (inputFoto) {
        inputFoto.value = '';
    }
    modalMode = 'create';
    preencherModal({ id: '', titulo: '', data_validade: '', data_fabricacao: '', quantidade: '' });
    aplicarModoModal();
}

function verProduto(id) {
    const produto = getProdutoById(id);
    if (!produto) return;

    produtoSelecionadoId = produto.id;
    modalMode = 'view';
    preencherModal(produto);
    aplicarModoModal();
    produtoModal?.show();
}

function editarProduto(id = null) {
    const produto = getProdutoById(id || produtoSelecionadoId);
    if (!produto) return;

    produtoSelecionadoId = produto.id;
    modalMode = 'edit';
    preencherModal(produto);
    aplicarModoModal();
    produtoModal?.show();
}

async function excluirProduto(id = null) {
    const produto = getProdutoById(id || produtoSelecionadoId);
    if (!produto) return;

    const confirmar = window.Swal
        ? await Swal.fire({
            icon: 'warning',
            text: `Excluir a produto "${produto.titulo}"?`,
            showCancelButton: true,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
        })
        : { isConfirmed: confirm('Excluir este produto?') };

    if (!confirmar.isConfirmed) return;

    try {
        await apiRequest(`/produtos/${produto.id}`, { method: 'DELETE' });
        produtos = produtos.filter((item) => String(item.id) !== String(produto.id));
        produtoModal?.hide();
        renderTudo();
        mostrarResultado('Produto excluído com sucesso.');
    } catch (erro) {
        mostrarResultado(`Erro ao excluir produto: ${erro.message}`, 'error');
    }
}
if (inputFoto) {
    inputFoto.addEventListener('change', onSelecionarFoto);
}
function onSelecionarFoto(event) {
    const arquivo = event.target.files && event.target.files[0];

    if (!arquivo) {
        fotoSelecionada = null;
        // atualizarAvatar('');
        return;
    }

    fotoSelecionada = arquivo;
    // atualizarAvatar(URL.createObjectURL(arquivo));
}

async function criarProduto(event) {
    event.preventDefault();

    const id = inputId.value;
    const titulo = inputTitulo.value.trim();
    const data_validade = inputData_validade.value.trim();
    const data_fabricacao = inputData_fabricacao.value.trim();
    const quantidade = Number(
        inputQuantidade.value.trim()
    );
    const status = inputStatus.value;
    const foto = fotoSelecionada;

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('data_validade', data_validade);
    formData.append('data_fabricacao', data_fabricacao);
    formData.append('quantidade', quantidade);
    formData.append('status', status);
    formData.append('vencido', status === 'vencido');

    if (
        new Date(data_fabricacao) >
        new Date(data_validade)
    ) {
        mostrarResultado(
            'A data de fabricação não pode ser maior que a data de validade.',
            'error'
        );
        return;
    }

    if (fotoSelecionada) formData.append('foto', fotoSelecionada);
    if (!titulo) {
        mostrarResultado('Informe o título', 'error');
        return;
    }

    if (!data_fabricacao) {
        mostrarResultado('Informe a data de fabricação', 'error');
        return;
    }

    if (!data_validade) {
        mostrarResultado('Informe a data de validade', 'error');
        return;
    }

    if (!quantidade) {
        mostrarResultado('Informe a quantidade', 'error');
        return;
    };

    try {
        if (modalMode === 'edit' && id) {
            const resposta = await apiRequest(`/produtos/${id}`, {
                method: 'PUT',
                body: formData,
            });

            await carregarProdutos();

            const index = produtos.findIndex((item) => String(item.id) === String(id));
            if (index >= 0) {
                produtos[index] = {
                    ...produtos[index],
                    ...payload,
                    ...(typeof resposta === 'object' ? resposta : {}),
                };
            }

            mostrarResultado('Produto atualizado com sucesso.');
        } else {
            const nova = await apiRequest('/produtos', {
                method: 'POST',
                body: formData,
            });

            if (nova && nova.id) {
                produtos.push({ ...nova, data_validade, data_fabricacao, quantidade, status, vencido: status === 'vencido' });
            } else {
                await carregarProdutos();
            }

            mostrarResultado('Produto criado com sucesso.');
        }

        renderTudo();
        if (produtoModal) produtoModal.hide();
        formProduto.reset();
        fotoSelecionada = null;
        inputStatus.value = 'novo';
        modalMode = 'create';
        produtoSelecionadoId = null;
    } catch (erro) {
        mostrarResultado(`Erro ao salvar produto: ${erro.message}`, 'error');
    }
}

btnViewCards.addEventListener('click', () => {
    viewMode = 'cards';
    aplicarViewMode();
});

btnViewKanban.addEventListener('click', () => {
    viewMode = 'kanban';
    aplicarViewMode();
});

btnViewTable.addEventListener('click', () => {
    viewMode = 'table';
    aplicarViewMode();
});

formProduto.addEventListener('submit', criarProduto);

btnNovoProduto.addEventListener('click', abrirNovoProduto);
btnModalEditar.addEventListener('click', () => editarProduto());
btnModalExcluir.addEventListener('click', () => excluirProduto());

window.verProduto = verProduto;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;

configurarDrop(colunaNovo, 'novo');
configurarDrop(colunaValido, 'valido');
configurarDrop(colunaVencido, 'vencido');

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    await carregarProdutos();
});
