// =========================================================
// TechBox - script principal (usado em todas as páginas)
// Monta cabeçalho, rodapé e barra de abas, e guarda o
// carrinho, o usuário e os pedidos no localStorage.
// =========================================================

// se a página estiver dentro da pasta "pages", os caminhos precisam de "../"
const RAIZ = location.pathname.includes('/pages/') ? '../' : './';
const PAGINAS = RAIZ === './' ? 'pages/' : '';
const IMG = RAIZ + 'img/';

// ---------------------------------------------------------
// Formatação de dinheiro
// ---------------------------------------------------------
function dinheiro(valor, moeda) {
    moeda = moeda || 'R$';
    // se o valor não tiver centavos, mostra sem ",00" (igual ao figma)
    const temCentavos = Math.round(valor * 100) % 100 !== 0;
    const texto = valor.toLocaleString('pt-BR', {
        minimumFractionDigits: temCentavos ? 2 : 0,
        maximumFractionDigits: 2
    });
    return moeda + ' ' + texto;
}

function dinheiroCentavos(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------------------------------------------------------
// localStorage (carrinho, usuário e pedidos)
// ---------------------------------------------------------
function lerDados(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch (erro) {
        return padrao;
    }
}

function salvarDados(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        console.log('Não foi possível salvar no localStorage');
    }
}

function lerCarrinho() {
    return lerDados('techbox_carrinho', []);
}

function salvarCarrinho(carrinho) {
    salvarDados('techbox_carrinho', carrinho);
    atualizarContadores();
}

function totalItensCarrinho() {
    let total = 0;
    lerCarrinho().forEach(function (item) {
        total += item.qtd;
    });
    return total;
}

function adicionarAoCarrinho(id, cor, qtd) {
    const carrinho = lerCarrinho();
    const existente = carrinho.find(function (item) {
        return item.id === id && item.cor === cor;
    });

    if (existente) {
        existente.qtd += qtd;
    } else {
        carrinho.push({ id: id, cor: cor, qtd: qtd, selecionado: true });
    }

    salvarCarrinho(carrinho);
}

function itensSelecionados() {
    return lerCarrinho().filter(function (item) {
        return item.selecionado !== false;
    });
}

// cupons que funcionam na loja
const cupons = {
    TECHBOX10: { tipo: 'porcentagem', valor: 10, texto: '10% de desconto aplicado!' },
    BEMVINDO: { tipo: 'fixo', valor: 200, texto: 'R$ 200 de desconto aplicado!' }
};

// calcula os valores dos itens (usado no carrinho, checkout e pix)
function calcularTotais(itens) {
    let subtotal = 0;
    let total = 0;
    let quantidade = 0;

    itens.forEach(function (item) {
        const produto = buscarProduto(item.id);
        subtotal += (produto.precoAntigo || produto.preco) * item.qtd;
        total += produto.preco * item.qtd;
        quantidade += item.qtd;
    });

    // desconto do cupom
    const cupom = cupons[lerDados('techbox_cupom', '')];
    let descontoCupom = 0;
    if (cupom && total > 0) {
        descontoCupom = cupom.tipo === 'porcentagem' ? total * cupom.valor / 100 : cupom.valor;
        descontoCupom = Math.min(descontoCupom, total);
    }
    total -= descontoCupom;

    return {
        subtotal: subtotal,
        desconto: subtotal - total,
        total: total,
        totalProdutos: total + descontoCupom,
        descontoCupom: descontoCupom,
        quantidade: quantidade
    };
}

function lerUsuario() {
    return lerDados('techbox_usuario', null);
}

function salvarUsuario(usuario) {
    salvarDados('techbox_usuario', usuario);
}

function sairDaConta() {
    localStorage.removeItem('techbox_usuario');
}

function lerPedidos() {
    return lerDados('techbox_pedidos', []);
}

function salvarPedidos(pedidos) {
    salvarDados('techbox_pedidos', pedidos);
}

