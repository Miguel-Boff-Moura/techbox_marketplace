// =========================================================
// Área "Minha conta"
// menu lateral + funções de cada página (perfil, segurança,
// privacidade, TechBox+, cartões, endereços e compras)
// =========================================================

const usuarioConta = lerUsuario();

// precisa estar logado para ver essas páginas
if (!usuarioConta) {
    location.href = 'login.html?voltar=' + location.pathname.split('/').pop();
}

const secao = document.body.dataset.secao;

// ---------- menu lateral ----------
function montarMenuConta() {
    const menu = document.querySelector('#menu-conta');
    if (!menu) return;

    const itens = [
        ['compras', 'Compras', 'compras.html', 'conta-bag', 'conta-bag-azul'],
        ['perguntas', 'Perguntas', '#', 'conta-msg'],
        ['opinioes', 'Opiniões', '#', 'conta-star'],
        ['favoritos', 'Favoritos', '#', 'conta-heart'],
        ['marcas', 'Marcas que sigo', '#', 'conta-tag'],
        ['buscas', 'Buscas salvas', '#', 'conta-search'],
        ['assinaturas', 'Assinaturas', 'techbox-plus.html', 'conta-crown'],
        ['faturamento', 'Faturamento', '#', 'conta-receipt'],
        ['perfil', 'Meu perfil', 'minha-conta.html', 'conta-user', 'conta-user-azul']
    ];

    // todas as páginas do perfil deixam "Meu perfil" marcado
    const ativo = secao === 'compras' ? 'compras' : 'perfil';

    let html = `
        <p class="menu-conta__titulo"><img src="../img/icones/menu.svg" alt="" width="18" height="18"> Minha conta</p>
        <hr class="divisor">`;

    itens.forEach(function (item) {
        const marcado = item[0] === ativo;
        const icone = marcado && item[4] ? item[4] : item[3];
        const emBreve = item[2] === '#' ? ' js-em-breve' : '';
        html += `
            <a href="${item[2]}" class="${marcado ? 'ativo' : ''}${emBreve}">
                <img src="../img/icones/${icone}.svg" alt="" width="18" height="18">
                ${item[1]}
            </a>`;
    });

    html += `
        <a href="#" class="menu-conta__sair js-sair">
            <img src="../img/icones/logout.svg" alt="" width="18" height="18">
            Sair da conta
        </a>`;

    menu.innerHTML = html;
}

montarMenuConta();

// ---------- sair da conta ----------
document.addEventListener('click', function (evento) {
    if (!evento.target.closest('.js-sair')) return;
    evento.preventDefault();

    confirmar({
        icone: 'logout.svg',
        titulo: 'Sair da sua conta?',
        texto: 'Você precisará entrar novamente para ver seus pedidos e favoritos.',
        botao: 'Sair'
    }, function () {
        sairDaConta();
        location.href = '../index.html';
    });
});

// avisos que podem ser fechados no "x"
document.querySelectorAll('.js-fechar-aviso').forEach(function (botao) {
    botao.addEventListener('click', function () {
        botao.closest('.aviso').remove();
    });
});

// nome e e-mail do usuário onde precisar
document.querySelectorAll('.js-nome-usuario').forEach(function (texto) {
    texto.textContent = usuarioConta ? usuarioConta.nome : '';
});
document.querySelectorAll('.js-email-usuario').forEach(function (texto) {
    texto.textContent = usuarioConta ? usuarioConta.email : '';
});

