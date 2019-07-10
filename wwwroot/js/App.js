// Uso a API a apontar para o próprio servidor,
// logo não meto o link (http://localhost:5000).
// Se fosse outro servidor, teria que colocar aqui o link.
let api = new ApiPosts("");


//Permite fazer o scroll to top, mediante jQuery
var btn = $('#button');

$(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
        btn.addClass('show');
    } else {
        btn.removeClass('show');
    }
});

//Quando o botão é clicado, a página vai para a possição de scroll igual a 0px.
btn.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, '300');
});



////////////////////////////////////////////////////////////////////////////////////////////////////
// FAZER LOGIN NA PÁGINA
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('loginForm').onsubmit = async (evt) => {

    evt.preventDefault();
    try {
        // obtem o valor do utilizador
        let user = document.getElementById('UserName').value;

        // obtem o valor da palavra passe
        let passe = document.getElementById('Password').value;

        let log = await api.enviaLogin(user, passe);

    } catch (e) {
        console.error("Erro ao tentar fazer login", e);
        alert("Erro um erro ao tentar fazer login. Tente novamente.");
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// FAZER LOGOUT NA PÁGINA
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('boasVindasForm').onsubmit = async (evt) => {
    evt.preventDefault();
    try {
        let logOut = await api.fazLogout();
    }
    catch (e) {
        console.error("Erro ao tentar fazer logout", e);
        alert("Erro um erro ao tentar fazer logout. Tente novamente.");
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
// CRIAR PUBLICAÇÔES
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('criarPublicacao').onsubmit = async (evt) => {
    // Impedir que o browser submeta
    evt.preventDefault();
    try {

        let nome = document.getElementById('Caption').value;

        // Para obter ficheiros, usa-se o 'files' (é um array) num <input type="file" />
        let foto = document.getElementById('Fotografia').files[0];

        let novaPublicacao = await api.createPublicacao(nome, foto);

        // Mostrar a nova publicação no ecrã.
        let novoDivPost = criarDivPost(novaPublicacao);
        document.getElementById('publicacoes').appendChild(novoDivPost);

    } catch (e) {
        console.error("Erro ao criar a publicação", e);
        alert("Ocorreu um erro ao criar a publicação. Tente novamente.");
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// PESQUISA
////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('pesquisaPublicacoesForm').onsubmit = async (evt) => {
    evt.preventDefault();

    let pesquisa = document.getElementById('pesquisaPublicacoes').value;

    try {
        let publicacoes = await api.getPublicacoes(pesquisa);
        mostraListaPublicacoes(publicacoes);
    } catch (e) {
        console.error("Erro ao pesquisar", e);
        alert("Ocorreu um erro ao efetuar a pesquisa. Tente novamente.");
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////////////////////////////////

async function main() {
    try {
        let publicacoes = await api.getPublicacoes();
        mostraListaPublicacoes(publicacoes);
    } catch (e) {
        console.error("Erro ao obter agentes", e);
        alert("Ocorreu um erro ao obter os agentes. Tente novamente.");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    main();
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNÇÕES AUXILIARES
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Mostra os detalhes da publicação no div com ID #detalhesPublicacao.
 * @param {any} publicacao Publicação para qual mostrar os dados.
 */
function mostraDetalhesPublicacao(publicacao) {
    let detalhes = document.getElementById('detalhesPublicacao');

    // Esconder o pop-up dos detalhes quando se clica no botão
    document.getElementById('esconderDetalhes').onclick = (e) => {
        e.preventDefault();

        detalhes.classList.add('hidden');
    };

    document.getElementById('user').textContent = publicacao.user.name;
    let DataPost = new Date(publicacao.postedAt);
    document.getElementById('data').textContent = new Intl.DateTimeFormat('en-GB').format(DataPost);
    document.getElementById('numLikes').textContent = publicacao.likes + " gostos";
    document.getElementById('caption').textContent = publicacao.caption;
    document.getElementById('fotoPublicada').src = api.getLinkFoto(publicacao.id);

    let containerComentarios = document.querySelector('#comentarios > tbody');

    //// Limpar as multas
    containerComentarios.innerHTML = "";


    for (let comentario of publicacao.listaDeComentarios) {
        let row = document.createElement('tr');

        let tdNome = document.createElement('td');
        tdNome.textContent = comentario.name;
        row.appendChild(tdNome);

        let tdComentario = document.createElement('td');
        tdComentario.textContent = comentario.text;
        row.appendChild(tdComentario);

        let tdData = document.createElement('td');
        let DataPost = new Date(publicacao.postedAt);
        tdData.textContent = new Intl.DateTimeFormat('en-GB').format(DataPost);
        row.appendChild(tdData);

        containerComentarios.appendChild(row);
    }
    detalhes.classList.remove('hidden');
}

/**
 * Coloca no div com o ID #publicacoes uma lista de publicacoes.
 * @param {any[]} publicacoes Lista de publicacoes.
 */
function mostraListaPublicacoes(publicacoes) {
    let container = document.querySelector('#publicacoes');

    container.innerHTML = "";

    for (let publicacao of publicacoes) {
        let divPublicacao = criarDivPost(publicacao);

        container.appendChild(divPublicacao);
    }
}

/**
 * 
 */

function esconderDivLogout() {

    document.getElementById("boasVindasForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

/**
 *
 * @param {Number} erro
 * @returns {HTMLDivElement}
 */

function criarDivLogin(erro, user) {
    if (erro === 401) {
        document.getElementById("boasVindasForm").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
        //localStorage.setItem('teste', true); //store state in localStorage
        //localStorage.setItem('show', false); //store state in localStorage
    }
    if (erro === 200) {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("boasvindas").textContent = "Bem-vindo " + user + "!";
        document.getElementById("boasVindasForm").style.display = "block";
        //localStorage.setItem('teste', false); //store state in localStorage
        //localStorage.setItem('show', true); //store state in localStorage
    }
}

//window.onload = function () {
//    var show = localStorage.getItem('show');
//    if (show === true) {
//        document.getElementById('boasVindasForm').style.display = "block";
//    }
//    if (teste === true) {
//        document.getElementById('loginForm').style.display = "block";
//    }
//}

window.onload = function () {

    document.getElementById('boasVindasForm').style.display = "none";

}

/**
 * Método auxiliar para criar uma div para a lista de publicacoes.
 * @param {any} publicacao Publicacao para qual fazer o div.
 * @returns {HTMLDivElement} Div com o elemento da lista.
 */
function criarDivPost(publicacao) {
    let divPublicacao = document.createElement("div");

    let imgPublicacao = document.createElement("img");
    imgPublicacao.src = api.getLinkFoto(publicacao.id);
    imgPublicacao.style.height = "400px";
    imgPublicacao.style.objectPosition = "50% 50%";

    imgPublicacao.style.objectFit = "cover";


    divPublicacao.appendChild(imgPublicacao);

    let numLikes = document.createElement("p");
    numLikes.textContent = publicacao.likes;
    divPublicacao.appendChild(numLikes);
    let labelLikes = document.createElement("span");
    labelLikes.textContent = " gostos";
    divPublicacao.appendChild(labelLikes);

    let numComments = document.createElement("p");
    if (publicacao.comments > 0) {
        let tabulacao = document.createElement("span");
        tabulacao.textContent = " | ";
        divPublicacao.appendChild(tabulacao);
        numComments.textContent = publicacao.comments;
        divPublicacao.appendChild(numComments);
        let labelComments = document.createElement("span");
        labelComments.textContent = " comentários";
        divPublicacao.appendChild(labelComments);
    }



    let breakLine1 = document.createElement("br");
    divPublicacao.appendChild(breakLine1);

    let autorPublicacao = document.createElement("p");
    autorPublicacao.className = "autorClass";
    autorPublicacao.textContent = publicacao.user.name;
    divPublicacao.appendChild(autorPublicacao);

    let space = document.createElement("span");
    space.textContent = " ";
    divPublicacao.appendChild(space);

    let legendaPublicacao = document.createElement("p");
    legendaPublicacao.textContent = publicacao.caption;
    divPublicacao.appendChild(legendaPublicacao);

    let breakLine2 = document.createElement("br");
    divPublicacao.appendChild(breakLine2);

    let dataPublicacao = document.createElement("p");
    let DataPost = new Date(publicacao.postedAt);
    dataPublicacao.textContent = new Intl.DateTimeFormat('en-GB').format(DataPost);
    divPublicacao.appendChild(dataPublicacao);







    imgPublicacao.onclick = async (e) => {
        e.preventDefault();

        try {
            let detalhesPublicacao = await api.getPublicacao(publicacao.id);

            mostraDetalhesPublicacao(detalhesPublicacao);
        } catch (e) {
            console.error("Erro ao obter a publicação.", e);
            alert("Erro ao obter a publicação.");
        }
    };







    return divPublicacao;
}

