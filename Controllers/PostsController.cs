using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IPTGram.Data;
using System.IO;
using IPTGram.Models.Post;
using Microsoft.AspNetCore.Identity;

namespace IPTGram.Controllers
{
    [Route("api/posts")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly IPTGramDb _context;

        private readonly UserManager<User> userManager;

        public PostsController(IPTGramDb context)
        {
            _context = context;
        }

        #region CRUD - READ
        /// <summary>
        /// GET /api/posts
        /// 
        /// Devolve uma lista de publicacões, num array.
        /// 
        /// Opcionalmente, a lista pode ser filtrada por um termo de pesquisa,
        /// presente na Query String, que incide sobre o nome do agente, ou na sua esquadra.
        /// 
        /// É também possível filtrar só agentes que têm foto, usando o parâmetro na query string
        /// 'comFoto'. Um valor de 'null' neste campo não incluí esta pesquisa.
        /// </summary>
        /// <returns></returns>
        /// 
        public IActionResult GetAll([FromQuery] string pesquisa)
        {
            // Linq - queries dinâmicas.
            // Muitas vezes, os parâmetros de pesquisa são opcionais.
            // Logo, podemos compor uma query Linq começando a partir da
            // tabela dos agentes.
            IQueryable<Post> query = _context.Posts;

            // Se o termo de pesquisa estiver definido, então compõe-se
            // a query com um .Where para filtrar no nome, usando o .Contains
            // (LIKE em SQL)
            // O string.IsNullOrWhiteSpace(texto) devolve verdadeiro se
            // texto != null && texto != "" && texto.Trim() != ""
            if (!string.IsNullOrWhiteSpace(pesquisa))
            {
                pesquisa = pesquisa.ToLower().Trim();
                // Como queries são imutáveis, guardamos a nova query na variável acima.
                // Convém fazer o lower case (minúsculas) para facilitar as pesquisas.
                query = query.Where(a => a.User.Name.ToLower().Contains(pesquisa)||a.Caption.ToLower().Contains(pesquisa));
            }

            // Usar o .Select para remover as referências circulares
            // Agentes <-> Multas, que iriam fazer com que ocorressem
            // erros ao produzir o JSON.
            var resultado = query
                .Select(post => new
                {
                    post.Id,
                    post.Caption,
                    post.PostedAt,
                    User = new
                    {
                        post.User.Id,
                        post.User.Name,
                        post.User.UserName
                    },
                    likes = post.Likes.Count(),
                    Comments = post.Comments.Count()

                })
                                .ToList();

            return Ok(resultado);
        }

        /// <summary>
        /// GET /api/posts/{id}
        /// 
        /// Devolve uma publicação com um determinado ID, e as suas multas. O ID é passado
        /// no endereço.
        /// 
        /// Devolve 404 se o agente não existe.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public IActionResult GetOneById(long id)
        {
            // Vou usar mais uma vez o .Select para impedir referências circulares e seleccionar
            // APENAS os dados que preciso.
            // Depois, faço uso do .FirstOrDefault() para obter apenas um agente (ou null, se não existe).
            var post = _context.Posts
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Caption,
                    p.PostedAt,
                    User = new
                    {
                        p.User.Id,
                        p.User.Name,
                        p.User.UserName
                    },
                    likes = p.Likes.Count(),

                    ListaDeComentarios = p.Comments
                    .Select(c => new
                    {
                        c.User.Name,
                        c.PostedAt,
                        c.Text
                    })
                    .ToList()
                })
                .FirstOrDefault();

            // Enquanto que em MVC eu devolvo uma página, ou faço redirect,
            // APIs são usadas por código, por isto deve ser tratado como uma "exceção"
            // (404 Not Found)
            if (post == null)
            {
                return NotFound(new ErroApi { Mensagem = "A publicação com ID " + id + " não existe." });
            }

