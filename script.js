// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8C",
  numeroChamada: 25,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// ARMAZENAMENTO DA SESSÃO EM MEMÓRIA (NUNCA NO STORAGE)
let pinSessao = null;
let dadosBoletimAtual = [];

// INSTÂNCIAS DOS GRÁFICOS (CHART.JS)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// DADOS DE RESERVA (FALLBACK) SE A API RETORNAR NULL
const dadosDisciplinasPadrao = [
  { disciplina: "Língua Portuguesa", tri1: "6,2", tri2: "6,0", tri3: null, faltas: [4, 0, 0] },
  { disciplina: "Matemática", tri1: "5,7", tri2: "6,9", tri3: null, faltas: [4, 0, 0] },
  { disciplina: "Ciências", tri1: "8,6", tri2: "6,0", tri3: null, faltas: [5, 0, 0] },
  { disciplina: "História", tri1: "8,7", tri2: "9,0", tri3: null, faltas: [3, 0, 0] },
  { disciplina: "Geografia", tri1: "4,4", tri2: "5,0", tri3: null, faltas: [1, 0, 0] },
  { disciplina: "Língua Inglesa", tri1: "6,9", tri2: "6,0", tri3: null, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: "6,0", tri2: "6,8", tri3: null, faltas: [2, 0, 0] },
  { disciplina: "Educação Física", tri1: "9,4", tri2: "8,5", tri3: null, faltas: [1, 0, 0] },
  { disciplina: "Educação Digital", tri1: "4,4", tri2: "9,0", tri3: null, faltas: [3, 0, 0] },
  { disciplina: "Educação Financeira", tri1: "8,5", tri2: "7,8", tri3: null, faltas: [3, 0, 0] },
  { disciplina: "Estudo Orientado", tri1: "7,7", tri2: "9,0", tri3: null, faltas: [4, 0, 0] },
  { disciplina: "Redação e Leitura", tri1: "7,3", tri2: "8,6", tri3: null, faltas: [3, 0, 0] },
  { disciplina: "Pensamento Lógico", tri1: "9,0", tri2: "8,5", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,3", tri2: "7,6", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Práticas Experimentais", tri1: "8,3", tri2: "6,7", tri3: null, faltas: [2, 0, 0] }
];

/**
 * Normalização para DADOS ANTIGOS / LOCAIS (aceita 75->7.5, strings com vírgula, etc.)
 */
function normalizarNotaAntiga(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  let num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor);
  if (isNaN(num) || num < 0) {
    return null;
  }
  if (num > 10 && num <= 100) {
    num = num / 10;
  }
  if (num >= 0 && num <= 10) {
    return num;
  }
  return null;
}

/**
 * Validação rigorosa para NOTAS DIGITADAS NO EDITOR (0 a 10, ponto/vírgula ou vazio)
 */
function validarNotaDigitada(texto) {
  if (texto === null || texto === undefined) return { valida: true, valor: null };
  const str = String(texto).trim();
  if (str === "") return { valida: true, valor: null };

  const strNormalizada = str.replace(',', '.');
  const num = Number(strNormalizada);

  if (isNaN(num) || num < 0 || num > 10) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

/**
 * Validação rigorosa para FALTAS DIGITADAS (inteiro >= 0)
 */
function validarFaltaDigitada(texto) {
  const str = String(texto).trim();
  if (str === "")