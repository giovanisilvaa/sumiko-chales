import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase.js'

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function converterData(valor) {
  return valor?.toDate ? valor.toDate() : new Date(valor)
}

function definirTexto(seletor, texto) {
  const elemento = document.querySelector(seletor)

  if (elemento) {
    elemento.textContent = texto
  }
}

function nomeFormaPagamento(valor) {
  const formas = {
    pix: 'Pix',
    dinheiro: 'Dinheiro',
    cartao: 'Cartão',
    transferencia: 'Transferência',
    outro: 'Outro',
    sem_saldo: 'Sem saldo pendente',
  }

  return formas[valor] || 'Não informado'
}

export async function abrirDetalhesReserva(reservaId) {
  try {
    const referencia = doc(db, 'reservas', reservaId)
    const resultado = await getDoc(referencia)

    if (!resultado.exists()) {
      window.alert('Esta reserva não foi encontrada.')
      return
    }

    const reserva = resultado.data()
    const usuario = auth.currentUser
    const eZelador =
      usuario?.email === 'giovani@sumikochales.app'

    const saldoRestante = Number(reserva.saldoRestante) || 0
    const checkInRealizado = reserva.checkInRealizado === true
    const pagamentoCompleto =
      reserva.saldoRecebido === true || saldoRestante === 0

    const dialogAnterior =
      document.querySelector('#reservation-details-dialog')

    if (dialogAnterior) {
      dialogAnterior.remove()
    }

    document.body.insertAdjacentHTML(
      'beforeend',
      `
        <dialog
          id="reservation-details-dialog"
          class="details-dialog"
        >
          <div class="details-content">
            <div class="details-header">
              <div>
                <p class="section-label">Hospedagem</p>
                <h2>Detalhes da reserva</h2>
                <p id="details-status"></p>
              </div>

              <button
                type="button"
                id="close-details-button"
                class="close-dialog-button"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <section class="details-grid">
              <div class="detail-item">
                <span>Hóspede</span>
                <strong id="details-guest"></strong>
              </div>

              <div class="detail-item">
                <span>Telefone</span>
                <strong id="details-phone"></strong>
              </div>

              <div class="detail-item">
                <span>Chalé</span>
                <strong id="details-chale"></strong>
              </div>

              <div class="detail-item">
                <span>Quantidade de hóspedes</span>
                <strong id="details-people"></strong>
              </div>

              <div class="detail-item">
                <span>Entrada</span>
                <strong id="details-entry"></strong>
              </div>

              <div class="detail-item">
                <span>Saída</span>
                <strong id="details-exit"></strong>
              </div>
            </section>

            <section class="financial-details">
              <div>
                <span>Valor total</span>
                <strong id="details-total"></strong>
              </div>

              <div>
                <span>Sinal pago</span>
                <strong id="details-deposit"></strong>
              </div>

              <div class="balance-detail">
                <span>Saldo do check-in</span>
                <strong id="details-balance"></strong>
              </div>
            </section>

            <section class="details-observation">
              <span>Observações</span>
              <p id="details-observation"></p>
            </section>

            <section id="checkin-area" class="checkin-area"></section>

            <div class="details-actions">
              <button
                type="button"
                id="back-details-button"
                class="cancel-reservation-button"
              >
                Fechar
              </button>
            </div>
          </div>
        </dialog>
      `,
    )

    const dialog = document.querySelector(
      '#reservation-details-dialog',
    )

    definirTexto('#details-guest', reserva.hospede)
    definirTexto('#details-phone', reserva.telefone)
    definirTexto('#details-chale', `Chalé ${reserva.chale}`)
    definirTexto(
      '#details-people',
      String(reserva.quantidadeHospedes),
    )
    definirTexto(
      '#details-entry',
      dataHora.format(converterData(reserva.entrada)),
    )
    definirTexto(
      '#details-exit',
      dataHora.format(converterData(reserva.saida)),
    )
    definirTexto(
      '#details-total',
      moeda.format(reserva.valorTotal),
    )
    definirTexto(
      '#details-deposit',
      moeda.format(reserva.sinalPago),
    )
    definirTexto(
      '#details-balance',
      moeda.format(saldoRestante),
    )
    definirTexto(
      '#details-observation',
      reserva.observacoes || 'Nenhuma observação.',
    )

    definirTexto(
      '#details-status',
      checkInRealizado
        ? 'Check-in realizado'
        : 'Aguardando check-in',
    )

    const checkinArea = document.querySelector('#checkin-area')

    if (checkInRealizado) {
      checkinArea.innerHTML = `
        <div class="checkin-confirmed">
          <strong>✓ Check-in confirmado</strong>
          <span>
            ${
              pagamentoCompleto
                ? 'Pagamento confirmado'
                : 'Existe saldo pendente'
            }
          </span>
        </div>
      `
    } else if (eZelador) {
      checkinArea.innerHTML = `
        <form id="checkin-form">
          <div class="checkin-heading">
            <div>
              <span>Operação do zelador</span>
              <h3>Confirmar check-in</h3>
            </div>

            <strong>${moeda.format(saldoRestante)}</strong>
          </div>

          ${
            saldoRestante > 0
              ? `
                <div class="form-group">
                  <label for="balance-payment">
                    Forma de recebimento do saldo
                  </label>

                  <select id="balance-payment" required>
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
              `
              : `
                <p class="paid-message">
                  A reserva já está totalmente paga.
                </p>
              `
          }

          <p
            id="checkin-message"
            class="checkin-message"
            role="status"
          ></p>

          <button
            type="submit"
            id="confirm-checkin-button"
            class="confirm-checkin-button"
          >
            Confirmar check-in e recebimento
          </button>
        </form>
      `

      const checkinForm =
        document.querySelector('#checkin-form')
      const checkinMessage =
        document.querySelector('#checkin-message')
      const confirmButton =
        document.querySelector('#confirm-checkin-button')

      checkinForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const campoPagamento =
          document.querySelector('#balance-payment')

        const formaPagamento =
          saldoRestante > 0
            ? campoPagamento.value
            : 'sem_saldo'

        confirmButton.disabled = true
        confirmButton.textContent = 'Confirmando...'
        checkinMessage.textContent = ''

        try {
          await updateDoc(referencia, {
            checkInRealizado: true,
            statusHospedagem: 'hospedado',
            saldoRecebido: true,
            saldoRecebidoEm: serverTimestamp(),
            saldoRecebidoPor: usuario.email,
            formaPagamentoSaldo: formaPagamento,
            atualizadoEm: serverTimestamp(),
          })

          checkinMessage.classList.add('success')
          checkinMessage.textContent =
            'Check-in e pagamento confirmados.'

          setTimeout(() => {
            dialog.close()
          }, 1400)
        } catch (error) {
          console.error('Erro ao confirmar check-in:', error)

          checkinMessage.textContent =
            'Não foi possível confirmar o check-in.'
        } finally {
          confirmButton.disabled = false
          confirmButton.textContent =
            'Confirmar check-in e recebimento'
        }
      })
    } else {
      checkinArea.innerHTML = `
        <div class="checkin-waiting">
          <strong>Aguardando o zelador</strong>
          <span>
            O check-in e o recebimento do saldo ainda não foram confirmados.
          </span>
        </div>
      `
    }

    function fecharDetalhes() {
      dialog.close()
    }

    document
      .querySelector('#close-details-button')
      .addEventListener('click', fecharDetalhes)

    document
      .querySelector('#back-details-button')
      .addEventListener('click', fecharDetalhes)

    dialog.addEventListener('close', () => {
      dialog.remove()
    })

    dialog.showModal()
  } catch (error) {
    console.error('Erro ao abrir reserva:', error)
    window.alert('Não foi possível abrir os detalhes da reserva.')
  }
}