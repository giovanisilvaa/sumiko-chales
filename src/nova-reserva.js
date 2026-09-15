import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from './firebase.js'


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
  <label for="responsavel-reserva">
    Responsável pela reserva
  </label>

  <select
    id="responsavel-reserva"
    name="responsavelReserva"
    required
  >
    <option value="">Selecione</option>
    <option value="renato">Renato</option>
    <option value="fernanda">Fernanda</option>
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
              <label for="forma-pagamento">Pagamento do sinal</label>

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

  const botaoSalvar = form.querySelector('.save-reservation-button')

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const usuario = auth.currentUser
  const chale = Number(document.querySelector('#chale').value)
  const responsavelReserva =
  document.querySelector('#responsavel-reserva').value
  const hospede = document.querySelector('#hospede').value.trim()
  const telefone = document.querySelector('#telefone').value.trim()
  const quantidadeHospedes = Number(
    document.querySelector('#quantidade-hospedes').value,
  )
  const entrada = new Date(document.querySelector('#entrada').value)
  const saida = new Date(document.querySelector('#saida').value)
  const valorTotal = Number(
    document.querySelector('#valor-total').value,
  )
  const sinalPago = Number(
    document.querySelector('#sinal-pago').value,
  )
  const formaPagamento =
    document.querySelector('#forma-pagamento').value
  const status = document.querySelector('#status-reserva').value
  const observacoes =
    document.querySelector('#observacoes').value.trim()
  const saldoRestante = valorTotal - sinalPago

  message.classList.remove('success')
  message.textContent = ''

  if (!usuario) {
    message.textContent =
      'Sua sessão expirou. Saia do sistema e entre novamente.'
    return
  }

  if (saida <= entrada) {
    message.textContent =
      'A saída precisa acontecer depois da entrada.'
    return
  }

  if (sinalPago > valorTotal) {
    message.textContent =
      'O sinal não pode ser maior que o valor total.'
    return
  }

  botaoSalvar.disabled = true
  botaoSalvar.textContent = 'Verificando disponibilidade...'

  try {
    const consulta = query(
      collection(db, 'reservas'),
      where('chale', '==', chale),
    )

    const resultado = await getDocs(consulta)

    const existeConflito = resultado.docs.some((documento) => {
      const reserva = documento.data()

      if (
  reserva.status === 'cancelada' ||
  reserva.statusHospedagem === 'finalizado'
) {
  return false
}

      const entradaExistente = reserva.entrada.toDate()
      const saidaExistente = reserva.saida.toDate()

      return entrada < saidaExistente && saida > entradaExistente
    })

    if (existeConflito) {
      message.textContent =
        'Este chalé já possui uma reserva nesse período.'
      return
    }

    botaoSalvar.textContent = 'Salvando reserva...'

    await addDoc(collection(db, 'reservas'), {
      chale,
      responsavelReserva,
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
      statusHospedagem: 'reservado',
      observacoes,
      saldoRecebido: saldoRestante === 0,
      checkInRealizado: false,
      checkOutRealizado: false,
      limpeza: 'nao_necessaria',
      criadoPor: usuario.email,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    })

    message.classList.add('success')
    message.textContent = 'Reserva salva com sucesso!'

    form.reset()
    document.querySelector('#quantidade-hospedes').value = '1'
    document.querySelector('#sinal-pago').value = '0'
    document.querySelector('#saldo-restante').value = 'R$ 0,00'

    setTimeout(() => {
      dialog.close()
    }, 1400)
  } catch (error) {
    console.error('Erro ao salvar reserva:', error)

    message.textContent =
      'Não foi possível salvar a reserva. Verifique a conexão e tente novamente.'
  } finally {
    botaoSalvar.disabled = false
    botaoSalvar.textContent = 'Salvar reserva'
  }
})
dialog.showModal()
}