/**
 * M&P Performance - Sistema de Controle de Acesso (CATRACA)
 * Tablet/Quiosque - Consulta CPF via API
 * 
 * Lógica:
 *   Ativo    → ACESSO LIBERADO
 *   Suspenso → ACESSO BLOQUEADO
 *   Inativo  → PLANO INATIVO
 *   404      → CPF NÃO CADASTRADO
 *   Erro     → ERRO DE CONEXÃO
 * 
 * PROJETO: MAURO JR E PIETRO MANTUAN - M&P PERFORMANCE
 */

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
let cpfDigits = '';
const CPF_MAX_LENGTH = 11;
let returnTimeout = null;
let isProcessing = false;
let cpfVisible = false; // Estado para controlar visibilidade do CPF

// ==========================================
// REFERÊNCIAS DO DOM
// ==========================================
const screenCPF = document.getElementById('screenCPF');
const screenResult = document.getElementById('screenResult');
const cpfDisplay = document.getElementById('cpfDisplay');
const cpfHelperText = document.getElementById('cpfHelperText');
const btnVerify = document.getElementById('btnVerify');
const keypad = document.getElementById('keypad');
const btnToggleVisibility = document.getElementById('btnToggleVisibility');
const toggleText = document.getElementById('toggleText');

// Result cards
const resultCards = {
  liberado: document.getElementById('resultLiberado'),
  bloqueado: document.getElementById('resultBloqueado'),
  inativo: document.getElementById('resultInativo'),
  naoCadastrado: document.getElementById('resultNaoCadastrado'),
  erro: document.getElementById('resultErro')
};

// ==========================================
// 1. RELÓGIO E DATA
// ==========================================
function atualizarRelogio() {
  const now = new Date();

  const horas = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const data = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const clockEl = document.getElementById('clockTime');
  const dateEl = document.getElementById('dateText');

  if (clockEl) clockEl.textContent = horas;
  if (dateEl) dateEl.textContent = data;
}

// ==========================================
// 2. FORMATAÇÃO DE CPF
// ==========================================
function formatarCPF(digits) {
  if (!digits) return '';
  
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 3 || i === 6) formatted += '.';
    if (i === 9) formatted += '-';
    formatted += digits[i];
  }
  return formatted;
}

function formatarCPFOculto(digits) {
  if (!digits) return '';
  
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 3 || i === 6) formatted += '.';
    if (i === 9) formatted += '-';
    formatted += '*';
  }
  return formatted;
}

function atualizarDisplay() {
  if (cpfDigits.length === 0) {
    cpfDisplay.innerHTML = '<span class="cpf-placeholder">___.___.___-__</span>';
    cpfDisplay.classList.remove('has-value');
    btnVerify.disabled = true;
    if (cpfHelperText) cpfHelperText.textContent = 'Digite os 11 dígitos do CPF';
  } else {
    const formatted = cpfVisible ? formatarCPF(cpfDigits) : formatarCPFOculto(cpfDigits);

    // Build remaining placeholder
    const remaining = 14 - formatted.length; // xxx.xxx.xxx-xx = 14 chars
    let displayHTML = `<span>${formatted}</span>`;
    
    if (remaining > 0) {
      let placeholder = '';
      const totalDigits = cpfDigits.length;
      for (let i = totalDigits; i < CPF_MAX_LENGTH; i++) {
        if (i === 3 || i === 6) placeholder += '.';
        if (i === 9) placeholder += '-';
        placeholder += '_';
      }
      displayHTML += `<span class="cpf-placeholder">${placeholder}</span>`;
      if (cpfHelperText) cpfHelperText.textContent = 'Continue digitando...';
    } else {
      if (cpfHelperText) cpfHelperText.textContent = 'CPF completo. Pressione verificar.';
    }

    cpfDisplay.innerHTML = displayHTML;
    cpfDisplay.classList.add('has-value');
    btnVerify.disabled = cpfDigits.length !== CPF_MAX_LENGTH;
  }
}

// ==========================================
// 3. TECLADO NUMÉRICO
// ==========================================
function adicionarDigito(digit) {
  if (cpfDigits.length >= CPF_MAX_LENGTH || isProcessing) return;
  cpfDigits += digit;
  atualizarDisplay();
}

