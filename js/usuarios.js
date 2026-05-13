const API_URL = 'http://localhost:3000/usuarios';

const formUsuario = document.getElementById('form-usuario');
const listaUsuarios = document.getElementById('lista-usuarios');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const inputId = document.getElementById('usuario-id');
const secaoTarefas = document.getElementById('secao-tarefas');
const listaTarefas = document.getElementById('lista-tarefas');
const nomeUsuarioTarefas = document.getElementById('nome-usuario-tarefas');
const btnVoltar = document.getElementById('btn-voltar');

// 1. Carregar Lista (GET)
async function carregarUsuarios() {
    const resposta = await fetch(API_URL);
    const usuarios = await resposta.json();
    listaUsuarios.innerHTML = '';

    usuarios.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.telefone}</td>
            <td>${user.dataNascimento}</td>
            <td>
                <button onclick="prepararEdicao(${JSON.stringify(user).replace(/"/g, '&quot;')})">Editar</button>
                <button onclick="verTarefas(${user.id}, '${user.nome}')">Ver Tarefas</button>
                <button onclick="deletarUsuario(${user.id})">Excluir</button>
            </td>
        `;
        listaUsuarios.appendChild(tr);
    });
}

// 2. Preparar Edição (Preencher o formulário)
function prepararEdicao(usuario) {
    inputId.value = usuario.id;
    document.getElementById('nome').value = usuario.nome;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
    document.getElementById('dataNascimento').value = usuario.dataNascimento;
    document.getElementById('senha').value = usuario.senha;

    btnSalvar.textContent = 'Atualizar Usuário';
    btnCancelar.style.display = 'inline';
}

// 2.5. Ver Tarefas do Usuário
async function verTarefas(id, nome) {
    try {
        const resposta = await fetch(`http://localhost:3000/tarefas/usuario/${id}`);
        const tarefas = await resposta.json();

        nomeUsuarioTarefas.textContent = nome;
        listaTarefas.innerHTML = '';

        if (tarefas.length === 0) {
            listaTarefas.innerHTML = '<li>Nenhuma tarefa encontrada.</li>';
        } else {
            tarefas.forEach(tarefa => {
                const li = document.createElement('li');
                li.textContent = `${tarefa.titulo} - ${tarefa.descricao} (Status: ${tarefa.status})`;
                listaTarefas.appendChild(li);
            });
        }

        // Esconder seção de usuários e mostrar seção de tarefas
        document.querySelector('section:nth-of-type(1)').style.display = 'none'; // Seção de cadastro
        document.querySelector('section:nth-of-type(2)').style.display = 'none'; // Seção de listagem
        secaoTarefas.style.display = 'block';
    } catch (erro) {
        console.error('Erro ao carregar tarefas:', erro);
        alert('Erro ao carregar tarefas.');
    }
}

// 3. Cancelar Edição
btnCancelar.addEventListener('click', () => {
    formUsuario.reset();
    inputId.value = '';
    btnSalvar.textContent = 'Salvar Usuário';
    btnCancelar.style.display = 'none';
});

// 3.5. Voltar à Lista de Usuários
btnVoltar.addEventListener('click', () => {
    secaoTarefas.style.display = 'none';
    document.querySelector('section:nth-of-type(1)').style.display = 'block'; // Seção de cadastro
    document.querySelector('section:nth-of-type(2)').style.display = 'block'; // Seção de listagem
});

// 4. Salvar ou Atualizar (POST ou PUT)
formUsuario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = inputId.value;
    const payload = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        senha: document.getElementById('senha').value
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            alert(id ? 'Atualizado!' : 'Cadastrado!');
            btnCancelar.click(); // Reseta o form e o estado
            carregarUsuarios();
        }
    } catch (erro) {
        console.error('Erro na operação:', erro);
    }
});

// 5. Excluir (DELETE)
async function deletarUsuario(id) {
    if (!confirm('Excluir este usuário?')) return;

    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    carregarUsuarios();
}

window.addEventListener('DOMContentLoaded', carregarUsuarios);
