// =========================================================
// Pedido confirmado e Rastreamento
// (as duas páginas leem o pedido pelo ?pedido= da URL)
// =========================================================

const pedido = buscarPedido(parametroUrl('pedido'));
const cliente = lerUsuario();

// se não tiver nenhum pedido, não tem o que mostrar
if (!pedido) {
    location.href = '../index.html';
}

const DIAS = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'];

function textoItem(item) {
    const produto = buscarProduto(item.id);
    return {
        produto: produto,
        imagem: item.imagem || produto.imagem,
        detalhes: item.detalhes || item.cor + ' • 12 GB • 512 GB'
    };
}

// ---------- página de pedido confirmado ----------
if (document.querySelector('.confirmado')) {
    const nome = (pedido.endereco && pedido.endereco.nome) || (cliente && cliente.nome) || 'cliente';
    document.querySelector('#primeiro-nome').textContent = nome.split(' ')[0];
    document.querySelector('#numero-pedido').textContent = '#' + pedido.numero;

    let html = '';
    pedido.itens.forEach(function (item) {
        const dados = textoItem(item);
        html += `
            <div class="item-pedido">
                <div class="item-pedido__imagem"><img src="../img/${dados.imagem}" alt="${dados.produto.nome}"></div>
                <div class="item-pedido__info">
                    <strong>${dados.produto.nome}</strong>
                    <span>${dados.detalhes}</span>
                    <span>Quantidade: ${item.qtd}</span>
                </div>
            </div>`;
    });
    document.querySelector('#itens-confirmado').innerHTML = html;

    const textoParcelas = pedido.parcelas > 1 ? pedido.parcelas + 'x' : 'À vista';
    document.querySelector('#pagamento-desktop').textContent = pedido.pagamento;
    document.querySelector('#pagamento-parcelas').textContent = window.innerWidth <= 768
        ? pedido.pagamento + ' • ' + textoParcelas
        : textoParcelas;

    document.querySelector('#tipo-entrega').textContent = pedido.entrega === 'Entrega agendada' ? 'Entrega agendada' : 'Entrega full';
    if (pedido.entrega === 'Entrega agendada') {
        document.querySelector('#valor-entrega').textContent = dinheiroCentavos(24.9);
    }

    document.querySelector('#total-confirmado').textContent = dinheiro(pedido.total);
    document.querySelector('#parcelas-confirmado').textContent = pedido.parcelas > 1
        ? pedido.parcelas + 'x de ' + dinheiro(Math.round(pedido.total / pedido.parcelas))
        : 'Pago no ' + pedido.pagamento;

    document.querySelectorAll('.js-email').forEach(function (texto) {
        texto.textContent = cliente ? cliente.email : 'seu e-mail';
    });

    document.querySelector('#acompanhar').href = 'rastreamento.html?pedido=' + pedido.numero;
}