function removerDigito() {
  if (cpfDigits.length === 0 || isProcessing) return;
  cpfDigits = cpfDigits.slice(0, -1);
  atualizarDisplay();
}

function limparCPF() {
  if (isProcessing) return;
  cpfDigits = '';
  cpfVisible = false; // Resetar visibilidade quando limpar
  atualizarDisplay();
  
  // Resetar botão de toggle
  const icon = btnToggleVisibility.querySelector('i');
  const text = toggleText;
  icon.className = 'fas fa-eye';
  text.textContent = 'Mostrar CPF';
  btnToggleVisibility.classList.remove('showing');
  
  cpfDisplay.classList.remove('error');
}

// Event Delegation for keypad
keypad.addEventListener('click', (e) => {
  const key = e.target.closest('.key');
  if (!key) return;

  // Ripple effect
  createRipple(e, key);

  const value = key.dataset.key;

  if (value === 'clear') {
    limparCPF();
  } else if (value === 'backspace') {
    removerDigito();
  } else {
    adicionarDigito(value);
  }
});

// Keyboard support (for physical keyboards on tablets)
document.addEventListener('keydown', (e) => {
  if (isProcessing) return;

  if (e.key >= '0' && e.key <= '9') {
    adicionarDigito(e.key);
    highlightKey(e.key);
  } else if (e.key === 'Backspace') {
    removerDigito();
    highlightKey('backspace');
  } else if (e.key === 'Escape') {
    limparCPF();
    highlightKey('clear');
  } else if (e.key === 'Enter') {
    if (cpfDigits.length === CPF_MAX_LENGTH) {
      verificarCPF();
    }
  }
});

function highlightKey(dataKey) {
  const key = document.querySelector(`.key[data-key="${dataKey}"]`);
  if (key) {
    key.classList.add('key-pressed');
    key.style.background = 'var(--bg-key-active)';
    setTimeout(() => {
      key.classList.remove('key-pressed');
      key.style.background = '';
    }, 150);
  }
}

