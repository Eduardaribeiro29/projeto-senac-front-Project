const formProduto = document.getElementById('form-produto');
const inputId = document.getElementById('produto-id');
const inputTitulo = document.getElementById('produto-titulo');
const inputDescricao = document.getElementById('produto-descricao');
const inputStatus = document.getElementById('produto-status');
const modalTitle = document.getElementById('produtoModalTitle');
const btnNovaProduto = document.getElementById('btn-novo-produto');
const btnModalSalvar = document.getElementById('btn-modal-salvar');
const btnModalEditar = document.getElementById('btn-modal-editar');
const btnModalExcluir = document.getElementById('btn-modal-excluir');

const listaCards = document.getElementById('lista-produtos-cards');
const listaTabela = document.getElementById('lista-produtos-tabela');

const cardsWrapper = document.getElementById('produtos-cards-wrapper');
const kanbanWrapper = document.getElementById('produtos-kanban-wrapper');
const tabelaWrapper = document.getElementById('produtos-tabela-wrapper');

const colunaNovo = document.getElementById('kanban-novo');
const colunaAndamento = document.getElementById('kanban-andamento');
const colunaConcluida = document.getElementById('kanban-concluida');

const btnViewCards = document.getElementById('view-cards');
const btnViewKanban = document.getElementById('view-kanban');
const btnViewTable = document.getElementById('view-table');
const tarefaModalEl = document.getElementById('tarefaModal');

const tarefaModal = tarefaModalEl && window.bootstrap
    ? bootstrap.Modal.getOrCreateInstance(tarefaModalEl)
    : null;

const STATUS_LABEL = {
    novo: 'Novo',
    andamento: 'Em andamento',
    concluida: 'Concluída',
};

let tarefas = [];
let viewMode = 'cards';
let tarefaSelecionadaId = null;
let modalMode = 'create';

function normalizarStatus(tarefa) {
    const bruto = String(tarefa?.status || '').toLowerCase();

    if (bruto.includes('and')) return 'andamento';
    if (bruto.includes('concl')) return 'concluida';
    if (tarefa?.concluida) return 'concluida';

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

function criarCardHtml(tarefa) {
    const status = normalizarStatus(tarefa);
    const descricao = tarefa.descricao || '';
    return `
        <div class="tarefa-card ${status}">
            <div class="tarefa-card-title"><b>#${tarefa.id}</b> ${tarefa.titulo}</div>
            ${descricao ? `<div class="tarefa-card-desc">${descricao}</div>` : ''}
            <div>${criarBadgeStatus(status)}</div>
        </div>
    `;
}

function criarKanbanItem(tarefa) {
    const status = normalizarStatus(tarefa);
    const item = document.createElement('div');
    item.className = `kanban-card ${status}`;
    item.draggable = true;
    item.dataset.id = tarefa.id;

    item.innerHTML = `
        <div class="tarefa-card-title"><b>#${tarefa.id}</b> ${tarefa.titulo}</div>
        ${tarefa.descricao ? `<div class="tarefa-card-desc">${tarefa.descricao}</div>` : ''}
        <div>${criarBadgeStatus(status)}</div>
    `;

    item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', String(tarefa.id));
    });

    item.addEventListener('click', () => {
        verTarefa(tarefa.id);
    });

    return item;
}

function renderCards() {
    listaCards.innerHTML = '';

    if (!tarefas.length) {
        listaCards.innerHTML = '<div class="empty-state"><p>Nenhuma tarefa encontrada.</p></div>';
        return;
    }

    tarefas.forEach((tarefa) => {
        const card = document.createElement('div');
        card.innerHTML = criarCardHtml(tarefa);
        const item = card.firstElementChild;
        item.addEventListener('click', () => {
            verTarefa(tarefa.id);
        });
        listaCards.appendChild(item);
    });
}

