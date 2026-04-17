# 🏋️ M&P Performance - Sistema CATRACA

## 📋 Sobre

Sistema de **Controle de Acesso** para a academia M&P Performance.
Funciona como uma catraca digital em modo tablet/quiosque.

O aluno digita seu CPF no teclado numérico e o sistema consulta a API para verificar o status:

| Status na API | Resultado na Tela |
|---------------|-------------------|
| `Ativo` | ✅ **ACESSO LIBERADO** |
| `Inativo` | ⏸️ **PLANO INATIVO** |
| `Suspenso` | 🔒 **ACESSO BLOQUEADO** |
| CPF não encontrado | ❌ **CPF NÃO CADASTRADO** |
| Erro de conexão | 🚫 **ERRO DE CONEXÃO** |

**Versão Atual:** 1.1.0

---

## 🚀 Como Usar

### 1. Configurar API

Edite o arquivo `config.js` e altere a URL da API:

```javascript
API_BASE_URL: 'http://localhost:3000',
// Para produção:
// API_BASE_URL: 'https://api.mpperformance.com',
```

### 2. Abrir no Navegador

Basta abrir o `index.html` em qualquer navegador moderno.
Para uso em tablet, configure o navegador em **modo quiosque/tela cheia** (F11).

### 3. Deploy (Vercel/Netlify)

1. Faça upload da pasta `CATRACA` para um repositório Git
2. Conecte ao Vercel ou Netlify
3. Deploy automático!

**Nota:** Para produção, altere `DEBUG: false` no `config.js`.

---

## 📡 Endpoint Necessário na API

A CATRACA usa **UM único endpoint** (sem autenticação):

```http
GET /api/alunos/cpf/{cpf}
```

**Exemplo:** `GET /api/alunos/cpf/12345678901`

**Resposta 200:**
```json
{
  "id": "abc123",
  "nome": "João Silva",
  "modalidade": "Musculação",
  "plano": "Mensal",
  "status": "Ativo"
}
```

**Resposta 404:** CPF não encontrado

**Endpoint opcional para health check:**
```http
GET /health
```
Retorna 200 se o servidor estiver online.

---

## 📁 Estrutura

```
CATRACA/
├── index.html    → Interface do tablet
├── style.css     → Estilos premium dark theme
├── script.js     → Lógica de CPF e API
├── config.js     → Configuração da API
└── README.md     → Este arquivo
```

---

## ⚠️ Importante

- Este projeto é **independente** do Painel Administrativo
- Ambos se conectam à **mesma API**
- A CATRACA **NÃO** requer autenticação (modo quiosque)
- O Painel **REQUER** login admin

---

## 🎨 Features

- ✅ Design dark premium para tablets
- ✅ Teclado numérico touch-friendly
- ✅ Validação matemática de CPF
- ✅ Formatação automática (xxx.xxx.xxx-xx)
- ✅ Animações fluidas e micro-interações
- ✅ Tela de resultado com countdown (5s)
- ✅ Auto-retorno para tela de CPF
- ✅ Suporte a teclado físico
- ✅ Tratamento robusto de erros
- ✅ Verificação de conectividade
- ✅ Timeout de requisições
- ✅ Logs de debug configuráveis

---

## 🔧 Configurações

No arquivo `config.js`:

- `API_BASE_URL`: URL do servidor da API
- `TEMPO_RESULTADO`: Tempo em ms para exibir resultado (padrão: 5000)
- `DEBUG`: Ativar logs no console (desativar em produção)
- `TIMEOUT_REQUISICAO`: Timeout da requisição em ms (padrão: 10000)

---

## 🐛 Debug

Com `DEBUG: true`, o console mostrará logs detalhados das operações.

Para testar sem API, use um servidor local como Live Server no VS Code.
- ✅ Responsivo para qualquer tablet
- ✅ Logo M&P Performance integrada

---

**PROJETO: Mauro Jr & Pietro Mantuan — M&P PERFORMANCE © 2026**