// cria o pedido a partir do que foi preenchido no checkout
function criarPedido(dados) {
    const pedidos = lerPedidos();
    const numero = 'NX-' + (10483 + pedidos.length);
    const hoje = new Date();

    const pedido = {
        numero: numero,
        data: hoje.toISOString(),
        itens: dados.itens,
        total: dados.total,
        entrega: dados.entrega,
        pagamento: dados.pagamento,
        parcelas: dados.parcelas,
        endereco: dados.endereco,
        status: 'preparando'
    };

    pedidos.unshift(pedido);
    salvarPedidos(pedidos);

    // tira do carrinho só os itens que foram comprados
    const restantes = lerCarrinho().filter(function (item) {
        return item.selecionado === false;
    });
    salvarCarrinho(restantes);
    localStorage.removeItem('techbox_cupom');
    localStorage.removeItem('techbox_checkout');

    return pedido;
}

// pedidos antigos que aparecem no histórico de compras (iguais ao figma)
const pedidosExemplo = [
    {
        numero: 'NX-10482',
        data: '2026-10-15T14:20:00',
        itens: [{ id: 'macbook', cor: 'Grafite', qtd: 1, detalhes: 'Grafite • 32 GB • SSD 1 TB', imagem: 'produtos/macbook-pro-mini.jpg' }],
        total: 14900,
        entrega: 'Entrega expressa',
        pagamento: 'Cartão •••• 7824',
        parcelas: 12,
        endereco: { nome: 'Neymar Santos', rua: 'Av. Paulista', numero: '1578', complemento: 'Apto 84', bairro: 'Bela Vista', cidade: 'São Paulo / SP', cep: '01310-100' },
        status: 'transporte',
        previsao: '24 out'
    },
    {
        numero: 'NX-10451',
        data: '2026-08-29T10:05:00',
        itens: [{ id: 'iphone18', cor: 'Bordô', qtd: 1, detalhes: 'Bordô • 12 GB • SSD 512 GB', imagem: 'produtos/iphone-18-pro-mini.png' }],
        total: 11900,
        entrega: 'Entrega expressa',
        pagamento: 'Cartão •••• 7824',
        parcelas: 12,
        endereco: { nome: 'Neymar Santos', rua: 'Av. Paulista', numero: '1578', complemento: 'Apto 84', bairro: 'Bela Vista', cidade: 'São Paulo / SP', cep: '01310-100' },
        status: 'entregue',
        dataEntrega: '03 set 2026'
    },
    {
        numero: 'NX-10388',
        data: '2026-07-12T18:40:00',
        itens: [{ id: 'macbook', cor: 'Grafite', qtd: 1, detalhes: 'Grafite • 32 GB • SSD 1 TB', imagem: 'produtos/macbook-pro-mini.jpg' }],
        total: 14900,
        entrega: 'Entrega expressa',
        pagamento: 'Cartão •••• 7824',
        parcelas: 12,
        endereco: { nome: 'Neymar Santos', rua: 'Av. Paulista', numero: '1578', complemento: 'Apto 84', bairro: 'Bela Vista', cidade: 'São Paulo / SP', cep: '01310-100' },
        status: 'cancelado',
        dataReembolso: '15 jul 2026'
    }
];

function todosPedidos() {
    return lerPedidos().concat(pedidosExemplo);
}

function buscarPedido(numero) {
    const lista = todosPedidos();
    return lista.find(function (p) { return p.numero === numero; }) || lerPedidos()[0];
}

// data por extenso curta, ex: "15 out 2026"
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function dataCurta(data) {
    return data.getDate() + ' ' + MESES[data.getMonth()] + ' ' + data.getFullYear();
}

// pega um parâmetro da URL (ex: ?pedido=NX-10482)
function parametroUrl(nome) {
    return new URLSearchParams(location.search).get(nome);
}

