// ONG Canto da Terra — interações em JavaScript puro

const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  menuToggle.textContent = isOpen ? "×" : "☰";
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-label", "Abrir menu");
    }
  });
});

// Favoritos demonstrativos nos cards de adoção.
document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const isFavorite = button.classList.toggle("is-favorite");
    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(isFavorite));
  });
});

// Carrossel simples: desloca os cards no desktop e reorganiza a ordem.
const animalGrid = document.querySelector("#animalGrid");
const prevAnimal = document.querySelector("#prevAnimal");
const nextAnimal = document.querySelector("#nextAnimal");

function moveAnimal(direction) {
  if (!animalGrid || animalGrid.children.length < 2) return;
  if (direction === "next") {
    animalGrid.appendChild(animalGrid.firstElementChild);
  } else {
    animalGrid.insertBefore(animalGrid.lastElementChild, animalGrid.firstElementChild);
  }
}
nextAnimal?.addEventListener("click", () => moveAnimal("next"));
prevAnimal?.addEventListener("click", () => moveAnimal("prev"));

// Consulta de CEP pela API pública ViaCEP.
const cepInput = document.querySelector("#cep");
const searchCep = document.querySelector("#searchCep");
const cepFeedback = document.querySelector("#cepFeedback");
const addressFields = document.querySelector("#addressFields");
const streetInput = document.querySelector("#street");
const cityInput = document.querySelector("#city");

function showCepFeedback(message, isError = false) {
  cepFeedback.textContent = message;
  cepFeedback.classList.toggle("error", isError);
}

cepInput?.addEventListener("input", () => {
  const digits = cepInput.value.replace(/\D/g, "").slice(0, 8);
  cepInput.value = digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
});

async function lookupCep() {
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    showCepFeedback("Digite um CEP válido com 8 números.", true);
    addressFields.hidden = true;
    return;
  }

  searchCep.disabled = true;
  searchCep.textContent = "Buscando...";
  showCepFeedback("Consultando o ViaCEP...");

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error("Não foi possível consultar o CEP.");

    const data = await response.json();
    if (data.erro) {
      throw new Error("CEP não encontrado. Confira os números.");
    }

    streetInput.value = data.logradouro || "Logradouro não informado";
    cityInput.value = `${data.localidade || ""}${data.uf ? ` / ${data.uf}` : ""}`;
    addressFields.hidden = false;
    showCepFeedback("CEP encontrado! Endereço preenchido.");
  } catch (error) {
    addressFields.hidden = true;
    showCepFeedback(error.message || "Falha na consulta. Tente novamente.", true);
  } finally {
    searchCep.disabled = false;
    searchCep.textContent = "Consultar";
  }
}

searchCep?.addEventListener("click", lookupCep);
cepInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    lookupCep();
  }
});

// Validação da interface do formulário de contato.
const contactForm = document.querySelector("#contactForm");
const toast = document.querySelector("#toast");
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 4500);
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const name = document.querySelector("#name").value.trim();
  showToast(`Obrigado, ${name}! Sua mensagem foi preenchida com sucesso.`);
  contactForm.reset();
  addressFields.hidden = true;
  showCepFeedback("");
});


// Formulários separados: consulta, castração e interesse em adoção.
document.querySelectorAll(".appointment-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const person = form.querySelector('input[name="nome"]')?.value.trim() || "Olá";
    let message = "Seu formulário foi preenchido com sucesso.";
    if (form.id === "form-consulta") message = `Obrigado, ${person}! Sua solicitação de consulta foi preenchida.`;
    if (form.id === "form-castracao") message = `Obrigado, ${person}! Sua solicitação de castração foi preenchida.`;
    if (form.id === "form-adocao") message = `Obrigado, ${person}! Seu interesse em adoção foi registrado nesta página.`;
    showToast(message);
    form.reset();
  });
});

// Impede a seleção de datas passadas nos formulários de agendamento.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.querySelectorAll('input[type="date"]').forEach((dateInput) => {
  dateInput.min = localToday;
});
