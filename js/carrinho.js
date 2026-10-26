// =========================================================
// Carrinho - lista os itens, quantidade, cupom, frete e total
// =========================================================

const listaItens = document.querySelector('#lista-itens');

// ---------- desenha os itens ----------
function mostrarCarrinho() {
    const carrinho = lerCarrinho();
    const vazio = carrinho.length === 0;

    document.querySelector('#carrinho-vazio').classList.toggle('escondido', !vazio);
    document.body.classList.toggle('carrinho-cheio', !vazio);
    document.body.classList.toggle('com-barra-fixa', !vazio);
    document.querySelector('#barra-carrinho').classList.toggle('escondido', vazio);

    const quantidadeTotal = totalItensCarrinho();
    const tituloMobile = document.querySelector('.titulo-mobile h1');
    if (tituloMobile) {
        tituloMobile.textContent = vazio ? 'Carrinho' : 'Carrinho (' + quantidadeTotal + ')';
    }

    let html = '';
    carrinho.forEach(function (item, indice) {
        const produto = buscarProduto(item.id);
        const marcado = item.selecionado !== false;

        html += `
            <article class="item-carrinho" data-indice="${indice}">
                <label class="item-carrinho__check so-desktop">
                    <input type="checkbox" class="js-selecionar" ${marcado ? 'checked' : ''} aria-label="Selecionar ${produto.nome}">
                </label>
                <a class="item-carrinho__imagem" href="produto.html?id=${produto.id}">
                    <img src="../img/${produto.imagem}" alt="${produto.nome}">
                </a>
                <div class="item-carrinho__detalhes">
                    <div class="item-carrinho__topo">
                        <div>
                            <h3>${produto.nome}</h3>
                            <p class="item-carrinho__specs">${produto.specs} • ${item.cor}</p>
                        </div>
                        <div class="item-carrinho__valores">
                            <strong>${dinheiro(produto.preco * item.qtd)}</strong>
                            <s>${dinheiro(produto.precoAntigo * item.qtd)}</s>
                            <span class="item-carrinho__parcelas so-mobile">em 10x ${dinheiro(produto.preco * item.qtd / 10)} sem juros</span>
                        </div>
                    </div>
                    <p class="item-carrinho__estoque">
                        <span class="ponto so-desktop"></span>
                        <img class="so-mobile" src="../img/icones/truck-verde-16.svg" alt="" width="16" height="16">
                        Em estoque • envio em até 10 dias úteis
                    </p>
                    <div class="item-carrinho__controles">
                        <div class="item-carrinho__qtd">
                            <span class="so-desktop">Quantidade</span>
                            <div class="quantidade">
                                <button type="button" class="js-menos" aria-label="Diminuir"><img src="../img/icones/minus.svg" alt="" width="13" height="13"></button>
                                <span>${item.qtd}</span>
                                <button type="button" class="js-mais" aria-label="Aumentar"><img src="../img/icones/plus-escuro.svg" alt="" width="13" height="13"></button>
                            </div>
                        </div>
                        <div class="item-carrinho__acoes">
                            <button type="button" class="salvar so-mobile js-salvar">Salvar</button>
                            <button type="button" class="remover js-remover">
                                <img class="so-desktop" src="../img/icones/trash.svg" alt="" width="15" height="15">
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            </article>`;
    });

    listaItens.innerHTML = html;
    mostrarResumo();
    mostrarVitrine(vazio);
}

function mostrarResumo() {
    const selecionados = itensSelecionados();
    const carrinhoVazio = lerCarrinho().length === 0;
    const valores = calcularTotais(selecionados);

    const rotulo = window.innerWidth <= 768
        ? 'Subtotal (' + valores.quantidade + (valores.quantidade === 1 ? ' produto)' : ' produtos)')
        : 'Subtotal';
    document.querySelector('#rotulo-subtotal').textContent = rotulo;

    if (carrinhoVazio || selecionados.length === 0) {
        document.querySelector('#valor-subtotal').textContent = 'R$ -';
        document.querySelector('#valor-total').textContent = 'R$ -';
        document.querySelector('#valor-parcelas').textContent = '';
        document.querySelector('#linha-desconto').classList.add('escondido');
    } else {
        document.querySelector('#valor-subtotal').textContent = dinheiro(valores.subtotal);
        document.querySelector('#valor-desconto').textContent = '− ' + dinheiro(Math.round(valores.desconto));
        document.querySelector('#linha-desconto').classList.toggle('escondido', valores.desconto <= 0);
        document.querySelector('#valor-total').textContent = dinheiro(Math.round(valores.total));
        document.querySelector('#valor-parcelas').textContent = '12x de ' + dinheiro(Math.round(valores.total / 12));
    }

    document.querySelector('#barra-total').textContent = dinheiro(Math.round(valores.total));
    document.querySelector('#linha-entrega').classList.toggle('escondido', carrinhoVazio);

    document.querySelectorAll('.js-finalizar').forEach(function (botao) {
        botao.disabled = selecionados.length === 0;
    });
}