// ---------------------------------------------------------
// Cabeçalho
// ---------------------------------------------------------
function montarCabecalho() {
    const cabecalho = document.querySelector('#cabecalho');
    if (!cabecalho) return;

    const pagina = document.body.dataset.pagina || '';
    const usuario = lerUsuario();

    // parte da conta: mostra a foto se estiver logado
    let conta = '';
    if (usuario) {
        conta = `
            <a class="acoes__avatar" href="${RAIZ}${PAGINAS}minha-conta.html" title="Minha conta">
                <img src="${IMG}avatar.png" alt="Foto de ${usuario.nome}">
            </a>`;
    } else {
        conta = `
            <a class="acoes__conta" href="${RAIZ}${PAGINAS}login.html">
                <img class="icone" src="${IMG}icones/user.svg" alt="" width="19" height="19">
                <span>Entrar / Cadastrar</span>
            </a>`;
    }

    const desktop = `
        <div class="cabecalho__barra">
            <a class="marca" href="${RAIZ}index.html">
                <img src="${IMG}logo.png" alt="Logo TechBox">
                <span>TechBox</span>
            </a>
            <nav class="menu">
                <a href="${RAIZ}index.html" class="${pagina === 'home' ? 'ativo' : ''}">Home</a>
                <a href="${RAIZ}${PAGINAS}catalogo.html?categoria=notebooks" class="${pagina === 'notebooks' ? 'ativo' : ''}">Notebooks</a>
                <a href="${RAIZ}${PAGINAS}catalogo.html?categoria=smartphones" class="${pagina === 'smartphones' ? 'ativo' : ''}">Smartphones</a>
            </nav>
            <form class="busca form-busca" role="search">
                <img class="icone" src="${IMG}icones/search.svg" alt="" width="18" height="18">
                <input type="search" name="busca" placeholder="Buscar produtos, marcas e mais">
            </form>
            <div class="acoes">
                ${conta}
                <a class="acoes__carrinho" href="${RAIZ}${PAGINAS}carrinho.html" title="Carrinho">
                    <img class="icone" src="${IMG}icones/bag.svg" alt="Carrinho" width="20" height="20">
                    <span class="contador js-contador">0</span>
                </a>
            </div>
        </div>`;

    cabecalho.innerHTML = desktop + montarCabecalhoMobile();
    cabecalho.classList.add('cabecalho');

    // busca do cabeçalho
    cabecalho.querySelectorAll('.form-busca').forEach(function (form) {
        form.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const termo = form.querySelector('input').value.trim();
            location.href = RAIZ + PAGINAS + 'catalogo.html?busca=' + encodeURIComponent(termo);
        });
    });

    // botão de voltar e lupa do mobile
    const voltar = cabecalho.querySelector('.titulo-mobile__voltar');
    if (voltar) {
        voltar.addEventListener('click', function () {
            const destino = document.body.dataset.voltar;
            if (destino) {
                location.href = destino;
            } else if (history.length > 1) {
                history.back();
            } else {
                location.href = RAIZ + 'index.html';
            }
        });
    }

    const lupa = cabecalho.querySelector('.titulo-mobile__busca');
    if (lupa) {
        lupa.addEventListener('click', function () {
            cabecalho.classList.toggle('busca-mobile-aberta');
            const campo = cabecalho.querySelector('.titulo-mobile input');
            if (campo) campo.focus();
        });
    }
}

function montarCabecalhoMobile() {
    const tipo = document.body.dataset.cabecalho || 'titulo';
    const titulo = document.body.dataset.titulo || '';

    if (tipo === 'nenhum') {
        return '';
    }

    if (tipo === 'fechar') {
        return `
            <div class="cabecalho-mobile">
                <div class="titulo-mobile">
                    <button class="titulo-mobile__voltar" type="button" aria-label="Fechar">
                        <img src="${IMG}icones/x-cinza.svg" alt="" width="24" height="24">
                    </button>
                </div>
            </div>`;
    }

    if (tipo === 'home') {
        return `
            <div class="cabecalho-mobile">
                <div class="cabecalho-mobile__linha">
                    <a class="marca" href="${RAIZ}index.html">
                        <img src="${IMG}logo.png" alt="Logo TechBox">
                        <span>TechBox</span>
                    </a>
                    <a class="cabecalho-mobile__carrinho" href="${RAIZ}${PAGINAS}carrinho.html" aria-label="Carrinho">
                        <img src="${IMG}icones/cart.svg" alt="" width="24" height="24">
                        <span class="contador js-contador">0</span>
                    </a>
                </div>
                <form class="busca form-busca" role="search">
                    <img class="icone" src="${IMG}icones/search-m.svg" alt="" width="18" height="18">
                    <input type="search" name="busca" placeholder="Buscar produtos, marcas e mais">
                </form>
            </div>`;
    }

    return `
        <div class="cabecalho-mobile">
            <div class="titulo-mobile">
                <button class="titulo-mobile__voltar" type="button" aria-label="Voltar">
                    <img src="${IMG}icones/chev-l.svg" alt="" width="24" height="24">
                </button>
                <h1>${titulo}</h1>
                <form class="busca form-busca" role="search">
                    <input type="search" name="busca" placeholder="Buscar produtos">
                </form>
                <button class="titulo-mobile__busca" type="button" aria-label="Buscar">
                    <img src="${IMG}icones/search-m-22.svg" alt="" width="22" height="22">
                </button>
            </div>
        </div>`;
}

