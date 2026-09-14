import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from './firebase.js'

const emailsProprietarios = [
  'renato@sumikochales.app',
  'fernanda@sumikochales.app',
]

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function criarOpcoesChales() {
  return Array.from(
    { length: 9 },
    (_, indice) => indice + 2,
  )
    .map(
      (numero) =>
        `<option value="${numero}">Chalé ${numero}</option>`,
    )
    .join('')
}

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  if (numeros.length <= 2) {
    return numeros
  }

  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(
    2,
    7,
  )}-${numeros.slice(7)}`
}

function converterData(valor) {
  return valor?.toDate ? valor.toDate() : new Date(valor)
}

function formatarParaCampoData(valor) {
  const data = converterData(valor)
  const compensacaoFuso = data.getTimezoneOffset() * 60000

  return new Date(data.getTime() - compensacaoFuso)
    .toISOString()
    .slice(0, 16)
}

export async function abrirEditarReserva(reservaId) {
  const usuario = auth.currentUser

  if (!usuario || !emailsProprietarios.includes(usuario.email)) {
    window.alert(
      'Somente os proprietários podem editar reservas.',
    )
    return
  }

  try {
    const referencia = doc(db, 'reservas', reservaId)
    const resultado = await getDoc(referencia)

    if (!resultado.exists()) {
      window.alert('Esta reserva não foi encontrada.')
      return
    }

    const reserva = resultado.data()

    if (reserva.status === 'cancelada') {
      window.alert(
        'Uma reserva cancelada não pode ser editada.',
      )
      return
    }

    if (reserva.checkInRealizado === true) {
      window.alert(
        'Não é possível editar uma reserva após o check-in.',
      )
      return
    }

    document
      .querySelector('#edit-reservation-dialog')
      ?.remove()
          document.body.insertAdjacentHTML(
      'beforeend',
      `
        <dialog
          id="edit-reservation-dialog"
          class="reservation-dialog"
        >
          <form
            id="edit-reservation-form"
            class="reservation-form"
          >
            <div class="reservation-header">
              <div>
                <p class="section-label">Alteração</p>
                <h2>Editar reserva</h2>
                <p>Atualize os dados combinados com o hóspede.</p>
              </div>

              <button
                type="button"
                id="close-edit-reservation-button"
                class="close-dialog-button"
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <div class="reservation-fields">
              <div class="form-group">
                <label for="edit-chale">Chalé</label>
                <select id="edit-chale" required>
                  ${criarOpcoesChales()}
                </select>
              </div>

              <div class="form-group">
                <label for="edit-hospede">
                  Nome do hóspede
                </label>
                <input
                  type="text"
                  id="edit-hospede"
                  minlength="3"
                  maxlength="100"
                  autocomplete="name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-telefone">Telefone</label>
                <input
                  type="tel"
                  id="edit-telefone"
                  inputmode="numeric"
                  autocomplete="tel"
                  maxlength="15"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-quantidade-hospedes">
                  Quantidade de hóspedes
                </label>
                <input
                  type="number"
                  id="edit-quantidade-hospedes"
                  min="1"
                  max="20"
                  step="1"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-entrada">Entrada</label>
                <input
                  type="datetime-local"
                  id="edit-entrada"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-saida">Saída</label>
                <input
                  type="datetime-local"
                  id="edit-saida"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-valor-total">
                  Valor total
                </label>
                <input
                  type="number"
                  id="edit-valor-total"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-sinal-pago">
                  Sinal pago
                </label>
                <input
                  type="number"
                  id="edit-sinal-pago"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="form-group">
                <label for="edit-saldo-restante">
                  Saldo a receber no check-in
                </label>
                <input
                  type="text"
                  id="edit-saldo-restante"
                  readonly
                />
              </div>

              <div class="form-group">
                <label for="edit-forma-pagamento">
                  Pagamento do sinal
                </label>
                <select id="edit-forma-pagamento" required>
                  <option value="">Selecione</option>
                  <option value="pix">Pix</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="transferencia">
                    Transferência
                  </option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit-status-reserva">
                  Situação da reserva
                </label>
                <select id="edit-status-reserva" required>
                  <option value="confirmada">
                    Confirmada
                  </option>
                  <option value="provisoria">
                    Provisória
                  </option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label for="edit-observacoes">
                  Observações
                </label>
                <textarea
                  id="edit-observacoes"
                  maxlength="500"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <p
              id="edit-reservation-message"
              class="reservation-message"
              role="status"
            ></p>

            <div class="reservation-actions">
              <button
                type="button"
                id="cancel-edit-reservation-button"
                class="cancel-reservation-button"
              >
                Voltar
              </button>

              <button
                type="submit"
                class="save-reservation-button"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </dialog>
      `,
    )

    const dialog = document.querySelector(
      '#edit-reservation-dialog',
    )
    const form = document.querySelector(
      '#edit-reservation-form',
    )
    const chaleInput =
      document.querySelector('#edit-chale')
    const hospedeInput =
      document.querySelector('#edit-hospede')
    const telefoneInput =
      document.querySelector('#edit-telefone')
    const quantidadeInput = document.querySelector(
      '#edit-quantidade-hospedes',
    )
    const entradaInput =
      document.querySelector('#edit-entrada')
    const saidaInput =
      document.querySelector('#edit-saida')
    const valorTotalInput = document.querySelector(
      '#edit-valor-total',
    )
    const sinalPagoInput = document.querySelector(
      '#edit-sinal-pago',
    )
    const saldoInput = document.querySelector(
      '#edit-saldo-restante',
    )
    const formaPagamentoInput = document.querySelector(
      '#edit-forma-pagamento',
    )
    const statusInput = document.querySelector(
      '#edit-status-reserva',
    )
    const observacoesInput = document.querySelector(
      '#edit-observacoes',
    )
    const mensagem = document.querySelector(
      '#edit-reservation-message',
    )
    const botaoSalvar = form.querySelector(
      '.save-reservation-button',
    )
        chaleInput.value = String(reserva.chale)
    hospedeInput.value = reserva.hospede || ''
    telefoneInput.value = reserva.telefone || ''
    quantidadeInput.value = String(
      reserva.quantidadeHospedes || 1,
    )
    entradaInput.value = formatarParaCampoData(
      reserva.entrada,
    )
    saidaInput.value = formatarParaCampoData(reserva.saida)
    valorTotalInput.value = String(reserva.valorTotal || 0)
    sinalPagoInput.value = String(reserva.sinalPago || 0)
    formaPagamentoInput.value =
      reserva.formaPagamentoSinal || ''
    statusInput.value = reserva.status || 'confirmada'
    observacoesInput.value = reserva.observacoes || ''

    function atualizarSaldo() {
      const valorTotal =
        Number(valorTotalInput.value) || 0
      const sinalPago =
        Number(sinalPagoInput.value) || 0

      saldoInput.value = formatadorMoeda.format(
        valorTotal - sinalPago,
      )
    }

    function fecharFormulario() {
      dialog.close()
    }

    atualizarSaldo()

    telefoneInput.addEventListener('input', () => {
      telefoneInput.value = formatarTelefone(
        telefoneInput.value,
      )
    })

    valorTotalInput.addEventListener(
      'input',
      atualizarSaldo,
    )

    sinalPagoInput.addEventListener(
      'input',
      atualizarSaldo,
    )

    document
      .querySelector('#close-edit-reservation-button')
      .addEventListener('click', fecharFormulario)

    document
      .querySelector('#cancel-edit-reservation-button')
      .addEventListener('click', fecharFormulario)

    dialog.addEventListener('close', () => {
      dialog.remove()
    })

    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const chale = Number(chaleInput.value)
      const hospede = hospedeInput.value.trim()
      const telefone = telefoneInput.value.trim()
      const quantidadeHospedes = Number(
        quantidadeInput.value,
      )
      const entrada = new Date(entradaInput.value)
      const saida = new Date(saidaInput.value)
      const valorTotal = Number(valorTotalInput.value)
      const sinalPago = Number(sinalPagoInput.value)
      const saldoRestante = valorTotal - sinalPago
      const formaPagamento = formaPagamentoInput.value
      const status = statusInput.value
      const observacoes = observacoesInput.value.trim()

      mensagem.classList.remove('success')
      mensagem.textContent = ''

      if (saida <= entrada) {
        mensagem.textContent =
          'A saída precisa acontecer depois da entrada.'
        return
      }

      if (sinalPago > valorTotal) {
        mensagem.textContent =
          'O sinal não pode ser maior que o valor total.'
        return
      }

      botaoSalvar.disabled = true
      botaoSalvar.textContent =
        'Verificando disponibilidade...'

      try {
        const consulta = query(
          collection(db, 'reservas'),
          where('chale', '==', chale),
        )

        const reservasDoChale = await getDocs(consulta)

        const existeConflito = reservasDoChale.docs.some(
          (documento) => {
            if (documento.id === reservaId) {
              return false
            }

            const outraReserva = documento.data()

           if (
  outraReserva.status === 'cancelada' ||
  outraReserva.statusHospedagem === 'finalizado'
) {
  return false
}

            const outraEntrada = converterData(
              outraReserva.entrada,
            )
            const outraSaida = converterData(
              outraReserva.saida,
            )

            return (
              entrada < outraSaida &&
              saida > outraEntrada
            )
          },
        )

        if (existeConflito) {
          mensagem.textContent =
            'Este chalé já possui uma reserva nesse período.'
          return
        }

        botaoSalvar.textContent = 'Salvando alterações...'

        await updateDoc(referencia, {
          chale,
          hospede,
          telefone,
          quantidadeHospedes,
          entrada,
          saida,
          valorTotal,
          sinalPago,
          saldoRestante,
          formaPagamentoSinal: formaPagamento,
          status,
          observacoes,
          saldoRecebido: saldoRestante === 0,
          atualizadoPor: usuario.email,
          atualizadoEm: serverTimestamp(),
        })

        mensagem.classList.add('success')
        mensagem.textContent =
          'Reserva atualizada com sucesso!'

        setTimeout(() => {
          dialog.close()
        }, 1200)
      } catch (error) {
        console.error('Erro ao editar reserva:', error)

        mensagem.textContent =
          'Não foi possível atualizar a reserva.'
      } finally {
        botaoSalvar.disabled = false
        botaoSalvar.textContent = 'Salvar alterações'
      }
    })

    dialog.showModal()
  } catch (error) {
    console.error(
      'Erro ao abrir edição da reserva:',
      error,
    )

    window.alert(
      'Não foi possível abrir a edição da reserva.',
    )
  }
}