            // Se chegarmos aqui, está tudo OK.
            return Ok(post);
        }
        #endregion

        #region CRUD - Create
        /// <summary>
        /// POST /api/posts
        /// Cria um agente a partir dos dados do formulário.
        /// 
        /// Devolve 201 Created se o agente foi criado com sucesso.
        /// Devolve 400 Bad Request se os dados de input não forem válidos.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromForm] CreatePostModel model)
        {
            var currentUser = await userManager.FindByNameAsync(User.Identity.Name);
            
            // Da mesma forma que no MVC valido erros, faço o mesmo na API.
            // A diferença é que geramos uma "exceção" (400 Bad Request) em vez de
            // mostrarmos uma view.
            if (!ModelState.IsValid)
            {
                // Passar o ModelState para o BadRequest() faz 
                // com que os erros de validação fiquem no output.
                return BadRequest(ModelState);
            }

            var pastaFotografias = CaminhoParaFotos();

            if (!Directory.Exists(pastaFotografias))
            {
                Directory.CreateDirectory(pastaFotografias);
            }

            // Gerar caminho da fotografia (FotosPosts/<guid>.jpg)
            var nomeFicheiroFoto = Guid.NewGuid().ToString() + Path.GetExtension(model.Fotografia.FileName);

            var caminhoFoto = Path.Combine(pastaFotografias, nomeFicheiroFoto);

            // Guardar os dados num ficheiro, copiando o output para o stream
            // infelizmente não existe o método SaveAs().
            using (Stream output = System.IO.File.OpenWrite(caminhoFoto))
            {
                model.Fotografia.CopyTo(output);
            }

            // Guardar o agente na BD.
            var novoPost = new Post
            {
                UserId = currentUser.Id,
                Caption = model.Caption,
                ImageFileName = model.Fotografia.FileName,
                ImageContentType = model.Fotografia.ContentType,
            };

            _context.Posts.Add(novoPost);

            _context.SaveChanges();

            // Criar o output.
            // Apesar de, neste caso, não existir risco de 
            // referências circulares, não custa nada fazer um output correto.
            var resultado = new
            {
                novoPost.Id,
                novoPost.UserId,
                novoPost.Caption,
                novoPost.ImageFileName,
                novoPost.ImageContentType
            };

            // Se quisermos ser 100% corretos numa API,
            // então devemos indicar ONDE foi criado o objeto que 
            // se submeteu, usando o Status Code 201 Created.
            // Isto indica sucesso, tal como o 200 OK, mas também indica
            // no cabeçalho "Location", o link para o novo objeto.
            // Se quiserem simplificar, usem 200 OK.
            // O CreatedAtAction pode ser usado para isto. Tem os seguintes parâmetros:
            // 1. Nome do Action do controller.
            // 2. Parâmetros a enviar (para construir o link)
            // 3. Dados a enviar (como se fosse no OK)
            return CreatedAtAction("GetOneById", new { id = resultado.Id }, resultado);

            // return Ok(resultado);
        }
        #endregion

        #region CRUD - Delete
        // DELETE: api/Posts/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Post>> DeletePost(long id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound();
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return post;
        }

        private bool PostExists(long id)
        {
            return _context.Posts.Any(e => e.Id == id);
        }
        #endregion

        #region Fotografias
        /// <summary>
        /// GET /api/agentes/{id}/foto
        /// 
        /// Permite obter a foto de um agente, dado o seu ID.
        /// 
        /// Devolve:
        /// - 200 OK se o agente existir.
        /// - 404 Not Found caso contrário.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/foto")]
        public IActionResult GetFotografiaById(long id)
        {
            var posts = _context.Posts.Find(id);

            if (posts == null)
            {
                return NotFound(new ErroApi("Não é possível obter a fotografia do post " + id + " porque este não existe."));
            }

            // Um post pode não ter foto, por isso temos que ter cuidado.
            var foto = posts.ImageFileName;

            if (foto == null)
            {
                foto = "postEmpty.jpg";
            }

            var caminhoFoto = Path.Combine(CaminhoParaFotos(), foto);

            // O método PhysicalFile do controller permite fazer download de um ficheiro numa
            // determinada pasta, dado o seu caminho. O caminho tem que ser ABSOLUTO.
            // (o método File é igual, mas usa a directoria wwwroot, e usa um caminho relativo a essa pasta)
            return PhysicalFile(caminhoFoto, "image/jpeg");
        }
        #endregion

        /// <summary>
        /// Devolve o caminho ABSOLUTO para a pasta das fotos partilhadas.
        /// </summary>
        /// <returns></returns>
        private string CaminhoParaFotos()
        {
            var fullPath = Path.GetFullPath("images");

            return fullPath;
        }

    }
}