// ---------------------------------------------------------
// Rodapé
// ---------------------------------------------------------
function montarRodape() {
    const rodape = document.querySelector('#rodape');
    if (!rodape) return;

    const colunas = [
        {
            titulo: 'Comprar',
            links: [
                ['Notebooks', RAIZ + PAGINAS + 'catalogo.html?categoria=notebooks'],
                ['Acessórios', '#'],
                ['Ofertas', RAIZ + PAGINAS + 'catalogo.html?ofertas=1']
            ]
        },
        {
            titulo: 'Atendimento',
            links: [['Central de ajuda', '#'], ['Trocas e devoluções', '#'], ['Garantia', '#']]
        },
        {
            titulo: 'Institucional',
            links: [['Sobre a Nexora', '#'], ['Privacidade', RAIZ + PAGINAS + 'privacidade.html'], ['Termos de uso', '#']]
        }
    ];

    let htmlColunas = '';
    colunas.forEach(function (coluna) {
        let links = '';
        coluna.links.forEach(function (link) {
            const emBreve = link[1] === '#' ? ' class="js-em-breve"' : '';
            links += `<li><a href="${link[1]}"${emBreve}>${link[0]}</a></li>`;
        });

        htmlColunas += `
            <div class="rodape__coluna">
                <h4>
                    <span class="titulo-desktop">${coluna.titulo}</span>
                    <button type="button">${coluna.titulo} <img src="${IMG}icones/chevron-right-white.svg" alt="" width="16" height="16"></button>
                </h4>
                <ul>${links}</ul>
            </div>`;
    });

    rodape.classList.add('rodape');
    rodape.innerHTML = `
        <div class="rodape__conteudo">
            <div class="rodape__marca">
                <a class="marca" href="${RAIZ}index.html">
                    <img src="${IMG}logo.png" alt="Logo TechBox">
                    <span>TechBox</span>
                </a>
                <p>Tecnologia escolhida com critério, suporte humano e entrega sem complicação.</p>
            </div>
            ${htmlColunas}
        </div>
        <div class="rodape__base">
            <span>© 2026 TechBox Tecnologia. <span class="so-desktop">Todos os direitos reservados.</span><span class="so-mobile">Brasil • Português</span></span>
            <span>Brasil • Português</span>
        </div>`;

    // sanfona do rodapé no mobile
    rodape.querySelectorAll('.rodape__coluna h4 button').forEach(function (botao) {
        botao.addEventListener('click', function () {
            botao.closest('.rodape__coluna').classList.toggle('aberta');
        });
    });
}

// ---------------------------------------------------------
// Barra de abas do mobile
// ---------------------------------------------------------
function montarAbas() {
    if (!document.body.classList.contains('com-abas')) return;

    const aba = document.body.dataset.aba || '';
    const linkConta = lerUsuario() ? 'minha-conta.html' : 'login.html';

    const itens = [
        ['inicio', 'Início', RAIZ + 'index.html', 'tab-home-cinza', 'tab-home'],
        ['categorias', 'Categorias', RAIZ + PAGINAS + 'catalogo.html', 'tab-grid', 'tab-grid-ativo'],
        ['carrinho', 'Carrinho', RAIZ + PAGINAS + 'carrinho.html', 'tab-cart', 'tab-cart-ativo'],
        ['conta', 'Conta', RAIZ + PAGINAS + linkConta, 'tab-user', 'tab-user-ativo']
    ];

    let html = '';
    itens.forEach(function (item) {
        const ativo = item[0] === aba;
        const icone = ativo ? item[4] : item[3];
        const contador = item[0] === 'carrinho' ? '<span class="contador js-contador">0</span>' : '';
        html += `
            <a href="${item[2]}" class="${ativo ? 'ativo' : ''}">
                <span class="abas__icone">
                    <img src="${IMG}icones/${icone}.svg" alt="" width="24" height="24">
                    ${contador}
                </span>
                ${item[1]}
            </a>`;
    });

    const nav = document.createElement('nav');
    nav.className = 'abas';
    nav.innerHTML = html;
    document.body.appendChild(nav);
}

