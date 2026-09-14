import './style.css'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase.js'
import { renderDashboard } from './dashboard.js'

const emailsUsuarios = {
  renato: 'renato@sumikochales.app',
  fernanda: 'fernanda@sumikochales.app',
  giovani: 'giovani@sumikochales.app',
}

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
            <label for="usuario">Usuário</label>

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

          <button type="submit" id="login-button">Entrar</button>

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
const loginButton = document.querySelector('#login-button')
const loginMessage = document.querySelector('#login-message')

pinInput.addEventListener('input', () => {
  pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 6)
})

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const usuarioId = document.querySelector('#usuario').value
  const email = emailsUsuarios[usuarioId]
  const pin = pinInput.value

  loginMessage.classList.remove('login-error')
  loginMessage.textContent = 'Verificando acesso...'
  loginButton.disabled = true
  loginButton.textContent = 'Entrando...'

  try {
    await signInWithEmailAndPassword(auth, email, pin)
  } catch (error) {
    console.error('Falha no acesso:', error.code)

    loginMessage.classList.add('login-error')
    loginMessage.textContent =
      'Usuário ou senha incorretos. Verifique os dados e tente novamente.'

    pinInput.select()
  } finally {
    loginButton.disabled = false
    loginButton.textContent = 'Entrar'
  }
})

onAuthStateChanged(auth, (usuarioFirebase) => {
 if (!usuarioFirebase) {
  return
}

  const usuarioEncontrado = Object.entries(emailsUsuarios).find(
    ([, email]) => email === usuarioFirebase.email,
  )

  if (usuarioEncontrado) {
    const [usuarioId] = usuarioEncontrado
    renderDashboard(usuarioId)
  }
})