// ---------- página de rastreamento ----------
if (document.querySelector('.rastreio')) {
    const dataPedido = new Date(pedido.data);

    // previsão: de 5 a 11 dias depois da compra
    const inicio = new Date(dataPedido);
    inicio.setDate(inicio.getDate() + 5);
    const fim = new Date(dataPedido);
    fim.setDate(fim.getDate() + 11);

    let previsao = inicio.getDate() + ' a ' + fim.getDate() + ' de ' + MESES[fim.getMonth()] + '.';
    if (inicio.getMonth() !== fim.getMonth()) {
        previsao = inicio.getDate() + ' de ' + MESES[inicio.getMonth()] + '. a ' + fim.getDate() + ' de ' + MESES[fim.getMonth()] + '.';
    }
    document.querySelector('#data-entrega').textContent = previsao;
    document.querySelector('#codigo-rastreio').textContent = pedido.numero;

    function dataHora(data) {
        const hora = String(data.getHours()).padStart(2, '0') + ':' + String(data.getMinutes()).padStart(2, '0');
        return DIAS[data.getDay()] + ', ' + data.getDate() + ' de ' + MESES[data.getMonth()] + '., ' + hora;
    }

    const dataPreparo = new Date(dataPedido.getTime() + 25 * 60000);
    document.querySelector('#data-status').textContent = dataHora(dataPreparo);

    // cada situação do pedido muda os textos e a linha do tempo
    const situacoes = {
        preparando: { etapa: 1, titulo: 'Em preparação', selo: 'Preparando', texto: 'Seu pacote está sendo preparado', cor: 'laranja' },
        transporte: { etapa: 3, titulo: 'A caminho', selo: 'Em transporte', texto: 'Seu pacote está a caminho do endereço', cor: 'azul' },
        entregue: { etapa: 4, titulo: 'Entregue', selo: 'Entregue', texto: 'Seu pacote foi entregue em ' + (pedido.dataEntrega || ''), cor: 'verde' },
        cancelado: { etapa: 0, titulo: 'Pedido cancelado', selo: 'Cancelado', texto: 'Reembolso concluído em ' + (pedido.dataReembolso || ''), cor: 'vermelho' }
    };
    const situacao = situacoes[pedido.status] || situacoes.preparando;

    document.querySelector('#titulo-status').textContent = situacao.titulo;
    document.querySelector('#texto-status').textContent = situacao.texto;
    document.querySelector('#selo-status').lastChild.textContent = situacao.selo;
    const seloMobile = document.querySelector('#selo-status-mobile');
    seloMobile.textContent = situacao.selo;
    seloMobile.className = 'selo selo--' + situacao.cor + ' so-mobile';

    // ícones brancos para as etapas pintadas de azul
    const iconesAtuais = ['check-branco-16', 'package', 'send', 'truck-branco', 'home-claro'];

    document.querySelectorAll('.linha-tempo li').forEach(function (etapa, indice) {
        const feito = indice < situacao.etapa || pedido.status === 'entregue';
        const atual = indice === situacao.etapa && pedido.status !== 'entregue' && pedido.status !== 'cancelado';
        etapa.classList.toggle('feito', feito);
        etapa.classList.toggle('atual', atual);

        const icone = etapa.querySelector('img');
        if (feito) {
            icone.src = '../img/icones/check-branco-16.svg';
        } else if (atual) {
            icone.src = '../img/icones/' + iconesAtuais[indice] + '.svg';
        }
    });
    document.querySelector('.linha-tempo').style.setProperty('--progresso', (situacao.etapa * 25) + '%');

    // histórico de movimentações
    const historico = [
        ['azul', 'Preparando', 'Seu pacote está sendo preparado', dataHora(dataPreparo), 'Sendo preparado no país/região de origem'],
        ['verde', 'Pedido recebido', 'Recebemos o seu pedido', dataHora(dataPedido), 'Pagamento aprovado']
    ];
    if (pedido.status === 'transporte' || pedido.status === 'entregue') {
        historico.unshift(['azul', 'Enviado', 'Seu pacote foi entregue à transportadora', dataHora(new Date(dataPedido.getTime() + 86400000)), 'Centro de distribuição - São Paulo']);
    }
    if (pedido.status === 'entregue') {
        historico.unshift(['verde', 'Entregue', 'Pacote entregue ao destinatário', pedido.dataEntrega, 'Recebido por Neymar']);
    }
    if (pedido.status === 'cancelado') {
        historico.splice(0, 1, ['azul', 'Cancelado', 'O pedido foi cancelado', pedido.dataReembolso, 'Reembolso feito no cartão']);
    }

    let htmlHistorico = '';
    historico.forEach(function (evento) {
        htmlHistorico += `
            <li class="evento">
                <span class="evento__bolinha ${evento[0]}"></span>
                <div>
                    <strong>${evento[1]}</strong>
                    <p>${evento[2]}</p>
                    <small>${evento[3]}</small>
                    <small>${evento[4]}</small>
                </div>
            </li>`;
    });
    document.querySelector('#lista-historico').innerHTML = htmlHistorico;

    // no desktop o histórico começa fechado
    const botaoMais = document.querySelector('#ver-mais-rastreio');
    botaoMais.addEventListener('click', function () {
        const aberto = document.querySelector('#historico').classList.toggle('aberto');
        botaoMais.classList.toggle('aberto', aberto);
        botaoMais.querySelector('span').textContent = aberto ? 'Ver menos detalhes' : 'Ver mais detalhes de rastreamento';
    });

    // endereço
    const end = pedido.endereco;
    if (end) {
        const cidade = end.cidade.split('/');
        document.querySelector('#endereco-rastreio').textContent = end.bairro + ', ' + end.rua + ', ' + end.numero +
            (end.complemento ? ' - ' + end.complemento : '') + ', ' + cidade[0].trim() + ', ' + (cidade[1] || '').trim() + ', Brasil, ' + end.cep;
    }

    // itens
    let htmlItens = '';
    pedido.itens.forEach(function (item) {
        const dados = textoItem(item);
        htmlItens += `
            <div class="produto-rastreio">
                <img src="../img/${dados.imagem}" alt="${dados.produto.nome}">
                <div>
                    <p>${dados.produto.nome}</p>
                    <small>${dados.detalhes}</small>
                </div>
                <strong>x${item.qtd}</strong>
            </div>`;
    });
    document.querySelector('#itens-rastreio').innerHTML = htmlItens;

    // copiar o código de rastreio
    document.querySelector('#copiar-rastreio').addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(pedido.numero);
        mostrarToast('Código copiado', 'Número de rastreamento: ' + pedido.numero);
    });
}