// atualiza a bolinha com a quantidade de itens do carrinho
function atualizarContadores() {
    const total = totalItensCarrinho();
    document.querySelectorAll('.js-contador').forEach(function (contador) {
        contador.textContent = total;
        contador.classList.toggle('vazio', total === 0);
    });
}

// ---------------------------------------------------------
// Toast (aviso rápido no topo da tela)
// ---------------------------------------------------------
let tempoToast;

function mostrarToast(titulo, texto, tipo) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }

    const icone = tipo === 'aviso'
        ? '<span class="toast__icone aviso">!</span>'
        : `<span class="toast__icone"><img src="${IMG}icones/check-branco-toast.svg" alt="" width="16" height="16"></span>`;

    toast.innerHTML = `${icone}<div><strong>${titulo}</strong>${texto ? '<p>' + texto + '</p>' : ''}</div>`;
    toast.classList.add('visivel');

    clearTimeout(tempoToast);
    tempoToast = setTimeout(function () {
        toast.classList.remove('visivel');
    }, 2800);
}

function avisoEmBreve() {
    mostrarToast('Em breve!', 'Essa parte da loja ainda está em construção.', 'aviso');
}

// ---------------------------------------------------------
// Modais
// ---------------------------------------------------------
function abrirModal(modal) {
    modal.classList.add('aberto');
    document.body.style.overflow = 'hidden';
}

function fecharModal(modal) {
    modal.classList.remove('aberto');
    document.body.style.overflow = '';
}

// fecha clicando fora da caixa ou em botões com .js-fechar
document.addEventListener('click', function (evento) {
    if (evento.target.classList.contains('modal')) {
        fecharModal(evento.target);
    }
    const botaoFechar = evento.target.closest('.js-fechar');
    if (botaoFechar) {
        fecharModal(botaoFechar.closest('.modal'));
    }
    if (evento.target.closest('.js-em-breve')) {
        evento.preventDefault();
        avisoEmBreve();
    }
});

document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
        document.querySelectorAll('.modal.aberto').forEach(fecharModal);
    }
});

// janela de confirmação (remover item, sair da conta, excluir conta)
function confirmar(opcoes, aoConfirmar) {
    let modal = document.querySelector('#modal-confirmar');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'modal-confirmar';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal__caixa dialogo" role="dialog" aria-modal="true">
            <div class="dialogo__icone ${opcoes.perigo ? 'dialogo__icone--perigo' : ''}">
                <img src="${IMG}icones/${opcoes.icone}" alt="" width="28" height="28">
            </div>
            <h3>${opcoes.titulo}</h3>
            <p>${opcoes.texto}</p>
            <div class="dialogo__botoes">
                <button type="button" class="btn btn--secundario js-fechar">Cancelar</button>
                <button type="button" class="btn ${opcoes.perigo ? 'btn--perigo' : 'btn--primario'} js-confirmar">${opcoes.botao}</button>
            </div>
        </div>`;

    modal.querySelector('.js-confirmar').addEventListener('click', function () {
        fecharModal(modal);
        aoConfirmar();
    });

    abrirModal(modal);
}

// modal "produto adicionado ao carrinho"
function mostrarProdutoAdicionado(produto, qtd) {
    let modal = document.querySelector('#modal-adicionado');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal modal--folha';
        modal.id = 'modal-adicionado';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal__caixa adicionado" role="dialog" aria-modal="true">
            <img class="so-desktop" src="${IMG}sacola-ok.png" alt="" width="53" height="53">
            <div class="adicionado__titulo">
                <span class="adicionado__check so-mobile"><img src="${IMG}icones/check-branco-20.svg" alt="" width="20" height="20"></span>
                <p class="modal__titulo">${window.innerWidth <= 768 ? 'Produto adicionado ao carrinho com sucesso' : 'Pedido adicionado ao carrinho com sucesso'}</p>
            </div>
            <div class="adicionado__produto">
                <img src="${IMG}${produto.imagem}" alt="">
                <div>
                    <strong>${produto.nome} ${produto.specs}</strong>
                    <span>Qtd. ${qtd} • ${dinheiro(produto.preco * qtd)}</span>
                </div>
            </div>
            <a class="btn btn--primario btn--bloco" href="${RAIZ}${PAGINAS}carrinho.html">
                <img class="so-desktop" src="${IMG}icones/bag-branca.svg" alt="" width="17" height="17">
                Ver carrinho
            </a>
        </div>`;

    abrirModal(modal);
}

