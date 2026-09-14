import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { auth } from './firebase.js'

function permitirSomenteNumeros(input) {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 6)
  })
}

function mensagemDoErro(codigo) {
  if (
    codigo === 'auth/invalid-credential' ||
    codigo === 'auth/wrong-password'
  ) {
    return 'O PIN atual está incorreto.'
  }

  if (codigo === 'auth/weak-password') {
    return 'O novo PIN precisa ter seis números.'
  }

  if (codigo === 'auth/too-many-requests') {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }

  if (codigo === 'auth/requires-recent-login') {
    return 'Saia do sistema, entre novamente e tente alterar o PIN.'
  }

  return 'Não foi possível alterar o PIN. Tente novamente.'
}

export function abrirAlteracaoPin() {
  const dialogAnterior = document.querySelector('#pin-dialog')

  if (dialogAnterior) {
    dialogAnterior.remove()
  }

  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <dialog id="pin-dialog" class="pin-dialog">
        <form id="pin-form" class="pin-form">
          <div class="pin-header">
            <div>
              <p class="section-label">Segurança</p>
              <h2>Alterar PIN</h2>
              <p>Escolha uma nova senha numérica de seis dígitos.</p>
            </div>

            <button
              type="button"
              id="close-pin-button"
              class="close-dialog-button"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <div class="form-group">
            <label for="pin-atual">PIN atual</label>

            <input
              type="password"
              id="pin-atual"
              inputmode="numeric"
              pattern="[0-9]{6}"
              minlength="6"
              maxlength="6"
              placeholder="Digite o PIN atual"
              autocomplete="current-password"
              required
            />
          </div>

          <div class="form-group">
            <label for="novo-pin">Novo PIN</label>

            <input
              type="password"
              id="novo-pin"
              inputmode="numeric"
              pattern="[0-9]{6}"
              minlength="6"
              maxlength="6"
              placeholder="Digite o novo PIN"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmar-pin">Confirmar novo PIN</label>

            <input
              type="password"
              id="confirmar-pin"
              inputmode="numeric"
              pattern="[0-9]{6}"
              minlength="6"
              maxlength="6"
              placeholder="Repita o novo PIN"
              autocomplete="new-password"
              required
            />
          </div>

          <p id="pin-message" class="pin-message" role="status"></p>

          <div class="pin-actions">
            <button
              type="button"
              id="cancel-pin-button"
              class="cancel-reservation-button"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="save-pin-button"
              class="save-reservation-button"
            >
              Alterar PIN
            </button>
          </div>
        </form>
      </dialog>
    `,
  )

  const dialog = document.querySelector('#pin-dialog')
  const form = document.querySelector('#pin-form')
  const pinAtualInput = document.querySelector('#pin-atual')
  const novoPinInput = document.querySelector('#novo-pin')
  const confirmarPinInput = document.querySelector('#confirmar-pin')
  const mensagem = document.querySelector('#pin-message')
  const saveButton = document.querySelector('#save-pin-button')

  permitirSomenteNumeros(pinAtualInput)
  permitirSomenteNumeros(novoPinInput)
  permitirSomenteNumeros(confirmarPinInput)

  function fecharDialog() {
    dialog.close()
  }

  document
    .querySelector('#close-pin-button')
    .addEventListener('click', fecharDialog)

  document
    .querySelector('#cancel-pin-button')
    .addEventListener('click', fecharDialog)

  dialog.addEventListener('close', () => {
    dialog.remove()
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const usuario = auth.currentUser
    const pinAtual = pinAtualInput.value
    const novoPin = novoPinInput.value
    const confirmarPin = confirmarPinInput.value

    mensagem.classList.remove('success')
    mensagem.textContent = ''

    if (!usuario || !usuario.email) {
      mensagem.textContent = 'Não foi possível identificar o usuário.'
      return
    }

    if (novoPin !== confirmarPin) {
      mensagem.textContent = 'A confirmação do novo PIN está diferente.'
      return
    }

    if (novoPin === pinAtual) {
      mensagem.textContent = 'O novo PIN deve ser diferente do atual.'
      return
    }

    saveButton.disabled = true
    saveButton.textContent = 'Alterando...'

    try {
      const credencial = EmailAuthProvider.credential(
        usuario.email,
        pinAtual,
      )

      await reauthenticateWithCredential(usuario, credencial)
      await updatePassword(usuario, novoPin)

      mensagem.classList.add('success')
      mensagem.textContent = 'PIN alterado com sucesso.'

      form.reset()

      setTimeout(() => {
        dialog.close()
      }, 1500)
    } catch (error) {
      console.error('Erro ao alterar PIN:', error.code)
      mensagem.textContent = mensagemDoErro(error.code)
    } finally {
      saveButton.disabled = false
      saveButton.textContent = 'Alterar PIN'
    }
  })

  dialog.showModal()
  pinAtualInput.focus()
}