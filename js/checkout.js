// =========================================================
// Checkout - endereço, entrega, pagamento e resumo
// =========================================================

const usuario = lerUsuario();
const itens = itensSelecionados();

// sem login ou sem itens não dá para finalizar
if (!usuario) {
    location.href = 'login.html?voltar=checkout.html';
} else if (itens.length === 0) {
    location.href = 'carrinho.html';
}

const FRETE_AGENDADO = 24.9;
const form = document.querySelector('#form-checkout');

// ---------- data de amanhã ----------
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const amanha = new Date();
amanha.setDate(amanha.getDate() + 1);
const textoAmanha = String(amanha.getDate()).padStart(2, '0') + ' de ' + MESES_LONGOS[amanha.getMonth()];
document.querySelectorAll('.js-data-amanha').forEach(function (texto) {
    texto.textContent = textoAmanha;
});

// a entrega agendada só pode ser a partir de depois de amanhã
const dataMinima = new Date();
dataMinima.setDate(dataMinima.getDate() + 2);
document.querySelector('#data-entrega').min = dataMinima.toISOString().slice(0, 10);

// ---------- preenche o endereço salvo ----------
const enderecoPadrao = {
    nome: usuario ? usuario.nome : '',
    cpf: usuario && usuario.cpf ? usuario.cpf : '123.456.789-00',
    cep: lerDados('techbox_cep', '01310-100'),
    rua: 'Avenida Paulista',
    numero: '1578',
    complemento: 'Apto 84',
    bairro: 'Bela Vista',
    cidade: 'São Paulo / SP'
};
const endereco = lerDados('techbox_endereco', enderecoPadrao);

Object.keys(endereco).forEach(function (campo) {
    const entrada = document.querySelector('#' + campo);
    if (entrada) entrada.value = endereco[campo];
});

document.querySelector('#nome-cartao').value = usuario ? usuario.nome : '';

function mostrarResumoEndereco() {
    document.querySelector('#resumo-nome').textContent = document.querySelector('#nome').value;
    const complemento = document.querySelector('#complemento').value;
    document.querySelector('#resumo-linha1').textContent = document.querySelector('#rua').value + ', ' +
        document.querySelector('#numero').value + (complemento ? ' • ' + complemento : '');
    document.querySelector('#resumo-linha2').textContent = document.querySelector('#bairro').value + ', ' +
        document.querySelector('#cidade').value + ' • ' + document.querySelector('#cep').value;
}

mostrarResumoEndereco();

// no mobile o formulário de endereço fica escondido até clicar em "Alterar"
document.querySelector('#alterar-endereco').addEventListener('click', function () {
    const campos = document.querySelector('#campos-endereco');
    campos.classList.toggle('aberto');
    this.textContent = campos.classList.contains('aberto') ? 'Pronto' : 'Alterar';
    mostrarResumoEndereco();
});

// ---------- máscaras simples ----------
function soNumeros(texto) {
    return texto.replace(/\D/g, '');
}

function mascara(campo, funcao) {
    campo.addEventListener('input', function () {
        campo.value = funcao(soNumeros(campo.value));
    });
}

mascara(document.querySelector('#cpf'), function (n) {
    n = n.slice(0, 11);
    return n.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
});

mascara(document.querySelector('#cep'), function (n) {
    n = n.slice(0, 8);
    return n.length > 5 ? n.slice(0, 5) + '-' + n.slice(5) : n;
});

mascara(document.querySelector('#numero-cartao'), function (n) {
    return n.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
});

mascara(document.querySelector('#validade'), function (n) {
    n = n.slice(0, 4);
    return n.length > 2 ? n.slice(0, 2) + '/' + n.slice(2) : n;
});

mascara(document.querySelector('#cvv'), function (n) {
    return n.slice(0, 3);
});

// ---------- resumo e valores ----------
function opcaoEntrega() {
    return form.querySelector('input[name="entrega"]:checked').value;
}

function formaPagamento() {
    return form.querySelector('input[name="pagamento"]:checked').value;
}

function totalPedido() {
    const valores = calcularTotais(itens);
    const frete = opcaoEntrega() === 'agendada' ? FRETE_AGENDADO : 0;
    return { valores: valores, frete: frete, total: valores.total + frete };
}

function mostrarItens() {
    let html = '';
    itens.forEach(function (item) {
        const produto = buscarProduto(item.id);
        html += `
            <div class="item-pedido">
                <div class="item-pedido__imagem"><img src="../img/${produto.imagem}" alt="${produto.nome}"></div>
                <div class="item-pedido__info">
                    <strong>${produto.nome}</strong>
                    <span>${item.cor} • 12 GB • 512 GB</span>
                    <span>Qtd. ${item.qtd}</span>
                </div>
                <strong class="item-pedido__preco">${dinheiro(produto.preco * item.qtd)}</strong>
            </div>`;
    });
    document.querySelector('#itens-pedido').innerHTML = html;
}

function montarParcelas(total) {
    const select = document.querySelector('#parcelas');
    const escolhida = select.value || '12';
    let opcoes = '';
    for (let i = 1; i <= 12; i++) {
        const texto = i === 1 ? 'À vista ' + dinheiroCentavos(total) : i + 'x de ' + dinheiroCentavos(total / i) + ' sem juros';
        opcoes += `<option value="${i}" ${String(i) === escolhida ? 'selected' : ''}>${texto}</option>`;
    }
    select.innerHTML = opcoes;
}

