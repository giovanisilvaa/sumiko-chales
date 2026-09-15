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
  'chale-limpeza',
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

  cartao.classList.remove(
  'chale-reservado',
  'chale-limpeza',
)
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

function mostrarAguardandoLimpeza(cartao, reserva) {
  const badge = cartao.querySelector('.status-badge')
  const informacao = cartao.querySelector('.chale-information')

  cartao.classList.remove('chale-ocupado', 'chale-reservado')
  cartao.classList.add(
    'chale-limpeza',
    'chale-clickable',
  )

  badge.className = 'status-badge status-limpeza'
  badge.textContent = 'Limpeza'

  atualizarInformacao(
    informacao,
    'Check-out realizado',
    'Aguardando limpeza do chalé',
  )

  cartao.dataset.reservaId = reserva.id
  cartao.onclick = () => abrirDetalhesReserva(reserva.id)
}

function mostrarProximaReserva(cartao, reserva) {
  const badge = cartao.querySelector('.status-badge')
  const informacao = cartao.querySelector('.chale-information')
  const entrada = converterData(reserva.entrada)

  cartao.classList.remove(
  'chale-ocupado',
  'chale-limpeza',
)
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

    const reservaAtual = reservasDoChale.find(
      (reserva) =>
        reserva.checkInRealizado === true &&
        reserva.checkOutRealizado !== true,
    )

    if (reservaAtual) {
      mostrarChaleOcupado(cartao, reservaAtual)
      continue
    }

    const reservaAguardandoLimpeza = reservasDoChale.find(
      (reserva) =>
        reserva.checkOutRealizado === true &&
        reserva.limpeza === 'pendente',
    )

    if (reservaAguardandoLimpeza) {
      mostrarAguardandoLimpeza(
        cartao,
        reservaAguardandoLimpeza,
      )
      continue
    }

    const proximaReserva = reservasDoChale.find((reserva) => {
      const saida = converterData(reserva.saida)

      return (
        reserva.checkInRealizado !== true &&
        saida > agora
      )
    })

    if (proximaReserva) {
      mostrarProximaReserva(cartao, proximaReserva)
      continue
    }

    deixarChaleLivre(cartao)
  }
}
  


function atualizarResumo(reservas, agora) {
 const reservasAtivas = reservas.filter(
  (reserva) =>
    reserva.checkInRealizado === true &&
    reserva.checkOutRealizado !== true,
)

const reservasEmLimpeza = reservas.filter(
  (reserva) =>
    reserva.checkOutRealizado === true &&
    reserva.limpeza === 'pendente',
)

const chalesIndisponiveis = new Set([
  ...reservasAtivas.map((reserva) => reserva.chale),
  ...reservasEmLimpeza.map((reserva) => reserva.chale),
]).size

 const entradasHoje = reservas.filter(
  (reserva) =>
    reserva.status !== 'cancelada' &&
    reserva.statusHospedagem !== 'finalizado' &&
    mesmoDia(
      converterData(reserva.entrada),
      agora,
    ),
).length

const saidasHoje = reservas.filter(
  (reserva) =>
    reserva.status !== 'cancelada' &&
    reserva.statusHospedagem !== 'finalizado' &&
    mesmoDia(
      converterData(reserva.saida),
      agora,
    ),
).length

  atualizarNumero(
  '#summary-available',
  9 - chalesIndisponiveis,
)

atualizarNumero(
  '#summary-occupied',
  chalesIndisponiveis,
)
  atualizarNumero('#summary-entries', entradasHoje)
  atualizarNumero('#summary-exits', saidasHoje)
}

function tocarSomNovaReserva() {
  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContext) {
      return
    }

    const contexto = new AudioContext()
    const oscilador = contexto.createOscillator()
    const volume = contexto.createGain()

    oscilador.connect(volume)
    volume.connect(contexto.destination)

    oscilador.frequency.value = 880
    volume.gain.setValueAtTime(0.15, contexto.currentTime)
    volume.gain.exponentialRampToValueAtTime(
      0.01,
      contexto.currentTime + 0.6,
    )

    oscilador.start()
    oscilador.stop(contexto.currentTime + 0.6)

    oscilador.addEventListener('ended', () => {
      contexto.close()
    })
  } catch (error) {
    console.error('Não foi possível tocar o aviso:', error)
  }
}

function mostrarAvisoNovaReserva(reserva) {
  const alerta = document.createElement('button')
  const titulo = document.createElement('strong')
  const descricao = document.createElement('span')

  alerta.type = 'button'
  alerta.className = 'new-reservation-alert'

  titulo.textContent = `Nova reserva — Chalé ${reserva.chale}`
  descricao.textContent =
    reserva.hospede || 'Consulte os dados da nova reserva.'

  alerta.append(titulo, descricao)
  document.body.append(alerta)

  alerta.addEventListener('click', () => {
    alerta.remove()
    abrirDetalhesReserva(reserva.id)
  })

  tocarSomNovaReserva()

  if (
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    const notificacao = new Notification(
      `Nova reserva — Chalé ${reserva.chale}`,
      {
        body:
          reserva.hospede ||
          'Uma nova reserva foi cadastrada.',
        icon: '/images/logo-sumiko.jfif',
      },
    )

    notificacao.onclick = () => {
      window.focus()
      abrirDetalhesReserva(reserva.id)
      notificacao.close()
    }
  }

  window.setTimeout(() => {
    alerta.remove()
  }, 10000)
}
export async function solicitarPermissaoNotificacoes() {
  if (!('Notification' in window)) {
    window.alert(
      'Este navegador não oferece suporte a notificações.',
    )
    return
  }

  if (Notification.permission === 'granted') {
    window.alert('As notificações já estão ativadas.')
    return
  }

  const permissao = await Notification.requestPermission()

  if (permissao === 'granted') {
    window.alert(
      'Notificações ativadas com sucesso.',
    )
    return
  }

  window.alert(
    'A permissão não foi concedida. Você continuará recebendo o aviso dentro do sistema.',
  )
}
export function iniciarReservasEmTempoReal(usuarioId) {
  const consultaReservas = query(
    collection(db, 'reservas'),
    orderBy('entrada', 'asc'),
  )

  let primeiraLeitura = true

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

      if (!primeiraLeitura && usuarioId === 'giovani') {
        resultado.docChanges().forEach((alteracao) => {
          const reserva = {
            id: alteracao.doc.id,
            ...alteracao.doc.data(),
          }

          if (
            alteracao.type === 'added' &&
            reserva.status !== 'cancelada'
          ) {
            mostrarAvisoNovaReserva(reserva)
          }
        })
      }

      primeiraLeitura = false

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