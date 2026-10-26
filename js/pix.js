// =========================================================
// Pagamento com Pix - cronômetro, copiar código e confirmar
// =========================================================

const dadosCheckout = lerDados('techbox_checkout', null);

// se não veio do checkout, volta para o carrinho
if (!dadosCheckout) {
    location.href = 'carrinho.html';
}

const valorTexto = dinheiroCentavos(dadosCheckout.total);
document.querySelector('#valor-pix').textContent = valorTexto;
document.querySelectorAll('.js-valor-pix').forEach(function (texto) {
    texto.textContent = valorTexto;
});

// ---------- resumo ----------
let htmlItens = '';
let subtotal = 0;
dadosCheckout.itens.forEach(function (item) {
    const produto = buscarProduto(item.id);
    subtotal += produto.preco * item.qtd;
    htmlItens += `
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

document.querySelector('#itens-pedido').innerHTML = htmlItens;
document.querySelector('#pix-subtotal').textContent = dinheiroCentavos(subtotal);
document.querySelector('#pix-nome-entrega').textContent = dadosCheckout.entrega;
if (dadosCheckout.frete > 0) {
    const entrega = document.querySelector('#pix-entrega');
    entrega.textContent = dinheiroCentavos(dadosCheckout.frete);
    entrega.classList.remove('verde');
}
document.querySelector('#pix-total').textContent = dinheiro(dadosCheckout.total);

// ---------- cronômetro de 30 minutos ----------
let segundos = 30 * 60;
const tempo = document.querySelector('#tempo-pix');

const cronometro = setInterval(function () {
    segundos--;

    if (segundos <= 0) {
        clearInterval(cronometro);
        tempo.textContent = 'Código expirado';
        document.querySelector('#status-pix').textContent = 'Expirado';
        document.querySelector('#status-pix').className = 'selo selo--vermelho';
        return;
    }

    const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
    const resto = String(segundos % 60).padStart(2, '0');
    tempo.textContent = 'Expira em ' + minutos + ':' + resto;
}, 1000);

// ---------- copiar código ----------
document.querySelector('#copiar-pix').addEventListener('click', function () {
    const campo = document.querySelector('#codigo-pix');

    if (navigator.clipboard) {
        navigator.clipboard.writeText(campo.value);
    } else {
        // jeito antigo, caso o navegador não tenha clipboard
        campo.select();
        document.execCommand('copy');
    }

    mostrarToast('Código Pix copiado', 'Cole no app do seu banco para pagar.');
});

// ---------- confirmar pagamento ----------
document.querySelectorAll('.js-paguei').forEach(function (botao) {
    botao.addEventListener('click', function () {
        if (segundos <= 0) {
            mostrarToast('Código expirado', 'Volte e gere um novo Pix.', 'aviso');
            return;
        }

        clearInterval(cronometro);
        const status = document.querySelector('#status-pix');
        status.textContent = 'Pagamento aprovado';
        status.className = 'selo selo--verde';

        // espera um pouquinho para parecer que está conferindo
        setTimeout(function () {
            const pedido = criarPedido(dadosCheckout);
            location.href = 'pedido-confirmado.html?pedido=' + pedido.numero;
        }, 900);
    });
});
