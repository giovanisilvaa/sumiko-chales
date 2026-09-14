import { abrirDetalhesReserva } from './detalhes-reserva.js'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from './firebase.js'

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function converterData(valor) {
  if (valor?.toDate) {
    return valor.toDate()
  }

  return new Date(valor)
}

function mesmoDia(dataA, dataB) {
  return (
    dataA.getDate() === dataB.getDate() &&
    dataA.getMonth() === dataB.getMonth() &&
    dataA.getFullYear() === dataB.getFullYear()
  )
}

function atualizarNumero(seletor, valor) {
  const elemento = document.querySelector(seletor)

  if (elemento) {
    elemento.textContent = valor
  }
}

function atualizarInformacao(elemento, titulo, detalhe) {
  elemento.replaceChildren()

  const paragrafo = document.createElement('p')
  const textoMenor = document.createElement('small')

  paragrafo.textContent = titulo
  textoMenor.textContent = detalhe

  elemento.append(paragrafo, textoMenor)
}

function deixarChaleLivre(cartao) {
  const badge = cartao.querySelector('.status-badge')
  const informacao = cartao.querySelector('.chale-information')

  cartao.classList.remove(
  'chale-ocupado',
  'chale-reservado',
  'chale-clickable',
)

delete cartao.dataset.reservaId
cartao.onclick = null
  badge.className = 'status-badge status-livre'
  badge.textContent = 'Livre'

  atualizarInformacao(
    informacao,
    'Disponível para reserva',
    'Nenhuma hospedagem em andamento',
  )
}

function mostrarChaleOcupado(cartao, reserva) {
  const badge = cartao.querySelector('.status-badge')
  const informacao = cartao.querySelector('.chale-information')
  const saida = converterData(reserva.saida)

  cartao.classList.remove('chale-reservado')
  cartao.classList.add('chale-ocupado')

  badge.className = 'status-badge status-ocupado'
  badge.textContent = 'Ocupado'

  atualizarInformacao(
    informacao,
    reserva.hospede,
    `Saída: ${formatadorData.format(saida)}`,
  )
  cartao.classList.add('chale-clickable')
cartao.dataset.reservaId = reserva.id
cartao.onclick = () => abrirDetalhesReserva(reserva.id)
}

function mostrarProximaReserva(cartao, reserva) {
  const badge = cartao.querySelector('.status-badge')
  const informacao = cartao.querySelector('.chale-information')
  const entrada = converterData(reserva.entrada)

  cartao.classList.remove('chale-ocupado')
  cartao.classList.add('chale-reservado')

  badge.className = 'status-badge status-reservado'
  badge.textContent =
    reserva.status === 'provisoria' ? 'Provisória' : 'Reservado'

  atualizarInformacao(
    informacao,
    reserva.hospede,
    `Entrada: ${formatadorData.format(entrada)}`,
  )
  cartao.classList.add('chale-clickable')
cartao.dataset.reservaId = reserva.id
cartao.onclick = () => abrirDetalhesReserva(reserva.id)
}

function atualizarCartoes(reservas, agora) {
  for (let numero = 2; numero <= 10; numero += 1) {
    const cartao = document.querySelector(
      `[data-chale="${numero}"]`,
    )

    if (!cartao) {
      continue
    }

    const reservasDoChale = reservas.filter(
      (reserva) => reserva.chale === numero,
    )

    const reservaAtual = reservasDoChale.find((reserva) => {
      const entrada = converterData(reserva.entrada)
      const saida = converterData(reserva.saida)

      return entrada <= agora && saida > agora
    })

    if (reservaAtual) {
      mostrarChaleOcupado(cartao, reservaAtual)
      continue
    }

    const proximaReserva = reservasDoChale.find((reserva) => {
      const entrada = converterData(reserva.entrada)

      return entrada > agora
    })

    if (proximaReserva) {
      mostrarProximaReserva(cartao, proximaReserva)
      continue
    }

    deixarChaleLivre(cartao)
  }
}

function atualizarResumo(reservas, agora) {
  const reservasAtivas = reservas.filter((reserva) => {
    const entrada = converterData(reserva.entrada)
    const saida = converterData(reserva.saida)

    return entrada <= agora && saida > agora
  })

  const chalesOcupados = new Set(
    reservasAtivas.map((reserva) => reserva.chale),
  ).size

  const entradasHoje = reservas.filter((reserva) =>
    mesmoDia(converterData(reserva.entrada), agora),
  ).length

  const saidasHoje = reservas.filter((reserva) =>
    mesmoDia(converterData(reserva.saida), agora),
  ).length

  atualizarNumero('#summary-available', 9 - chalesOcupados)
  atualizarNumero('#summary-occupied', chalesOcupados)
  atualizarNumero('#summary-entries', entradasHoje)
  atualizarNumero('#summary-exits', saidasHoje)
}

export function iniciarReservasEmTempoReal() {
  const consultaReservas = query(
    collection(db, 'reservas'),
    orderBy('entrada', 'asc'),
  )

  return onSnapshot(
    consultaReservas,
    (resultado) => {
      const reservas = resultado.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((reserva) => reserva.status !== 'cancelada')

      const agora = new Date()

      atualizarResumo(reservas, agora)
      atualizarCartoes(reservas, agora)

      const aviso = document.querySelector('.demo-warning')

      if (aviso) {
        aviso.textContent =
          'Dados atualizados automaticamente pelo Firebase.'
        aviso.classList.add('connected')
      }
    },
    (error) => {
      console.error('Erro ao acompanhar reservas:', error)

      const aviso = document.querySelector('.demo-warning')

      if (aviso) {
        aviso.textContent =
          'Não foi possível atualizar as reservas em tempo real.'
      }
    },
  )
}