function atualizarResumo() {
    const conta = totalPedido();

    document.querySelector('#ck-subtotal').textContent = dinheiroCentavos(conta.valores.totalProdutos);

    const linhaCupom = document.querySelector('#ck-linha-cupom');
    linhaCupom.classList.toggle('escondido', conta.valores.descontoCupom <= 0);
    document.querySelector('#ck-cupom').textContent = '− ' + dinheiroCentavos(conta.valores.descontoCupom);

    const agendada = opcaoEntrega() === 'agendada';
    document.querySelector('#ck-nome-entrega').textContent = agendada ? 'Entrega agendada' : 'Entrega expressa';
    const valorEntrega = document.querySelector('#ck-entrega');
    valorEntrega.textContent = agendada ? dinheiroCentavos(FRETE_AGENDADO) : 'Grátis';
    valorEntrega.classList.toggle('verde', !agendada);

    document.querySelector('#ck-total').textContent = dinheiro(Math.round(conta.total * 100) / 100);
    document.querySelector('#barra-total').textContent = dinheiro(Math.round(conta.total));

    const pix = formaPagamento() === 'pix';
    document.querySelector('#ck-parcelas').textContent = pix ? '' : '12x de ' + dinheiro(Math.round(conta.total / 12));

    document.querySelector('#dados-cartao').classList.toggle('escondido', pix);
    document.querySelector('#aviso-pix').classList.toggle('escondido', !pix);
    document.querySelector('#agendamento').classList.toggle('escondido', !agendada);

    montarParcelas(conta.total);
}

form.addEventListener('change', function (evento) {
    if (evento.target.name === 'entrega' || evento.target.name === 'pagamento') {
        atualizarResumo();
    }
});

// tira o erro quando a pessoa começa a digitar
form.addEventListener('input', function (evento) {
    const campo = evento.target.closest('.campo');
    if (campo) campo.classList.remove('erro');
});

// ---------- validação ----------
function marcarErro(id, condicao) {
    const campo = document.querySelector('#' + id).closest('.campo');
    campo.classList.toggle('erro', condicao);
    return condicao;
}

function validar() {
    let erros = 0;
    const valor = function (id) {
        return document.querySelector('#' + id).value.trim();
    };

    if (marcarErro('nome', valor('nome').split(' ').length < 2)) erros++;
    if (marcarErro('cpf', soNumeros(valor('cpf')).length !== 11)) erros++;
    if (marcarErro('cep', soNumeros(valor('cep')).length !== 8)) erros++;
    if (marcarErro('rua', valor('rua') === '')) erros++;
    if (marcarErro('numero', valor('numero') === '')) erros++;
    if (marcarErro('bairro', valor('bairro') === '')) erros++;
    if (marcarErro('cidade', valor('cidade') === '')) erros++;

    // se tiver erro no endereço, abre o formulário no mobile
    if (erros > 0) {
        document.querySelector('#campos-endereco').classList.add('aberto');
    }

    if (formaPagamento() === 'cartao') {
        if (marcarErro('numero-cartao', soNumeros(valor('numero-cartao')).length !== 16)) erros++;
        if (marcarErro('nome-cartao', valor('nome-cartao') === '')) erros++;
        const mes = Number(valor('validade').slice(0, 2));
        if (marcarErro('validade', !/^\d{2}\/\d{2}$/.test(valor('validade')) || mes < 1 || mes > 12)) erros++;
        if (marcarErro('cvv', soNumeros(valor('cvv')).length !== 3)) erros++;
    }

    if (opcaoEntrega() === 'agendada' && valor('data-entrega') === '') {
        mostrarToast('Escolha a data', 'Selecione o dia da entrega agendada.', 'aviso');
        erros++;
    }

    return erros === 0;
}

// ---------- finalizar ----------
form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (!validar()) {
        mostrarToast('Confira os dados', 'Alguns campos precisam ser corrigidos.', 'aviso');
        const primeiroErro = document.querySelector('.campo.erro');
        if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // guarda o endereço para a próxima compra
    const enderecoNovo = {};
    Object.keys(enderecoPadrao).forEach(function (campo) {
        enderecoNovo[campo] = document.querySelector('#' + campo).value.trim();
    });
    salvarDados('techbox_endereco', enderecoNovo);

    const conta = totalPedido();
    const pix = formaPagamento() === 'pix';
    const cartao = soNumeros(document.querySelector('#numero-cartao').value);

    const dados = {
        itens: itens,
        total: Math.round(conta.total * 100) / 100,
        entrega: opcaoEntrega() === 'agendada' ? 'Entrega agendada' : 'Entrega expressa',
        frete: conta.frete,
        pagamento: pix ? 'Pix' : 'Cartão •••• ' + cartao.slice(-4),
        parcelas: pix ? 1 : Number(document.querySelector('#parcelas').value),
        endereco: enderecoNovo
    };

    if (pix) {
        // o pedido só é criado depois de pagar o Pix
        salvarDados('techbox_checkout', dados);
        location.href = 'pix.html';
    } else {
        const pedido = criarPedido(dados);
        location.href = 'pedido-confirmado.html?pedido=' + pedido.numero;
    }
});

mostrarItens();
atualizarResumo();
