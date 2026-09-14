import { iniciarReservasEmTempoReal } from './reservas-painel.js'
import { signOut } from 'firebase/auth'
import { auth } from './firebase.js'
import { abrirAlteracaoPin } from './alterar-pin.js'
import { abrirNovaReserva } from './nova-reserva.js'


const usuarios = {
  renato: {
    nome: 'Renato',
    perfil: 'Proprietário',
  },
  fernanda: {
    nome: 'Fernanda',
    perfil: 'Proprietária',
  },
  giovani: {
    nome: 'Giovani',
    perfil: 'Zelador',
  },
}

const chales = Array.from({ length: 10 }, (_, indice) => {
  const numero = indice + 1

  return {
    numero,
    localizacao: numero <= 5 ? 'Parte de baixo' : 'Parte de cima',
    status: numero === 1 ? 'residencia' : 'livre',
  }
})

function criarCartaoChale(chale) {
  const residencia = chale.status === 'residencia'

  return `
    <article
  class="chale-card ${residencia ? 'chale-residencia' : ''}"
  data-chale="${chale.numero}"
>
      <div class="chale-card-header">
        <span class="chale-number">Chalé ${chale.numero}</span>

        <span class="status-badge ${residencia ? 'status-residencia' : 'status-livre'}">
          ${residencia ? 'Residência' : 'Livre'}
        </span>
      </div>

      <p class="chale-location">${chale.localizacao}</p>

      <div class="chale-information">
        ${
          residencia
            ? '<p>Residência do zelador</p><small>Bloqueado para reservas</small>'
            : '<p>Disponível para reserva</p><small>Nenhuma hospedagem cadastrada</small>'
        }
      </div>
    </article>
  `
}

function criarGrupoChales(titulo, numeros) {
  const cartoes = chales
    .filter((chale) => numeros.includes(chale.numero))
    .map(criarCartaoChale)
    .join('')

  return `
    <section class="chale-section">
      <div class="section-heading">
        <div>
          <p class="section-label">Localização</p>
          <h2>${titulo}</h2>
        </div>
      </div>

      <div class="chale-grid">
        ${cartoes}
      </div>
    </section>
  `
}

export function renderDashboard(usuarioId) {
  const usuario = usuarios[usuarioId]

  if (!usuario) {
    return
  }

  const podeCadastrarReserva =
    usuarioId === 'renato' || usuarioId === 'fernanda'

  document.querySelector('#app').innerHTML = `
    <div class="dashboard-page">
      <header class="dashboard-header">
        <div class="header-brand">
          <img
            src="/images/logo-sumiko.jfif"
            alt="Sumiko Chalés"
          />

          <div>
            <strong>Sumiko Chalés</strong>
            <span>Gestão de reservas</span>
          </div>
        </div>

        <div class="header-user">
  <div>
    <strong>${usuario.nome}</strong>
    <span>${usuario.perfil}</span>
  </div>

  <button
    type="button"
    id="change-pin-button"
    class="change-pin-button"
  >
    Alterar PIN
  </button>

  <button type="button" id="logout-button" class="logout-button">
    Sair
  </button>
</div>
      </header>

      <main class="dashboard-content">
        <section class="welcome-section">
          <div>
            <p class="section-label">Visão geral</p>
            <h1>Olá, ${usuario.nome}!</h1>
            <p>Acompanhe a situação dos chalés e das hospedagens.</p>
          </div>

          ${
            podeCadastrarReserva
              ? `
                <button type="button" id="new-reservation-button" class="new-reservation-button">
                  + Nova reserva
                </button>
              `
              : ''
          }
        </section>

        <p class="demo-warning">
          Dados iniciais de demonstração. As reservas serão adicionadas nas próximas etapas.
        </p>

        <section class="summary-grid" aria-label="Resumo dos chalés">
          <article class="summary-card">
            <span class="summary-icon icon-available">✓</span>
            <div>
              <strong id="summary-available">9</strong>
              <span>Chalés livres</span>
            </div>
          </article>

          <article class="summary-card">
            <span class="summary-icon icon-occupied">●</span>
            <div>
              <strong id="summary-occupied">0</strong>
              <span>Ocupados/limpeza</span>
            </div>
          </article>

          <article class="summary-card">
            <span class="summary-icon icon-entry">↓</span>
            <div>
              <strong id="summary-entries">0</strong>
              <span>Entradas hoje</span>
            </div>
          </article>

          <article class="summary-card">
            <span class="summary-icon icon-exit">↑</span>
            <div>
              <strong id="summary-exits">0</strong>
              <span>Saídas hoje</span>
            </div>
          </article>
        </section>

        ${criarGrupoChales('Parte de baixo', [1, 2, 3, 4, 5])}
        ${criarGrupoChales('Parte de cima', [6, 7, 8, 9, 10])}
      </main>
    </div>
  `
document
  .querySelector('#change-pin-button')
  .addEventListener('click', abrirAlteracaoPin)
  
  document
  .querySelector('#logout-button')
  .addEventListener('click', async () => {
    try {
      await signOut(auth)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao sair:', error)
      window.alert('Não foi possível encerrar o acesso.')
    }
  })

  const newReservationButton =
  document.querySelector('#new-reservation-button')

if (newReservationButton) {
  newReservationButton.addEventListener('click', abrirNovaReserva)
}

iniciarReservasEmTempoReal()
}