// ---------- modal com formulário (cartões e endereços) ----------
function abrirFormulario(opcoes, aoSalvar) {
    let modal = document.querySelector('#modal-formulario');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'modal-formulario';
        document.body.appendChild(modal);
    }

    let campos = '';
    opcoes.campos.forEach(function (campo) {
        campos += `
            <div class="campo">
                <label for="form-${campo.id}">${campo.rotulo}</label>
                <div class="entrada">
                    <input id="form-${campo.id}" type="text" value="${campo.valor || ''}" placeholder="${campo.placeholder || ''}" ${campo.maximo ? 'maxlength="' + campo.maximo + '"' : ''}>
                </div>
                <span class="mensagem-erro">Preencha este campo.</span>
            </div>`;
    });

    modal.innerHTML = `
        <form class="modal__caixa form-modal" novalidate>
            <h3>${opcoes.titulo}</h3>
            ${campos}
            <div class="dialogo__botoes">
                <button type="button" class="btn btn--secundario js-fechar">Cancelar</button>
                <button type="submit" class="btn btn--primario">${opcoes.botao}</button>
            </div>
        </form>`;

    modal.querySelector('form').addEventListener('submit', function (evento) {
        evento.preventDefault();
        const valores = {};
        let erro = false;

        opcoes.campos.forEach(function (campo) {
            const entrada = modal.querySelector('#form-' + campo.id);
            valores[campo.id] = entrada.value.trim();
            const invalido = campo.validar ? !campo.validar(valores[campo.id]) : valores[campo.id] === '';
            entrada.closest('.campo').classList.toggle('erro', invalido);
            if (invalido) erro = true;
        });

        if (erro) return;
        fecharModal(modal);
        aoSalvar(valores);
    });

    abrirModal(modal);
    modal.querySelector('input').focus();
}