function createRipple(event, element) {
  const ripple = document.createElement('span');
  ripple.classList.add('key-ripple');

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  element.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// ==========================================
// 3.1 TOGGLE VISIBILIDADE CPF
// ==========================================
function toggleCPFVisibility() {
  cpfVisible = !cpfVisible;
  atualizarDisplay();
  
  // Atualizar botão
  const icon = btnToggleVisibility.querySelector('i');
  const text = toggleText;
  
  if (cpfVisible) {
    icon.className = 'fas fa-eye-slash';
    text.textContent = 'Ocultar CPF';
    btnToggleVisibility.classList.add('showing');
  } else {
    icon.className = 'fas fa-eye';
    text.textContent = 'Mostrar CPF';
    btnToggleVisibility.classList.remove('showing');
  }
}

// Event listener para o botão de toggle
if (btnToggleVisibility) {
  btnToggleVisibility.addEventListener('click', toggleCPFVisibility);
}

// ==========================================
// 4. VALIDAÇÃO DE CPF
// ==========================================
function validarCPF(cpf) {
  // Remove non-digits
  const digits = cpf.replace(/\D/g, '');
  
  // Para facilitar testes com CPFs de exemplo (que nem sempre seguem o algoritmo de checksum)
  // vamos validar apenas se tem 11 dígitos.
  if (digits.length !== 11) return false;

  // Se desejar validação estrita no futuro, descomente o bloco abaixo:
  /*
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  */

  return true;
}

// ==========================================
// 5.1 VERIFICAÇÃO DE CONECTIVIDADE
// ==========================================
async function verificarConectividade() {
  logDebug('Health Check', `Testando conexão com: ${CONFIG.API_BASE_URL}`);
  try {
    const response = await fetch(CONFIG.API_BASE_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      logDebug('Conectividade', '✅ API Online');
      return true;
    } else {
      logDebug('Conectividade', `⚠️ API respondeu com status: ${response.status}`);
      return true; // Still reachable
    }
  } catch (err) {
    logDebug('Conectividade', `❌ API Inalcançável: ${err.message}`);
    return false;
  }
}

// ==========================================
// 5. CONSULTA API
// ==========================================
async function verificarCPF() {
  if (isProcessing || cpfDigits.length !== CPF_MAX_LENGTH) return;

  // Validate CPF format
  if (!validarCPF(cpfDigits)) {
    cpfDisplay.classList.add('error');
    if (cpfHelperText) cpfHelperText.textContent = 'CPF inválido! Verifique os dígitos.';
    setTimeout(() => {
      cpfDisplay.classList.remove('error');
      if (cpfHelperText) cpfHelperText.textContent = 'Digite os 11 dígitos do CPF';
    }, 1200);
    logDebug('CPF Inválido', formatarCPF(cpfDigits));
    return;
  }

  isProcessing = true;
  
  // Show loading state
  const btnText = btnVerify.querySelector('.btn-verify-text');
  const btnLoading = btnVerify.querySelector('.btn-verify-loading');
  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');
  btnVerify.disabled = true;

  const cpfFormatado = formatarCPF(cpfDigits);
  logDebug('Consultando CPF', `${cpfFormatado} → ${CONFIG.API_BASE_URL}${CONFIG.ENDPOINT_CPF}/${cpfDigits}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_REQUISICAO);

    const resposta = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINT_CPF}/${cpfDigits}`, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    logDebug('Resposta API', `Status: ${resposta.status}`);

    if (resposta.status === 404) {
      // CPF não encontrado
      mostrarResultado('naoCadastrado');
      return;
    }

    if (resposta.ok) {
      let aluno = await resposta.json();
      logDebug('Dados brutos salvos', aluno);

      // Tratamento para API que retorna { status: 'success', dados: { ... } }
      if (aluno && aluno.dados) {
        logDebug('Unwrapping', 'Extraindo dados de aluno.dados');
        aluno = aluno.dados;
      }

      // Normalização do Status (para aceitar boolean ou string)
      let statusString = '';
      
      // Captura o campo status independentemente de onde ele esteja no objeto
      const statusValue = aluno.status !== undefined ? aluno.status : aluno.podeEntrar;

      if (typeof statusValue === 'boolean') {
        statusString = statusValue ? 'Ativo' : 'Inativo';
      } else if (typeof statusValue === 'string') {
        // Garantir capitalização correta (Ativo, Inativo, Suspenso)
        const s = statusValue.trim().toLowerCase();
        if (s === 'ativo' || s === 'true') statusString = 'Ativo';
        else if (s === 'suspenso') statusString = 'Suspenso';
        else statusString = 'Inativo';
      } else {
        logDebug('Status Inválido', `Tipo de status desconhecido: ${typeof statusValue}`);
        statusString = 'Desconhecido';
      }

      logDebug('Aluno Processado', { 
        id: aluno.id || aluno._id || aluno.alunoId,
        nome: aluno.nome, 
        statusOrigin: statusValue,
        statusNormalizado: statusString 
      });

      switch (statusString) {
        case 'Ativo':
          mostrarResultado('liberado', aluno);
          break;
        case 'Inativo':
          mostrarResultado('inativo', aluno);
          break;
        case 'Suspenso':
          mostrarResultado('bloqueado', aluno);
          break;
        default:
          logDebug('Resultado default', 'Status não mapeado, tratando como bloqueado');
          mostrarResultado('bloqueado', aluno);
      }
    } else {
      logDebug('Erro API', `Status inesperado: ${resposta.status}`);
      mostrarResultado('erro');
    }
  } catch (erro) {
    console.error('Erro ao consultar API:', erro);
    logDebug('Exception', erro.message);
    
    // Check if it's a network error or timeout
    if (erro.name === 'AbortError') {
      logDebug('Timeout', 'Requisição cancelada por timeout');
    } else if (erro.message.includes('fetch')) {
      logDebug('Network Error', 'Erro de rede ou servidor indisponível');
    }
    
    mostrarResultado('erro');
  } finally {
    // Ensure processing flag is reset
    isProcessing = false;
    
    // Reset button state
    const btnText = btnVerify.querySelector('.btn-verify-text');
    const btnLoading = btnVerify.querySelector('.btn-verify-loading');
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
    btnVerify.disabled = cpfDigits.length !== CPF_MAX_LENGTH;
  }
}

// ==========================================
// 6. EXIBIR RESULTADO
// ==========================================
function mostrarResultado(tipo, aluno = null) {
  // Hide all result cards
  Object.values(resultCards).forEach(card => card.classList.add('hidden'));

  // Populate result data
  switch (tipo) {
    case 'liberado':
      document.getElementById('resultNomeLiberado').textContent = aluno.nome;
      document.getElementById('resultDetailLiberado').textContent = `CPF: ${formatarCPF(aluno.cpf || cpfDigits)}`;
      resultCards.liberado.classList.remove('hidden');
      screenResult.className = 'screen active screen-glow-liberado';
      break;

    case 'bloqueado':
      document.getElementById('resultNomeBloqueado').textContent = aluno ? aluno.nome : '';
      document.getElementById('resultDetailBloqueado').textContent = 
        aluno ? `Status: ${aluno.status}` : 'Acesso negado';
      resultCards.bloqueado.classList.remove('hidden');
      screenResult.className = 'screen active screen-glow-bloqueado';
      break;

    case 'inativo':
      document.getElementById('resultNomeInativo').textContent = aluno ? aluno.nome : '';
      document.getElementById('resultDetailInativo').textContent = `CPF: ${formatarCPF(aluno.cpf || cpfDigits)}`;
      resultCards.inativo.classList.remove('hidden');
      screenResult.className = 'screen active screen-glow-inativo';
      break;

    case 'naoCadastrado':
      resultCards.naoCadastrado.classList.remove('hidden');
      screenResult.className = 'screen active';
      break;

    case 'erro':
      resultCards.erro.classList.remove('hidden');
      screenResult.className = 'screen active';
      break;
  }

  // Transition screens
  screenCPF.classList.remove('active');
  screenResult.classList.add('active');

  // Start countdown animation
  const countdownBar = document.getElementById(
    `countdown${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
  );
  if (countdownBar) {
    countdownBar.classList.add('countdown-animate');
    countdownBar.style.animationDuration = `${CONFIG.TEMPO_RESULTADO / 1000}s`;
  }

  // Auto-return after configured time
  returnTimeout = setTimeout(() => {
    voltarParaCPF();
  }, CONFIG.TEMPO_RESULTADO);
}

// ==========================================
// 7. VOLTAR PARA TELA CPF
// ==========================================
function voltarParaCPF() {
  if (returnTimeout) {
    clearTimeout(returnTimeout);
    returnTimeout = null;
  }

  // Reset screens
  screenResult.classList.remove('active');
  screenResult.className = 'screen';
  screenCPF.classList.add('active');

  // Reset all countdown animations
  document.querySelectorAll('.countdown-bar').forEach(bar => {
    bar.classList.remove('countdown-animate');
  });

  // Reset CPF input
  cpfDigits = '';
  atualizarDisplay();
  isProcessing = false;

  // Reset verify button
  const btnText = btnVerify.querySelector('.btn-verify-text');
  const btnLoading = btnVerify.querySelector('.btn-verify-loading');
  btnText.classList.remove('hidden');
  btnLoading.classList.add('hidden');
  btnVerify.disabled = true;
}

// Allow tap on result screen to go back early
screenResult.addEventListener('click', () => {
  voltarParaCPF();
});

// ==========================================
// 8. BOTÃO VERIFICAR
// ==========================================
btnVerify.addEventListener('click', verificarCPF);

// ==========================================
// 9. DEBUG LOGGER
// ==========================================
function logDebug(titulo, dados) {
  if (CONFIG.DEBUG) {
    console.log(`🔍 [CATRACA - ${titulo}]`, dados);
  }
}

// ==========================================
// 10. INICIALIZAÇÃO
// ==========================================
function iniciarCatraca() {
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
  atualizarDisplay();
  
  // Teste de conectividade inicial
  verificarConectividade();

  logDebug('Inicialização', `API: ${CONFIG.API_BASE_URL}`);
  logDebug('Endpoint CPF', `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINT_CPF}/{cpf}`);
  logDebug('Tempo resultado', `${CONFIG.TEMPO_RESULTADO / 1000} segundos`);

  console.log(`
╔══════════════════════════════════════╗
║   🏋️ M&P PERFORMANCE - CATRACA      ║
║   Sistema de Controle de Acesso      ║
║   Versão: ${CONFIG.VERSAO}                     ║
║   API: ${CONFIG.API_BASE_URL.padEnd(28)}║
╚══════════════════════════════════════╝
  `);
}

document.addEventListener('DOMContentLoaded', iniciarCatraca);
