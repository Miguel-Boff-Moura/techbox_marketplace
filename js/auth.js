// =========================================================
// Login, cadastro e recuperação de senha
// As contas ficam salvas no localStorage (só para a demonstração)
// =========================================================

// para onde ir depois de entrar (ex: login.html?voltar=checkout.html)
const voltarPara = parametroUrl('voltar') || 'minha-conta.html';

// passa o "voltar" para os links de cadastro/login também
document.querySelectorAll('.js-link-cadastro, .js-link-login').forEach(function (link) {
    if (parametroUrl('voltar')) link.href += '?voltar=' + encodeURIComponent(voltarPara);
});

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function erroCampo(id, temErro) {
    document.querySelector('#' + id).closest('.campo').classList.toggle('erro', temErro);
    return temErro;
}

function lerContas() {
    return lerDados('techbox_contas', []);
}

// mostrar / esconder senha
document.querySelectorAll('.js-olho').forEach(function (botao) {
    botao.addEventListener('click', function () {
        const campo = botao.parentElement.querySelector('input');
        const mostrando = campo.type === 'text';
        campo.type = mostrando ? 'password' : 'text';
        botao.classList.toggle('ativo', !mostrando);
        botao.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Esconder senha');
    });
});

// tira o erro quando digita
document.querySelectorAll('.auth input').forEach(function (campo) {
    campo.addEventListener('input', function () {
        const bloco = campo.closest('.campo');
        if (bloco) bloco.classList.remove('erro');
    });
});

// ---------- LOGIN ----------
const formLogin = document.querySelector('#form-login');

if (formLogin) {
    formLogin.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const email = document.querySelector('#email').value.trim().toLowerCase();
        const senha = document.querySelector('#senha').value;
        let erros = 0;

        if (erroCampo('email', !emailValido(email))) erros++;
        document.querySelector('#erro-senha').textContent = 'A senha precisa ter pelo menos 6 caracteres.';
        if (erroCampo('senha', senha.length < 6)) erros++;
        if (erros > 0) return;

        const conta = lerContas().find(function (c) {
            return c.email === email;
        });

        if (conta && conta.senha !== senha) {
            document.querySelector('#erro-senha').textContent = 'Senha incorreta. Tente de novo.';
            erroCampo('senha', true);
            return;
        }

        // se a pessoa não tiver cadastro, entra com o nome tirado do e-mail
        let nome = 'Neymar Santos';
        if (conta) {
            nome = conta.nome;
        } else if (email !== 'neymar.santos@email.com') {
            nome = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, function (letra) {
                return letra.toUpperCase();
            });
        }

        salvarUsuario({ nome: nome, email: email, cpf: conta ? conta.cpf : '' });
        mostrarToast('Bem-vindo, ' + nome.split(' ')[0] + '!', 'Você entrou na sua conta.');

        setTimeout(function () {
            location.href = voltarPara;
        }, 900);
    });
}

// ---------- CADASTRO ----------
const formCadastro = document.querySelector('#form-cadastro');

if (formCadastro) {
    const campoCpf = document.querySelector('#cpf');
    campoCpf.addEventListener('input', function () {
        const n = campoCpf.value.replace(/\D/g, '').slice(0, 11);
        campoCpf.value = n.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });

    formCadastro.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const nome = document.querySelector('#nome').value.trim();
        const email = document.querySelector('#email').value.trim().toLowerCase();
        const cpf = campoCpf.value;
        const senha = document.querySelector('#senha').value;
        const confirmar = document.querySelector('#confirmar').value;
        const contas = lerContas();
        let erros = 0;

        if (erroCampo('nome', nome.split(' ').length < 2)) erros++;

        const jaExiste = contas.some(function (c) { return c.email === email; });
        document.querySelector('#erro-email').textContent = jaExiste ? 'Já existe uma conta com esse e-mail.' : 'Digite um e-mail válido.';
        if (erroCampo('email', !emailValido(email) || jaExiste)) erros++;

        if (erroCampo('cpf', cpf.replace(/\D/g, '').length !== 11)) erros++;
        if (erroCampo('senha', senha.length < 6)) erros++;
        if (erroCampo('confirmar', confirmar !== senha || confirmar === '')) erros++;
        if (erros > 0) return;

        contas.push({ nome: nome, email: email, cpf: cpf, senha: senha });
        salvarDados('techbox_contas', contas);
        salvarUsuario({ nome: nome, email: email, cpf: cpf });

        mostrarToast('Conta criada!', 'Que bom ter você com a gente, ' + nome.split(' ')[0] + '.');
        setTimeout(function () {
            location.href = voltarPara;
        }, 1000);
    });
}

// ---------- RECUPERAR SENHA ----------
const formRecuperar = document.querySelector('#form-recuperar');

if (formRecuperar) {
    formRecuperar.addEventListener('submit', function (evento) {
        evento.preventDefault();
        const email = document.querySelector('#email').value.trim();

        if (erroCampo('email', !emailValido(email))) return;

        document.querySelector('#email-enviado').textContent = email;
        formRecuperar.classList.add('escondido');
        document.querySelector('#sucesso-recuperar').classList.remove('escondido');
    });
}
