import {
  collection,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase.js'
import { abrirDetalhesReserva } from './detalhes-reserva.js'

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function converterData(valor) {
  return valor?.toDate ? valor.toDate() : new Date(valor)
}

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function obterSituacao(reserva) {
  if (reserva.status === 'cancelada') {
    return {
      codigo: 'cancelada',
      texto: 'Cancelada',
    }
  }

  if (
    reserva.checkOutRealizado === true &&
    reserva.limpeza === 'concluida'
  ) {
    return {
      codigo: 'finalizada',
      texto: 'Finalizada',
    }
  }

  if (
    reserva.checkOutRealizado === true &&
    reserva.limpeza === 'pendente'
  ) {
    return {
      codigo: 'limpeza',
      texto: 'Aguardando limpeza',
    }
  }

  if (reserva.checkInRealizado === true) {
    return {
      codigo: 'hospedado',
      texto: 'Hospedado',
    }
  }

  if (reserva.status === 'provisoria') {
    return {
      codigo: 'provisoria',
      texto: 'Provisória',
    }
  }

  return {
    codigo: 'confirmada',
    texto: 'Confirmada',
  }
}

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

function ordenarReservas(reservas) {
  return [...reservas].sort(
    (primeira, segunda) =>
      converterData(primeira.entrada) -
      converterData(segunda.entrada),
  )
}

function criarCartaoReserva(reserva) {
  const situacao = obterSituacao(reserva)

  return `
    <article class="reservation-list-card">
      <div class="reservation-list-card-header">
        <div>
          <span>Chalé ${reserva.chale}</span>
          <h3>
            ${reserva.hospede || 'Hóspede não informado'}
          </h3>
        </div>

        <span
          class="reservation-status status-${situacao.codigo}"
        >
          ${situacao.texto}
        </span>
      </div>

      <div class="reservation-list-dates">
        <p>
          <span>Entrada</span>
          <strong>
            ${formatadorData.format(
              converterData(reserva.entrada),
            )}
          </strong>
        </p>

        <p>
          <span>Saída</span>
          <strong>
            ${formatadorData.format(
              converterData(reserva.saida),
            )}
          </strong>
        </p>
      </div>

      <button
        type="button"
        class="open-reservation-details-button"
        data-reserva-id="${reserva.id}"
      >
        Ver detalhes
      </button>
    </article>
  `
}
export function abrirListaReservas() {
  document
    .querySelector('#reservation-list-dialog')
    ?.remove()

  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <dialog
        id="reservation-list-dialog"
        class="reservation-list-dialog"
      >
        <div class="reservation-list-content">
          <div class="reservation-list-header">
            <div>
              <p class="section-label">Hospedagens</p>
              <h2>Todas as reservas</h2>
              <p>
                Pesquise e acompanhe as reservas cadastradas.
              </p>
            </div>

            <button
              type="button"
              id="close-reservation-list-button"
              class="close-dialog-button"
              aria-label="Fechar lista de reservas"
            >
              ×
            </button>
          </div>

          <section class="reservation-list-filters">
            <div
              class="form-group reservation-search-group"
            >
              <label for="reservation-search">
                Pesquisar
              </label>

              <input
                type="search"
                id="reservation-search"
                placeholder="Nome do hóspede"
                autocomplete="off"
              />
            </div>

            <div class="form-group">
              <label for="reservation-chale-filter">
                Chalé
              </label>

              <select id="reservation-chale-filter">
                <option value="">Todos</option>
                ${criarOpcoesChales()}
              </select>
            </div>

            <div class="form-group">
              <label for="reservation-status-filter">
                Situação
              </label>

              <select id="reservation-status-filter">
                <option value="">Todas</option>
                <option value="confirmada">
                  Confirmada
                </option>
                <option value="provisoria">
                  Provisória
                </option>
                <option value="hospedado">
                  Hospedado
                </option>
                <option value="limpeza">
                  Aguardando limpeza
                </option>
                <option value="finalizada">
                  Finalizada
                </option>
                <option value="cancelada">
                  Cancelada
                </option>
              </select>
            </div>
          </section>

          <p
            id="reservation-list-count"
            class="reservation-list-count"
          >
            Carregando reservas...
          </p>

          <section
            id="reservation-list-results"
            class="reservation-list-results"
            aria-live="polite"
          ></section>
        </div>
      </dialog>
    `,
  )

  const dialog = document.querySelector(
    '#reservation-list-dialog',
  )
  const pesquisa = document.querySelector(
    '#reservation-search',
  )
  const filtroChale = document.querySelector(
    '#reservation-chale-filter',
  )
  const filtroSituacao = document.querySelector(
    '#reservation-status-filter',
  )
  const contador = document.querySelector(
    '#reservation-list-count',
  )
  const resultados = document.querySelector(
    '#reservation-list-results',
  )

  let reservas = []
    function renderizarReservas() {
    const textoPesquisado = normalizarTexto(
      pesquisa.value,
    )
    const chaleSelecionado = filtroChale.value
    const situacaoSelecionada = filtroSituacao.value

    const reservasFiltradas = ordenarReservas(
      reservas,
    ).filter((reserva) => {
      const correspondePesquisa = normalizarTexto(
        reserva.hospede,
      ).includes(textoPesquisado)

      const correspondeChale =
        !chaleSelecionado ||
        String(reserva.chale) === chaleSelecionado

      const correspondeSituacao =
        !situacaoSelecionada ||
        obterSituacao(reserva).codigo ===
          situacaoSelecionada

      return (
        correspondePesquisa &&
        correspondeChale &&
        correspondeSituacao
      )
    })

    contador.textContent =
      `${reservasFiltradas.length} reserva(s) encontrada(s)`

    if (reservasFiltradas.length === 0) {
      resultados.innerHTML = `
        <div class="reservation-list-empty">
          <strong>Nenhuma reserva encontrada</strong>
          <span>Tente alterar os filtros da pesquisa.</span>
        </div>
      `
      return
    }

    resultados.innerHTML = reservasFiltradas
      .map(criarCartaoReserva)
      .join('')

    resultados
      .querySelectorAll(
        '.open-reservation-details-button',
      )
      .forEach((botao) => {
        botao.addEventListener('click', () => {
          dialog.close()

          abrirDetalhesReserva(
            botao.dataset.reservaId,
          )
        })
      })
  }

  pesquisa.addEventListener(
    'input',
    renderizarReservas,
  )

  filtroChale.addEventListener(
    'change',
    renderizarReservas,
  )

  filtroSituacao.addEventListener(
    'change',
    renderizarReservas,
  )

  const pararEscuta = onSnapshot(
    collection(db, 'reservas'),
    (resultado) => {
      reservas = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))

      renderizarReservas()
    },
    (error) => {
      console.error(
        'Erro ao carregar lista de reservas:',
        error,
      )

      contador.textContent =
        'Não foi possível carregar as reservas.'
      resultados.innerHTML = ''
    },
  )

  document
    .querySelector('#close-reservation-list-button')
    .addEventListener('click', () => {
      dialog.close()
    })

  dialog.addEventListener('close', () => {
    pararEscuta()
    dialog.remove()
  })

  dialog.showModal()
}