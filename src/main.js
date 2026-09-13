import './style.css'

document.querySelector('#app').innerHTML = `
  <main class="login-page">
    <section class="login-image" aria-label="Fachada do Sumiko Chalés">
      <div class="image-overlay">
        <p class="location">Ubatuba • São Paulo</p>
        <h1>Gestão simples para cuidar de cada hospedagem.</h1>
        <p>
          Reservas, entradas, saídas e organização dos chalés em um só lugar.
        </p>
      </div>
    </section>

    <section class="login-area">
      <div class="login-card">
        <img
          class="logo"
          src="/images/logo-sumiko.jfif"
          alt="Logotipo do Sumiko Chalés"
        />

        <div class="login-heading">
          <h2>Bem-vindo</h2>
          <p>Selecione seu nome e informe sua senha numérica.</p>
        </div>

        <form id="login-form">
          <div class="form-group">
            <d<label for="usuario">Usuário</label>

            <select id="usuario" name="usuario" required>
              <option value="">Selecione seu nome</option>
              <option value="renato">Renato — Proprietário</option>
              <option value="fernanda">Fernanda — Proprietária</option>
              <option value="giovani">Giovani — Zelador</option>
            </select>
          </div>

          <div class="form-group">
            <label for="pin">Senha numérica</label>

            <input
              type="password"
              id="pin"
              name="pin"
              placeholder="Digite os 6 números"
              inputmode="numeric"
              pattern="[0-9]{6}"
              minlength="6"
              maxlength="6"
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit">Entrar</button>

          <p id="login-message" class="login-message" role="status"></p>
        </form>

        <p class="footer-text">
          Sistema interno de gestão • Sumiko Chalés
        </p>
      </div>
    </section>
  </main>
`

const loginForm = document.querySelector('#login-form')
const pinInput = document.querySelector('#pin')
const loginMessage = document.querySelector('#login-message')

pinInput.addEventListener('input', () => {
  pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 6)
})

loginForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const usuarioSelecionado =
    document.querySelector('#usuario').selectedOptions[0].text

  loginMessage.textContent =
    `Acesso de ${usuarioSelecionado} pronto. A autenticação será conectada ao Firebase.`
})