// =========================================================
// PERFIL
// =========================================================
if (secao === 'perfil') {
    const partes = usuarioConta.nome.split(' ');
    const dadosPerfil = lerDados('techbox_perfil', {
        nascimento: '05/02/1992',
        telefone: '(11) 91234-5678',
        foto: ''
    });

    function preencherPerfil() {
        document.querySelector('#perfil-nome').value = partes[0];
        document.querySelector('#perfil-sobrenome').value = partes.slice(1).join(' ');
        document.querySelector('#perfil-email').value = usuarioConta.email;
        document.querySelector('#perfil-nascimento').value = dadosPerfil.nascimento;
        document.querySelector('#perfil-telefone').value = dadosPerfil.telefone;

        // CPF escondido no meio
        const cpf = (usuarioConta.cpf || '123.456.789-00').replace(/\D/g, '');
        document.querySelector('#perfil-cpf').value = '•••.' + cpf.slice(3, 6) + '.' + cpf.slice(6, 9) + '-••';
    }

    preencherPerfil();

    // trocar foto (só mostra na tela)
    const campoFoto = document.querySelector('#campo-foto');
    document.querySelectorAll('.js-alterar-foto, .js-alterar-foto-mobile').forEach(function (botao) {
        botao.addEventListener('click', function () {
            campoFoto.click();
        });
    });

    campoFoto.addEventListener('change', function () {
        const arquivo = campoFoto.files[0];
        if (!arquivo) return;
        if (arquivo.size > 5 * 1024 * 1024) {
            mostrarToast('Arquivo muito grande', 'Escolha uma imagem de até 5 MB.', 'aviso');
            return;
        }
        const leitor = new FileReader();
        leitor.onload = function () {
            document.querySelectorAll('#foto-perfil, .js-foto').forEach(function (foto) {
                foto.src = leitor.result;
            });
            mostrarToast('Foto atualizada', 'Clique em salvar para guardar as alterações.');
        };
        leitor.readAsDataURL(arquivo);
    });

    document.querySelector('#enviar-validacao').addEventListener('click', function () {
        mostrarToast('E-mail enviado', 'Confira sua caixa de entrada em ' + usuarioConta.email);
    });

    document.querySelector('#cancelar-perfil').addEventListener('click', function () {
        preencherPerfil();
        mostrarToast('Alterações descartadas', '');
    });

    document.querySelector('#form-perfil').addEventListener('submit', function (evento) {
        evento.preventDefault();
        const nome = document.querySelector('#perfil-nome').value.trim();
        const sobrenome = document.querySelector('#perfil-sobrenome').value.trim();
        const email = document.querySelector('#perfil-email').value.trim();
        const nascimento = document.querySelector('#perfil-nascimento').value.trim();
        let erro = false;

        [['perfil-nome', nome === ''], ['perfil-sobrenome', sobrenome === ''],
            ['perfil-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)],
            ['perfil-nascimento', !/^\d{2}\/\d{2}\/\d{4}$/.test(nascimento)]].forEach(function (teste) {
            document.querySelector('#' + teste[0]).closest('.campo').classList.toggle('erro', teste[1]);
            if (teste[1]) erro = true;
        });

        if (erro) {
            mostrarToast('Confira os dados', 'Alguns campos estão errados.', 'aviso');
            return;
        }

        usuarioConta.nome = nome + ' ' + sobrenome;
        usuarioConta.email = email;
        salvarUsuario(usuarioConta);

        dadosPerfil.nascimento = nascimento;
        dadosPerfil.telefone = document.querySelector('#perfil-telefone').value.trim();
        salvarDados('techbox_perfil', dadosPerfil);

        mostrarToast('Perfil atualizado', 'Suas informações foram salvas.');
    });
}

// =========================================================
// SEGURANÇA
// =========================================================
if (secao === 'seguranca') {
    const estado = lerDados('techbox_seguranca', { emailValidado: false, duasEtapas: false, alertas: true });

    function mostrarSeguranca() {
        const pendentes = (estado.emailValidado ? 0 : 1) + (estado.duasEtapas ? 0 : 1);
        const aviso = document.querySelector('#aviso-seguranca');
        if (aviso) {
            aviso.querySelector('p').textContent = pendentes === 0
                ? 'Tudo certo! Sua conta está protegida.'
                : 'Você tem ' + pendentes + (pendentes === 1 ? ' configuração' : ' configurações') + ' de segurança pendentes.';
        }

        const seloEmail = document.querySelector('#selo-email');
        seloEmail.textContent = estado.emailValidado ? 'Verificado' : 'Pendente';
        seloEmail.className = 'selo ' + (estado.emailValidado ? 'selo--verde' : 'selo--laranja');
        document.querySelector('#btn-validar').textContent = estado.emailValidado ? 'Validado' : 'Validar';
        document.querySelector('#btn-validar').disabled = estado.emailValidado;

        const selo2fa = document.querySelector('#selo-2fa');
        selo2fa.textContent = estado.duasEtapas ? 'Ativada' : 'Pendente';
        selo2fa.className = 'selo ' + (estado.duasEtapas ? 'selo--verde' : 'selo--laranja');
        document.querySelector('#btn-2fa').textContent = estado.duasEtapas ? 'Desativar' : 'Ativar';

        document.querySelector('#alertas-login').checked = estado.alertas;
        salvarDados('techbox_seguranca', estado);
    }

    document.querySelector('#btn-senha').addEventListener('click', function () {
        mostrarToast('Link enviado', 'Enviamos um link para trocar a senha no seu e-mail.');
    });

    document.querySelector('#btn-validar').addEventListener('click', function () {
        estado.emailValidado = true;
        mostrarSeguranca();
        mostrarToast('E-mail validado', 'Obrigado por confirmar seu e-mail.');
    });

    document.querySelector('#btn-2fa').addEventListener('click', function () {
        estado.duasEtapas = !estado.duasEtapas;
        mostrarSeguranca();
        mostrarToast(estado.duasEtapas ? 'Verificação ativada' : 'Verificação desativada', '');
    });

    document.querySelector('#btn-dispositivos').addEventListener('click', function () {
        mostrarToast('2 dispositivos conectados', 'Este navegador e um iPhone 17 Pro.');
    });

    document.querySelector('#alertas-login').addEventListener('change', function () {
        estado.alertas = this.checked;
        mostrarSeguranca();
        mostrarToast(estado.alertas ? 'Alertas ligados' : 'Alertas desligados', '');
    });

    mostrarSeguranca();
}

// =========================================================
// PRIVACIDADE
// =========================================================
if (secao === 'privacidade') {
    const preferencias = lerDados('techbox_privacidade', { ofertas: true, parceiros: false, historico: true });

    document.querySelectorAll('[data-preferencia]').forEach(function (chave) {
        const nome = chave.dataset.preferencia;
        chave.checked = preferencias[nome];
        chave.addEventListener('change', function () {
            preferencias[nome] = chave.checked;
            salvarDados('techbox_privacidade', preferencias);
            mostrarToast('Preferência salva', '');
        });
    });

    document.querySelector('#solicitar-copia').addEventListener('click', function () {
        mostrarToast('Pedido recebido', 'Você vai receber seus dados por e-mail em até 48 horas.');
    });

    document.querySelector('#excluir-conta').addEventListener('click', function () {
        confirmar({
            icone: 'alerta.svg',
            titulo: 'Excluir sua conta?',
            texto: 'Essa ação é permanente: pedidos, cartões e dados salvos serão apagados e não poderão ser recuperados.',
            botao: 'Excluir',
            perigo: true
        }, function () {
            const contas = lerDados('techbox_contas', []).filter(function (c) {
                return c.email !== usuarioConta.email;
            });
            salvarDados('techbox_contas', contas);
            ['techbox_usuario', 'techbox_pedidos', 'techbox_cartoes', 'techbox_enderecos', 'techbox_endereco', 'techbox_perfil']
                .forEach(function (chave) {
                    localStorage.removeItem(chave);
                });
            location.href = '../index.html';
        });
    });
}

// =========================================================
// TECHBOX+
// =========================================================
if (secao === 'techbox-plus') {
    function mostrarPlano() {
        const atual = lerDados('techbox_plano', '');
        document.querySelectorAll('.plano').forEach(function (plano) {
            const assinado = plano.dataset.plano === atual;
            plano.classList.toggle('assinado', assinado);
            const botao = plano.querySelector('.btn');
            botao.textContent = assinado ? 'Seu plano atual' : botao.dataset.texto;
        });
    }

    document.querySelectorAll('.plano .btn').forEach(function (botao) {
        botao.dataset.texto = botao.textContent;
        botao.addEventListener('click', function () {
            const plano = botao.closest('.plano');
            if (plano.classList.contains('assinado')) {
                mostrarToast('Você já assina esse plano', '');
                return;
            }
            confirmar({
                icone: 'crown-azul.svg',
                titulo: 'Assinar o ' + plano.querySelector('h3').textContent + '?',
                texto: 'A cobrança de ' + plano.dataset.preco + ' por mês será feita no seu cartão principal.',
                botao: 'Assinar'
            }, function () {
                salvarDados('techbox_plano', plano.dataset.plano);
                mostrarPlano();
                mostrarToast('Assinatura confirmada!', 'Bem-vindo ao TechBox+.');
            });
        });
    });

    document.querySelector('#assine-ja').addEventListener('click', function () {
        document.querySelector('.planos').scrollIntoView({ behavior: 'smooth' });
    });

    mostrarPlano();
}

// =========================================================
// CARTÕES
// =========================================================
if (secao === 'cartoes') {
    let cartoes = lerDados('techbox_cartoes', [
        { bandeira: 'Visa', final: '4417', nome: 'Neymar Santos', validade: '08/2028', principal: true },
        { bandeira: 'Mastercard', final: '9021', nome: 'Neymar Santos', validade: '11/2027', principal: false }
    ]);

    function mostrarCartoes() {
        salvarDados('techbox_cartoes', cartoes);
        let html = '';
        cartoes.forEach(function (cartao, indice) {
            html += `
                <div class="item-config" data-indice="${indice}">
                    <span class="miniatura-cartao"><img src="../img/icones/card-azul-22.svg" alt="" width="22" height="22"></span>
                    <div class="item-config__texto">
                        <div class="item-config__titulo">
                            <strong>${cartao.bandeira} final ${cartao.final}</strong>
                            ${cartao.principal ? '<span class="selo selo--azul">Principal</span>' : ''}
                        </div>
                        <p>${cartao.nome} • Vence em ${cartao.validade}</p>
                    </div>
                    <div class="botoes-linha">
                        ${cartao.principal ? '' : '<button type="button" class="btn btn--secundario btn--pequeno js-principal">Tornar principal</button>'}
                        <button type="button" class="btn-icone js-remover" aria-label="Remover cartão"><img src="../img/icones/trash-escuro.svg" alt="" width="16" height="16"></button>
                    </div>
                </div>`;
        });
        if (cartoes.length === 0) {
            html = '<p class="item-config">Nenhum cartão salvo ainda.</p>';
        }
        document.querySelector('#lista-cartoes').innerHTML = html;
    }

    document.querySelector('#lista-cartoes').addEventListener('click', function (evento) {
        const linha = evento.target.closest('[data-indice]');
        if (!linha) return;
        const indice = Number(linha.dataset.indice);

        if (evento.target.closest('.js-principal')) {
            cartoes.forEach(function (c, i) { c.principal = i === indice; });
            mostrarCartoes();
            mostrarToast('Cartão principal alterado', '');
        }

        if (evento.target.closest('.js-remover')) {
            confirmar({
                icone: 'trash-vermelho.svg',
                titulo: 'Remover cartão?',
                texto: 'O cartão final ' + cartoes[indice].final + ' será removido da sua conta.',
                botao: 'Remover',
                perigo: true
            }, function () {
                const eraPrincipal = cartoes[indice].principal;
                cartoes.splice(indice, 1);
                if (eraPrincipal && cartoes[0]) cartoes[0].principal = true;
                mostrarCartoes();
                mostrarToast('Cartão removido', '');
            });
        }
    });

    document.querySelector('#adicionar-cartao').addEventListener('click', function () {
        if (cartoes.length >= 5) {
            mostrarToast('Limite atingido', 'Você pode ter até 5 cartões salvos.', 'aviso');
            return;
        }
        abrirFormulario({
            titulo: 'Adicionar cartão',
            botao: 'Salvar cartão',
            campos: [
                { id: 'numero', rotulo: 'Número do cartão', placeholder: '0000 0000 0000 0000', maximo: 19, validar: function (v) { return v.replace(/\D/g, '').length === 16; } },
                { id: 'nome', rotulo: 'Nome impresso', valor: usuarioConta.nome },
                { id: 'validade', rotulo: 'Validade (MM/AAAA)', placeholder: '08/2030', maximo: 7, validar: function (v) { return /^\d{2}\/\d{4}$/.test(v); } }
            ]
        }, function (valores) {
            const numero = valores.numero.replace(/\D/g, '');
            const bandeira = numero[0] === '4' ? 'Visa' : numero[0] === '5' ? 'Mastercard' : 'Elo';
            cartoes.push({ bandeira: bandeira, final: numero.slice(-4), nome: valores.nome, validade: valores.validade, principal: cartoes.length === 0 });
            mostrarCartoes();
            mostrarToast('Cartão adicionado', bandeira + ' final ' + numero.slice(-4));
        });
    });

    mostrarCartoes();
}

// =========================================================
// ENDEREÇOS
// =========================================================
if (secao === 'enderecos') {
    let enderecos = lerDados('techbox_enderecos', [
        { apelido: 'Casa', rua: 'Av. Paulista, 1000 – apto 52', bairro: 'Bela Vista, São Paulo – SP', cep: '01310-100', principal: true },
        { apelido: 'Trabalho', rua: 'Rua Augusta, 500 – sala 3', bairro: 'Consolação, São Paulo – SP', cep: '01305-000', principal: false }
    ]);

    function mostrarEnderecos() {
        salvarDados('techbox_enderecos', enderecos);
        let html = '';
        enderecos.forEach(function (endereco, indice) {
            html += `
                <article class="endereco-card" data-indice="${indice}">
                    <div class="endereco-card__topo">
                        <span class="icone-caixa"><img src="../img/icones/pin-azul.svg" alt="" width="20" height="20"></span>
                        <strong>${endereco.apelido}</strong>
                        ${endereco.principal ? '<span class="selo selo--azul">Principal</span>' : ''}
                    </div>
                    <p>${endereco.rua}<br>${endereco.bairro}<br>CEP ${endereco.cep}</p>
                    <div class="botoes-linha">
                        <button type="button" class="btn btn--secundario js-editar"><img src="../img/icones/pencil.svg" alt="" width="15" height="15"> Editar</button>
                        <button type="button" class="btn btn--secundario js-remover"><img src="../img/icones/trash-escuro.svg" alt="" width="15" height="15"> Remover</button>
                    </div>
                </article>`;
        });
        document.querySelector('#lista-enderecos').innerHTML = html;
    }

    function formularioEndereco(endereco, aoSalvar) {
        abrirFormulario({
            titulo: endereco ? 'Editar endereço' : 'Novo endereço',
            botao: 'Salvar endereço',
            campos: [
                { id: 'apelido', rotulo: 'Nome (ex: Casa, Trabalho)', valor: endereco ? endereco.apelido : '' },
                { id: 'rua', rotulo: 'Rua, número e complemento', valor: endereco ? endereco.rua : '' },
                { id: 'bairro', rotulo: 'Bairro, cidade e estado', valor: endereco ? endereco.bairro : '' },
                { id: 'cep', rotulo: 'CEP', valor: endereco ? endereco.cep : '', placeholder: '00000-000', maximo: 9, validar: function (v) { return v.replace(/\D/g, '').length === 8; } }
            ]
        }, aoSalvar);
    }

    document.querySelector('#lista-enderecos').addEventListener('click', function (evento) {
        const card = evento.target.closest('[data-indice]');
        if (!card) return;
        const indice = Number(card.dataset.indice);

        if (evento.target.closest('.js-editar')) {
            formularioEndereco(enderecos[indice], function (valores) {
                Object.assign(enderecos[indice], valores);
                mostrarEnderecos();
                mostrarToast('Endereço atualizado', '');
            });
        }

        if (evento.target.closest('.js-remover')) {
            confirmar({
                icone: 'trash-vermelho.svg',
                titulo: 'Remover endereço?',
                texto: 'O endereço "' + enderecos[indice].apelido + '" será apagado da sua conta.',
                botao: 'Remover',
                perigo: true
            }, function () {
                const eraPrincipal = enderecos[indice].principal;
                enderecos.splice(indice, 1);
                if (eraPrincipal && enderecos[0]) enderecos[0].principal = true;
                mostrarEnderecos();
                mostrarToast('Endereço removido', '');
            });
        }
    });

    document.querySelectorAll('.js-novo-endereco').forEach(function (botao) {
        botao.addEventListener('click', function () {
            if (enderecos.length >= 5) {
                mostrarToast('Limite atingido', 'Você pode ter até 5 endereços salvos.', 'aviso');
                return;
            }
            formularioEndereco(null, function (valores) {
                valores.principal = enderecos.length === 0;
                enderecos.push(valores);
                mostrarEnderecos();
                mostrarToast('Endereço adicionado', '');
            });
        });
    });

    mostrarEnderecos();
}

// =========================================================
// COMPRAS
// =========================================================
if (secao === 'compras') {
    const MESES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let filtroStatus = 'todos';

    const situacoes = {
        preparando: ['Em preparação', 'selo--laranja', 'andamento'],
        transporte: ['Em transporte', 'selo--azul', 'andamento'],
        entregue: ['Entregue', 'selo--verde', 'entregues'],
        cancelado: ['Cancelado', 'selo--vermelho', 'cancelados']
    };

    function cardPedido(pedido) {
        const item = pedido.itens[0];
        const produto = buscarProduto(item.id);
        const situacao = situacoes[pedido.status] || situacoes.preparando;
        const data = new Date(pedido.data);
        const qtdTotal = pedido.itens.reduce(function (soma, i) { return soma + i.qtd; }, 0);

        let linhaSituacao = '';
        let botao = `<a class="btn btn--primario" href="rastreamento.html?pedido=${pedido.numero}">Ver detalhes</a>`;

        if (pedido.status === 'entregue') {
            linhaSituacao = `<p class="pedido-card__situacao verde"><img src="../img/icones/check-verde-15.svg" alt="" width="15" height="15"> Entregue em ${pedido.dataEntrega}</p>`;
        } else if (pedido.status === 'cancelado') {
            linhaSituacao = `<p class="pedido-card__situacao cinza">Reembolso concluído em ${pedido.dataReembolso}</p>`;
        } else {
            const previsao = pedido.previsao || dataCurta(new Date(data.getTime() + 5 * 86400000)).slice(0, -5);
            linhaSituacao = `<p class="pedido-card__situacao azul"><img class="so-desktop" src="../img/icones/truck-azul.svg" alt="" width="15" height="15"> Previsão de entrega em ${previsao}</p>`;
            botao = `<a class="btn btn--primario" href="rastreamento.html?pedido=${pedido.numero}"><img class="so-desktop" src="../img/icones/truck-branco.svg" alt="" width="15" height="15"> Acompanhar pedido</a>`;
        }

        const end = pedido.endereco;
        const enderecoTexto = end ? end.rua + ', ' + end.numero + (end.complemento ? ' – ' + end.complemento : '') + ' • ' + end.bairro + ', ' + end.cidade.replace(' / ', ' – ') : '';

        return `
            <article class="pedido-card">
                <div class="pedido-card__topo">
                    <div class="pedido-card__dados">
                        <div><span>Pedido</span><strong>#${pedido.numero}</strong></div>
                        <div><span>Realizado em</span><strong>${dataCurta(data)}</strong></div>
                        <div><span>Total</span><strong>${dinheiro(pedido.total)}</strong></div>
                    </div>
                    <span class="selo ${situacao[1]}">${situacao[0]}</span>
                </div>
                <div class="pedido-card__produto">
                    <img class="pedido-card__imagem" src="../img/${item.imagem || produto.imagem}" alt="${produto.nome}">
                    <div class="pedido-card__info">
                        <h3>${produto.nome.replace(' 14" M5', '')}${pedido.itens.length > 1 ? ' e mais ' + (pedido.itens.length - 1) : ''}</h3>
                        <p>${item.detalhes || item.cor + ' • 12 GB • 512 GB'}</p>
                        <div class="pedido-card__qtd"><span>Qtd. ${qtdTotal}</span><strong>${dinheiro(pedido.total)}</strong></div>
                        ${linhaSituacao}
                    </div>
                    <div class="pedido-card__acoes">${botao}</div>
                </div>
                <div class="pedido-card__rodape">
                    <span><img src="../img/icones/pin-cinza.svg" alt="" width="15" height="15"> ${enderecoTexto}</span>
                    <span><img src="../img/icones/card-cinza-15.svg" alt="" width="15" height="15"> ${pedido.pagamento}</span>
                </div>
            </article>`;
    }

    function mostrarCompras() {
        const termo = document.querySelector('#busca-compras').value.trim().toLowerCase();
        const periodo = document.querySelector('#periodo-compras').value;
        const limite = new Date();
        limite.setMonth(limite.getMonth() - 6);

        const lista = todosPedidos().filter(function (pedido) {
            const situacao = situacoes[pedido.status] || situacoes.preparando;
            if (filtroStatus !== 'todos' && situacao[2] !== filtroStatus) return false;

            const data = new Date(pedido.data);
            if (periodo === '6meses' && data < limite) return false;
            if (periodo === '2026' && data.getFullYear() !== 2026) return false;

            if (termo) {
                const nomes = pedido.itens.map(function (i) { return buscarProduto(i.id).nome; }).join(' ');
                if (!(nomes + ' ' + pedido.numero).toLowerCase().includes(termo)) return false;
            }
            return true;
        });

        // agrupa por mês
        let html = '';
        let mesAtual = '';
        lista.forEach(function (pedido) {
            const data = new Date(pedido.data);
            const mes = MESES_NOME[data.getMonth()] + ' de ' + data.getFullYear();
            if (mes !== mesAtual) {
                if (mesAtual) html += '</section>';
                html += `<section class="grupo-mes"><h2>${mes}</h2>`;
                mesAtual = mes;
            }
            html += cardPedido(pedido);
        });
        if (mesAtual) html += '</section>';

        if (lista.length === 0) {
            html = '<p class="sem-compras">Nenhuma compra encontrada com esses filtros.</p>';
        }

        document.querySelector('#lista-compras').innerHTML = html;
    }

    document.querySelectorAll('.abas-status button').forEach(function (botao) {
        botao.addEventListener('click', function () {
            filtroStatus = botao.dataset.status;
            document.querySelectorAll('.abas-status button').forEach(function (b) {
                b.classList.toggle('ativo', b === botao);
            });
            mostrarCompras();
        });
    });

    document.querySelector('#busca-compras').addEventListener('input', mostrarCompras);
    document.querySelector('#periodo-compras').addEventListener('change', mostrarCompras);

    mostrarCompras();
}