function renderTabela() {
    listaTabela.innerHTML = '';

    if (!tarefas.length) {
        listaTabela.innerHTML = '<tr><td colspan="5">Nenhuma tarefa encontrada.</td></tr>';
        return;
    }

    tarefas.forEach((tarefa) => {
        const status = normalizarStatus(tarefa);
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${tarefa.id}</td>
            <td>${tarefa.titulo}</td>
            <td>${tarefa.descricao || '-'}</td>
            <td>${criarBadgeStatus(status)}</td>
            <td class="table-actions">
                <button type="button" class="small" onclick="verTarefa(${tarefa.id})">Ver</button>
                <button type="button" class="small" onclick="editarTarefa(${tarefa.id})">Editar</button>
                <button type="button" class="small danger" onclick="excluirTarefa(${tarefa.id})">Excluir</button>
            </td>
        `;
        listaTabela.appendChild(linha);
    });
}

function renderKanban() {
    colunaNovo.innerHTML = '';
    colunaAndamento.innerHTML = '';
    colunaConcluida.innerHTML = '';

    tarefas.forEach((tarefa) => {
        const status = normalizarStatus(tarefa);
        const card = criarKanbanItem(tarefa);

        if (status === 'andamento') {
            colunaAndamento.appendChild(card);
        } else if (status === 'concluida') {
            colunaConcluida.appendChild(card);
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

async function carregarTarefas() {
    try {
        const resposta = await apiRequest('/tarefas');

        if (Array.isArray(resposta)) {
            tarefas = resposta;
        } else if (Array.isArray(resposta?.tarefas)) {
            tarefas = resposta.tarefas;
        } else if (Array.isArray(resposta?.data)) {
            tarefas = resposta.data;
        } else {
            tarefas = [];
        }

        renderTudo();
    } catch (erro) {
        mostrarResultado(`Erro ao carregar tarefas: ${erro.message}`, 'error');
    }
}

async function atualizarStatusApi(tarefa, novoStatus) {
    const payload = {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        status: novoStatus,
        concluida: novoStatus === 'concluida',
    };

    await apiRequest(`/tarefas/${tarefa.id}`, {
        method: 'PUT',
        body: payload,
    });
}

async function  moverTarefa(id, novoStatus) {
    const tarefa = tarefas.find((item) => String(item.id) === String(id));
    if (!tarefa) return;

    try {
        await atualizarStatusApi(tarefa, novoStatus);

        tarefa.status = novoStatus;
        tarefa.concluida = novoStatus === 'concluida';

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
        await moverTarefa(id, statusDestino);
    });
}

function getTarefaById(id) {
    return tarefas.find((item) => String(item.id) === String(id));
}

function setCamposSomenteLeitura(somenteLeitura) {
    inputTitulo.readOnly = somenteLeitura;
    inputDescricao.readOnly = somenteLeitura;
    inputStatus.disabled = somenteLeitura;
}

function preencherModal(tarefa) {
    inputId.value = tarefa?.id || '';
    inputTitulo.value = tarefa?.titulo || '';
    inputDescricao.value = tarefa?.descricao || '';
    inputStatus.value = normalizarStatus(tarefa || {});
}

function aplicarModoModal() {
    const isCreate = modalMode === 'create';
    const isView = modalMode === 'view';

    setCamposSomenteLeitura(isView);

    btnModalSalvar.classList.toggle('is-hidden', isView);
    btnModalEditar.classList.toggle('is-hidden', !isView);
    btnModalExcluir.classList.toggle('is-hidden', isCreate);

    if (isCreate) {
        modalTitle.textContent = 'Nova tarefa';
        btnModalSalvar.textContent = 'Salvar';
    } else if (isView) {
        modalTitle.textContent = 'Detalhes da tarefa';
    } else {
        modalTitle.textContent = 'Editar tarefa';
        btnModalSalvar.textContent = 'Salvar alterações';
    }
}

function abrirNovaTarefa() {
    tarefaSelecionadaId = null;
    modalMode = 'create';
    preencherModal({ id: '', titulo: '', descricao: '', status: 'novo' });
    aplicarModoModal();
}

function verTarefa(id) {
    const tarefa = getTarefaById(id);
    if (!tarefa) return;

    tarefaSelecionadaId = tarefa.id;
    modalMode = 'view';
    preencherModal(tarefa);
    aplicarModoModal();
    tarefaModal?.show();
}

function editarTarefa(id = null) {
    const tarefa = getTarefaById(id || tarefaSelecionadaId);
    if (!tarefa) return;

    tarefaSelecionadaId = tarefa.id;
    modalMode = 'edit';
    preencherModal(tarefa);
    aplicarModoModal();
    tarefaModal?.show();
}

async function excluirTarefa(id = null) {
    const tarefa = getTarefaById(id || tarefaSelecionadaId);
    if (!tarefa) return;

    const confirmar = window.Swal
        ? await Swal.fire({
            icon: 'warning',
            text: `Excluir a tarefa "${tarefa.titulo}"?`,
            showCancelButton: true,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
        })
        : { isConfirmed: confirm('Excluir esta tarefa?') };

    if (!confirmar.isConfirmed) return;

    try {
        await apiRequest(`/tarefas/${tarefa.id}`, { method: 'DELETE' });
        tarefas = tarefas.filter((item) => String(item.id) !== String(tarefa.id));
        tarefaModal?.hide();
        renderTudo();
        mostrarResultado('Tarefa excluída com sucesso.');
    } catch (erro) {
        mostrarResultado(`Erro ao excluir tarefa: ${erro.message}`, 'error');
    }
}

async function criarTarefa(event) {
    event.preventDefault();

    const id = inputId.value;
    const titulo = inputTitulo.value.trim();
    const descricao = inputDescricao.value.trim();
    const status = inputStatus.value;

    if (!titulo) return;

    try {
        if (modalMode === 'edit' && id) {
            const payload = { titulo, descricao, status, concluida: status === 'concluida' };
            const resposta = await apiRequest(`/tarefas/${id}`, {
                method: 'PUT',
                body: payload,
            });

            const index = tarefas.findIndex((item) => String(item.id) === String(id));
            if (index >= 0) {
                tarefas[index] = {
                    ...tarefas[index],
                    ...payload,
                    ...(typeof resposta === 'object' ? resposta : {}),
                };
            }

            mostrarResultado('Tarefa atualizada com sucesso.');
        } else {
            const nova = await apiRequest('/tarefas', {
                method: 'POST',
                body: { titulo, descricao, status, concluida: status === 'concluida' },
            });

            if (nova && nova.id) {
                tarefas.push({ ...nova, descricao, status, concluida: status === 'concluida' });
            } else {
                await carregarTarefas();
            }

            mostrarResultado('Tarefa criada com sucesso.');
        }

        renderTudo();
        if (tarefaModal) tarefaModal.hide();
        formTarefa.reset();
        inputStatus.value = 'novo';
        modalMode = 'create';
        tarefaSelecionadaId = null;
    } catch (erro) {
        mostrarResultado(`Erro ao salvar tarefa: ${erro.message}`, 'error');
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

formTarefa.addEventListener('submit', criarTarefa);

btnNovaTarefa.addEventListener('click', abrirNovaTarefa);
btnModalEditar.addEventListener('click', () => editarTarefa());
btnModalExcluir.addEventListener('click', () => excluirTarefa());

window.verTarefa = verTarefa;
window.editarTarefa = editarTarefa;
window.excluirTarefa = excluirTarefa;

configurarDrop(colunaNovo, 'novo');
configurarDrop(colunaAndamento, 'andamento');
configurarDrop(colunaConcluida, 'concluida');

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    await carregarTarefas();
});
