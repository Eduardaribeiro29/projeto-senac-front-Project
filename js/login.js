const formLogin = document.getElementById('form-login');

setupValidation(formLogin);

async function loginUsuario(event) {
    event.preventDefault();

    const payload = {
        email: document.getElementById('login-email').value.trim(),
        senha: document.getElementById('login-senha').value,
    };

    try {
        const dados = await apiRequest('/usuarios/login', { method: 'POST', body: payload, auth: false });
        setToken(dados.token || dados.accessToken || '');
        mostrarResultado('Login realizado com sucesso. Redirecionando...');
        setTimeout(() => {
            window.location.href = 'produtos.html';
        }, 600);
    } catch (erro) {
        mostrarResultado(`Falha no login: ${erro.message}`, 'error');
    }
}

if (formLogin) {
    formLogin.addEventListener('submit', loginUsuario);
}
