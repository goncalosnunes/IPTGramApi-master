using IPTGram.Data;
using IPTGram.Data.Account;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IPTGram.Controllers
{
    [Authorize]
    [Route("api/account")]
    public class AccountController : Controller
    {
        /// <summary>
        /// Usado para obter users da BD.
        /// </summary>
        private readonly UserManager<User> userManager;

        /// <summary>
        /// Usado para fazer o início de sessão através do username e password.
        /// </summary>
        private readonly SignInManager<User> signInManager;

        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.signInManager = signInManager;
            this.userManager = userManager;
        }

        /// <summary>
        /// POST /api/account/logout
        /// 
        /// Termina sessão.
        /// </summary>
        /// <returns></returns>
        [HttpPost("logout")]
        public async Task<IActionResult> LogOut()
        {
            await signInManager.SignOutAsync();

            return Ok();
        }

        /// <summary>
        /// POST /api/account/login
        /// 
        /// Inicia sessão.
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> LogIn([FromForm] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Obter o user da BD.
            var user = await userManager.FindByNameAsync(model.UserName);

            // Se o utilizador não existir, erro.
            if (user == null)
            {
                return Unauthorized(new ErroApi("Username ou palavra-passe errados."));
            }

            // Tentar fazer login com a password obtida
            var signInResult = await signInManager.PasswordSignInAsync(user, model.Password, isPersistent: true, lockoutOnFailure: false);

            // Se a autenticação não correr bem, erro
            // (a mensagem é igual por razões de segurança)
            if (!signInResult.Succeeded)
            {
                return Unauthorized(new ErroApi("Username ou palavra-passe errados."));
            }

            return Ok(new
            {
                Nome = user.Name
            });
        }
    }
}
