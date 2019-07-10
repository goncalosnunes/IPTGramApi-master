using IPTGram.Data;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace IPTGram.Models.Post
{
    /// <summary>
    /// Classe usada para criar um Agente.
    /// </summary>
    public class CreatePostModel : IValidatableObject
    {

        public string Caption { get; set; }

        [Required]
        public IFormFile Fotografia { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [Required]
        public string UserId { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (User == null)
            {
                yield return new ValidationResult("Não está autenticado.", new[] { "UserId" });
            }
            // Validar a fotografia (só "permito" JPGs)
            if (Fotografia.ContentType != "image/jpeg" &&
                Fotografia.ContentType != "image/jpg")
            {
                // Disponibilizar um erro se a fotografia não for uma imagem.
                // O segundo argumento é um array a indicar o(s) campos que estão inválidos.
                yield return new ValidationResult("A fotografia tem que ser um JPG.", new[] { "Fotografia" });
            }

        }
    }
}