// ---------------------------------------------------------
// Card de produto (usado na home, catálogo e carrinho)
// ---------------------------------------------------------
function criarCardProduto(produto, usarImagemExplorar) {
    const link = produto.disponivel ? RAIZ + PAGINAS + 'produto.html?id=' + produto.id : '#';
    const imagem = usarImagemExplorar && produto.imagemExplorar ? produto.imagemExplorar : produto.imagem;
    const moeda = produto.moeda || 'R$';

    let selo = '';
    if (produto.selo) {
        const desconto = produto.selo.includes('%') ? ' desconto' : '';
        selo = `<span class="card-produto__selo${desconto}">${produto.selo}</span>`;
    }

    const precoAntigo = produto.precoAntigo ? `<s>${dinheiro(produto.precoAntigo, moeda)}</s>` : '';

    // texto das parcelas que aparece no mobile
    let parcelas = produto.parcelas;
    if (!parcelas) {
        parcelas = 'em 10x ' + dinheiro(Math.round(produto.preco / 10), moeda) + ' sem juros';
    }

    return `
        <article class="card-produto" data-id="${produto.id}">
            <div class="card-produto__imagem">
                <a class="js-abrir-produto" href="${link}">
                    <img class="foto ${produto.cobrir && !usarImagemExplorar ? 'cobrir' : ''}" src="${IMG}${imagem}" alt="${produto.nome}" loading="lazy">
                </a>
                ${selo}
                <button class="card-produto__favoritar js-favoritar" type="button" aria-label="Favoritar">
                    <img src="${IMG}icones/heart-card.svg" alt="" width="17" height="17">
                </button>
            </div>
            <div class="card-produto__info">
                <div class="avaliacao">
                    <img class="so-desktop" src="${IMG}icones/star.svg" alt="" width="14" height="14">
                    <img class="so-mobile" src="${IMG}icones/star-small.svg" alt="" width="12" height="12">
                    <strong>${produto.nota}</strong>
                    <span class="estoque">• Em estoque</span>
                </div>
                <a class="card-produto__nome js-abrir-produto" href="${link}">${produto.nome}</a>
                <p class="card-produto__specs">${produto.specs}</p>
                <div class="card-produto__preco">
                    <div>
                        ${precoAntigo}
                        <strong>${dinheiro(produto.preco, moeda)}</strong>
                        <span class="card-produto__parcelas">${parcelas}</span>
                    </div>
                    <button class="btn-adicionar js-adicionar" type="button" aria-label="Adicionar ${produto.nome} ao carrinho">
                        <img src="${IMG}icones/plus.svg" alt="" width="18" height="18">
                    </button>
                </div>
            </div>
        </article>`;
}

// coloca os cards dentro de um elemento
function mostrarProdutos(elemento, lista, usarImagemExplorar) {
    if (!elemento) return;
    let html = '';
    lista.forEach(function (produto) {
        html += criarCardProduto(produto, usarImagemExplorar);
    });
    elemento.innerHTML = html;
}

function avisoIndisponivel() {
    mostrarToast('Produto indisponível', 'Nesta demonstração só o iPhone 17 Pro pode ser comprado.', 'aviso');
}

// cliques nos cards (vale para a página inteira)
document.addEventListener('click', function (evento) {
    const card = evento.target.closest('.card-produto');
    if (!card) return;

    const produto = buscarProduto(card.dataset.id);

    if (evento.target.closest('.js-favoritar')) {
        evento.preventDefault();
        const botao = evento.target.closest('.js-favoritar');
        botao.classList.toggle('favorito');
        mostrarToast(botao.classList.contains('favorito') ? 'Adicionado aos favoritos' : 'Removido dos favoritos', '');
        return;
    }

    if (evento.target.closest('.js-adicionar')) {
        if (produto.disponivel) {
            adicionarAoCarrinho(produto.id, iphone17Detalhe.cores[0].nome, 1);
            mostrarProdutoAdicionado(produto, 1);
        } else {
            avisoIndisponivel();
        }
        return;
    }

    if (evento.target.closest('.js-abrir-produto') && !produto.disponivel) {
        evento.preventDefault();
        avisoIndisponivel();
    }
});

// ---------------------------------------------------------
// Inicialização
// ---------------------------------------------------------
montarCabecalho();
montarRodape();
montarAbas();
atualizarContadores();
