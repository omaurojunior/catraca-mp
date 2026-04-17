/**
 * 🔧 CONFIGURAÇÃO - M&P Performance CATRACA
 * 
 * Sistema de Autenticação de Entrada (Tablet/Quiosque)
 * Conecta-se à mesma API do Painel Administrativo
 */

const CONFIG = {
  // 🌐 URL BASE DA API 
  // Se sua API estiver rodando localmente com Python, use 'http://localhost:5000'
  API_BASE_URL: 'https://api-catraca-mu.vercel.app',

  // 📡 ENDPOINTS
  // Em algumas implementações, o prefixo '/api' é necessário (ex: '/api/alunos/cpf')
  // Verifique qual retorno sua API Vercel está dando.
  ENDPOINT_CPF: '/alunos/cpf', 

  // ⏱️ TEMPO DE EXIBIÇÃO DO RESULTADO (ms)
  TEMPO_RESULTADO: 5000, 

  // 🐛 DEBUG MODE
  DEBUG: true, 

  // ⏱️ TIMEOUT DA REQUISIÇÃO (ms)
  TIMEOUT_REQUISICAO: 10000,

  // 🔄 VERSÃO DO SISTEMA
  VERSAO: '1.1.0'
};
