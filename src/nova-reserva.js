const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function criarOpcoesChales() {
  return Array.from({ length: 9 }, (_, indice) => indice + 2)
    .map((numero) => `<option value="${numero}">Chalé ${numero}</option>`)
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

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

export function abrirNovaReserva() {
  const formularioAnterior = document.querySelector('#reservation-dialog')

  if (formularioAnterior) {
    formularioAnterior.remove()
  }

  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <dialog id="reservation-dialog" class="reservation-dialog">
        <form id="reservation-form" class="reservation-form">
          <div class="reservation-header">
            <div>
              <p class="section-label">Cadastro</p>
              <h2>Nova reserva</h2>
              <p>Preencha os dados combinados com o hóspede.</p>
            </div>

            <button
              type="button"
              id="close-reservation-button"
              class="close-dialog-button"
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <div class="reservation-fields">
            <div class="form-group">
              <label for="chale">Chalé</label>

              <select id="chale" name="chale" required>
                <option value="">Selecione o chalé</option>
                ${criarOpcoesChales()}
              </select>
            </div>

            <div class="form-group">
              <label for="hospede">Nome do hóspede</label>

              <input
                type="text"
                id="hospede"
                name="hospede"
                placeholder="Nome completo"
                minlength="3"
                maxlength="100"
                autocomplete="name"
                required
              />
            </div>

            <div class="form-group">
              <label for="telefone">Telefone</label>

              <input
                type="tel"
                id="telefone"
                name="telefone"
                placeholder="(00) 00088-8888"
                inputmode="numeric"
                autocomplete="tel"
                maxlength="15"
                required
              />
            </div>

            <div class="form-group">
              <label for="quantidade-hospedes">Quantidade de hóspedes</label>

              <input
                type="number"
                id="quantidade-hospedes"
                name="quantidadeHospedes"
                min="1"
                max="20"
                step="1"
                value="1"
                required
              />
            </div>

            <div class="form-group">
              <label for="entrada">Entrada</label>

              <input
                type="datetime-local"
                id="entrada"
                name="entrada"
                required
              />
            </div>

            <div class="form-group">
              <label for="saida">Saída</label>

              <input
                type="datetime-local"
                id="saida"
                name="saida"
                required
              />
            </div>

            <div class="form-group">
              <label for="valor-total">Valor total</label>

              <input
                type="number"
                id="valor-total"
                name="valorTotal"
                placeholder="0,00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div class="form-group">
              <label for="sinal-pago">Sinal pago</label>

              <input
                type="number"
                id="sinal-pago"
                name="sinalPago"
                placeholder="0,00"
                min="0"
                step="0.01"
                value="0"
                required
              />
            </div>

            <div class="form-group">
             <label for="saldo-restante">Saldo a receber no check-in</label>

              <input
                type="text"
                id="saldo-restante"
                name="saldoRestante"
                value="R$ 0,00"
                readonly
              />
            </div>

            <div class="form-group">
              <label for="forma-pagamento">Forma de pagamento</label>

              <select
                id="forma-pagamento"
                name="formaPagamento"
                required
              >
                <option value="">Selecione</option>
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="transferencia">Transferência</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div class="form-group">
              <label for="status-reserva">Situação da reserva</label>

              <select id="status-reserva" name="status" required>
                <option value="confirmada">Confirmada</option>
                <option value="provisoria">Provisória</option>
              </select>
            </div>

            <div class="form-group form-group-full">
              <label for="observacoes">Observações</label>

              <textarea
                id="observacoes"
                name="observacoes"
                placeholder="Informações adicionais sobre a hospedagem"
                maxlength="500"
                rows="4"
              ></textarea>
            </div>
          </div>

          <p
            id="reservation-message"
            class="reservation-message"
            role="status"
          ></p>

          <div class="reservation-actions">
            <button
              type="button"
              id="cancel-reservation-button"
              class="cancel-reservation-button"
            >
              Cancelar
            </button>

            <button type="submit" class="save-reservation-button">
              Salvar reserva
            </button>
          </div>
        </form>
      </dialog>
    `,
  )

  const dialog = document.querySelector('#reservation-dialog')
  const form = document.querySelector('#reservation-form')
  const telefoneInput = document.querySelector('#telefone')
  const valorTotalInput = document.querySelector('#valor-total')
  const sinalPagoInput = document.querySelector('#sinal-pago')
  const saldoInput = document.querySelector('#saldo-restante')
  const message = document.querySelector('#reservation-message')
  const closeButton = document.querySelector('#close-reservation-button')
  const cancelButton = document.querySelector('#cancel-reservation-button')

  function fecharFormulario() {
    dialog.close()
  }

  function atualizarSaldo() {
    const valorTotal = Number(valorTotalInput.value) || 0
    const sinalPago = Number(sinalPagoInput.value) || 0
    const saldo = valorTotal - sinalPago

    saldoInput.value = formatadorMoeda.format(saldo)
  }

  telefoneInput.addEventListener('input', () => {
    telefoneInput.value = formatarTelefone(telefoneInput.value)
  })

  valorTotalInput.addEventListener('input', atualizarSaldo)
  sinalPagoInput.addEventListener('input', atualizarSaldo)
  closeButton.addEventListener('click', fecharFormulario)
  cancelButton.addEventListener('click', fecharFormulario)

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const entrada = new Date(form.entrada.value)
    const saida = new Date(form.saida.value)
    const valorTotal = Number(valorTotalInput.value)
    const sinalPago = Number(sinalPagoInput.value)

    if (saida <= entrada) {
      message.textContent =
        'A data e o horário de saída devem ser posteriores à entrada.'
      return
    }

    if (sinalPago > valorTotal) {
      message.textContent =
        'O sinal pago não pode ser maior que o valor total.'
      return
    }

    window.alert(
      'Formulário validado. O salvamento será conectado ao banco de dados.',
    )

    fecharFormulario()
  })

  dialog.addEventListener('close', () => {
    dialog.remove()
  })

  dialog.showModal()
}