// vitrine de baixo (muda se o carrinho estiver vazio)
function mostrarVitrine(vazio) {
    mostrarProdutos(document.querySelector('#explorar-desktop'),
        ['zenbook', 'asus-tuf', 'iphone17', 'rog-strix'].map(buscarProduto), true);

    const idsMobile = vazio ? ['asus-tuf', 'pixel9', 'poco-f7'] : ['nitro-v15', 'galaxy-book4', 'lenovo-loq'];
    mostrarProdutos(document.querySelector('#explorar-mobile'), idsMobile.map(buscarProduto));

    const titulo = document.querySelector('#titulo-explorar');
    if (window.innerWidth <= 768) {
        titulo.textContent = vazio ? 'Explore os favoritos da TechBox' : 'Quem viu, também comprou';
    } else {
        titulo.textContent = 'Explore...';
    }
}

// ---------- ações dos itens ----------
listaItens.addEventListener('click', function (evento) {
    const artigo = evento.target.closest('.item-carrinho');
    if (!artigo) return;

    const indice = Number(artigo.dataset.indice);
    const carrinho = lerCarrinho();
    const item = carrinho[indice];

    if (evento.target.closest('.js-mais')) {
        if (item.qtd < 10) {
            item.qtd++;
            salvarCarrinho(carrinho);
            mostrarCarrinho();
        } else {
            mostrarToast('Limite atingido', 'Você pode comprar até 10 unidades.', 'aviso');
        }
    }

    if (evento.target.closest('.js-menos')) {
        if (item.qtd > 1) {
            item.qtd--;
            salvarCarrinho(carrinho);
            mostrarCarrinho();
        } else {
            perguntarRemover(indice);
        }
    }

    if (evento.target.closest('.js-remover')) {
        perguntarRemover(indice);
    }

    if (evento.target.closest('.js-salvar')) {
        mostrarToast('Salvo nos favoritos', 'Você encontra ele em Minha conta.');
    }
});

listaItens.addEventListener('change', function (evento) {
    if (!evento.target.classList.contains('js-selecionar')) return;
    const indice = Number(evento.target.closest('.item-carrinho').dataset.indice);
    const carrinho = lerCarrinho();
    carrinho[indice].selecionado = evento.target.checked;
    salvarCarrinho(carrinho);
    mostrarResumo();
});

function perguntarRemover(indice) {
    confirmar({
        icone: 'trash-vermelho.svg',
        titulo: 'Remover item do carrinho?',
        texto: 'O produto será removido do seu carrinho. Você pode adicioná-lo novamente depois.',
        botao: 'Remover',
        perigo: true
    }, function () {
        const carrinho = lerCarrinho();
        carrinho.splice(indice, 1);
        salvarCarrinho(carrinho);
        mostrarCarrinho();
        mostrarToast('Item removido', 'O produto saiu do seu carrinho.');
    });
}

// ---------- cupom ----------
document.querySelector('#form-cupom').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const codigo = document.querySelector('#campo-cupom').value.trim().toUpperCase();
    const mensagem = document.querySelector('#mensagem-cupom');

    if (cupons[codigo]) {
        salvarDados('techbox_cupom', codigo);
        mensagem.textContent = cupons[codigo].texto;
        mensagem.className = 'cupom__mensagem so-desktop verde';
    } else {
        localStorage.removeItem('techbox_cupom');
        mensagem.textContent = 'Cupom inválido. Tente TECHBOX10.';
        mensagem.className = 'cupom__mensagem so-desktop vermelho';
    }
    mostrarResumo();
});

// mostra o cupom que já estava salvo
const cupomSalvo = lerDados('techbox_cupom', '');
if (cupons[cupomSalvo]) {
    document.querySelector('#campo-cupom').value = cupomSalvo;
    document.querySelector('#mensagem-cupom').textContent = cupons[cupomSalvo].texto;
    document.querySelector('#mensagem-cupom').classList.add('verde');
}

// ---------- frete ----------
const campoCep = document.querySelector('#campo-cep');

// coloca o traço do CEP automaticamente
campoCep.addEventListener('input', function () {
    let numeros = campoCep.value.replace(/\D/g, '').slice(0, 8);
    if (numeros.length > 5) numeros = numeros.slice(0, 5) + '-' + numeros.slice(5);
    campoCep.value = numeros;
});

campoCep.value = lerDados('techbox_cep', '01310-100');

document.querySelector('#form-frete').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const resultado = document.querySelector('#resultado-frete');

    if (campoCep.value.replace(/\D/g, '').length !== 8) {
        resultado.textContent = 'Digite um CEP válido com 8 números.';
        resultado.className = 'frete__resultado vermelho';
        return;
    }

    salvarDados('techbox_cep', campoCep.value);
    resultado.innerHTML = '<strong>Entrega expressa grátis</strong> • chega amanhã';
    resultado.className = 'frete__resultado verde';
});

// ---------- finalizar ----------
document.querySelectorAll('.js-finalizar').forEach(function (botao) {
    botao.addEventListener('click', function () {
        if (itensSelecionados().length === 0) {
            mostrarToast('Selecione um produto', 'Marque pelo menos um item para continuar.', 'aviso');
            return;
        }
        if (lerUsuario()) {
            location.href = 'checkout.html';
        } else {
            mostrarToast('Entre na sua conta', 'Faça login para finalizar a compra.', 'aviso');
            setTimeout(function () {
                location.href = 'login.html?voltar=checkout.html';
            }, 1200);
        }
    });
});

mostrarCarrinho();
