const formCadastro = document.getElementById('form-cadastro');

setupValidation(formCadastro);

async function cadastrarUsuario(event) {
    event.preventDefault();

    const payload = {
        nome: document.getElementById('cadastro-nome').value.trim(),
        email: document.getElementById('cadastro-email').value.trim(),
        telefone: document.getElementById('cadastro-telefone').value.trim(),
        profissao: document.getElementById('cadastro-profissao').value.trim(),
        senha: document.getElementById('cadastro-senha').value,
    };

    try {
        const usuario = await apiRequest('/usuarios', { method: 'POST', body: payload, auth: false });
        mostrarResultado(`Cadastro realizado: ${usuario.nome}`);
        formCadastro.reset();
    } catch (erro) {
        mostrarResultado(`Falha no cadastro: ${erro.message}`, 'error');
    }
}

if (formCadastro) {
    formCadastro.addEventListener('submit', cadastrarUsuario);
}
