function addToFormula(symbol) {
    const formula = document.getElementById('formula');
    formula.value += symbol;
}

function clearFormula() {
    document.getElementById('formula').value = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('resultText').style.display = 'none';
}

function backspace() {
    const formula = document.getElementById('formula');
    formula.value = formula.value.slice(0, -1);
}

function validateFormula(formula) {
    // Remove espaços
    formula = formula.replace(/\s/g, '');
    
    if (formula === '') return false;

    // Tokens válidos
    const validTokens = ['P', 'Q', 'R', 'S', '~', '∧', '∨', '→', '↔', '⊕', '⊤', '⊥', 'NAND', 'NOR', '(', ')'];
    
    // Verifica se todos os caracteres/tokens são válidos
    let i = 0;
    while (i < formula.length) {
        let found = false;
        for (let token of validTokens) {
            if (formula.substring(i, i + token.length) === token) {
                i += token.length;
                found = true;
                break;
            }
        }
        if (!found) return false;
    }

    // Verifica balanceamento de parênteses
    let balance = 0;
    for (let char of formula) {
        if (char === '(') balance++;
        if (char === ')') balance--;
        if (balance < 0) return false;
    }
    if (balance !== 0) return false;

    // Tokeniza a fórmula
    const tokens = [];
    i = 0;
    while (i < formula.length) {
        for (let token of validTokens) {
            if (formula.substring(i, i + token.length) === token) {
                tokens.push(token);
                i += token.length;
                break;
            }
        }
    }

    // Valida a sequência de tokens
    const props = ['P', 'Q', 'R', 'S', '⊤', '⊥'];
    const binaryOps = ['∧', '∨', '→', '↔', '⊕', 'NAND', 'NOR'];
    const unaryOps = ['~'];

    for (let i = 0; i < tokens.length; i++) {
        const curr = tokens[i];
        const prev = tokens[i - 1];
        const next = tokens[i + 1];

        // Proposição ou constante não pode vir depois de outra proposição/constante
        if (props.includes(curr) && prev && props.includes(prev)) {
            return false;
        }

        // Operador binário precisa ter algo antes e depois
        if (binaryOps.includes(curr)) {
            if (!prev || prev === '(' || binaryOps.includes(prev)) return false;
            if (!next || next === ')' || binaryOps.includes(next)) return false;
        }

        // Parêntese de fechamento não pode vir antes de algo que precisa de operando
        if (curr === ')' && next && (props.includes(next) || next === '(')) {
            return false;
        }
    }

    return true;
}

function translateFormula(formula) {
    const propP = document.getElementById('propP').value.trim();
    const propQ = document.getElementById('propQ').value.trim();
    const propR = document.getElementById('propR').value.trim();
    const propS = document.getElementById('propS').value.trim();

    // Remove espaços da fórmula
    formula = formula.replace(/\s/g, '');

    // Tokeniza a fórmula mantendo a ordem
    const validTokens = ['NAND', 'NOR', 'P', 'Q', 'R', 'S', '~', '∧', '∨', '→', '↔', '⊕', '⊤', '⊥', '(', ')'];
    const tokens = [];
    let i = 0;
    
    while (i < formula.length) {
        let found = false;
        for (let token of validTokens) {
            if (formula.substring(i, i + token.length) === token) {
                tokens.push(token);
                i += token.length;
                found = true;
                break;
            }
        }
        if (!found) i++;
    }

    // Função auxiliar para envolver proposições em parênteses quando necessário
    function wrapProposition(text, needsParens) {
        if (needsParens && !text.startsWith('(')) {
            return '(' + text + ')';
        }
        return text;
    }

    // Traduz os tokens com gramática natural
    let result = '';
    let parenDepth = 0;
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const prevToken = tokens[i - 1];
        const nextToken = tokens[i + 1];
        
        switch(token) {
            case 'P':
                result += propP || 'P';
                break;
            case 'Q':
                result += propQ || 'Q';
                break;
            case 'R':
                result += propR || 'R';
                break;
            case 'S':
                result += propS || 'S';
                break;
            case '~':
                // Se a próxima coisa é um parêntese, não adiciona espaço
                if (nextToken === '(') {
                    result += 'não ';
                } else {
                    result += 'não é verdade que ';
                }
                break;
            case '∧':
                result += ' e ';
                break;
            case '∨':
                result += ' ou ';
                break;
            case '→':
                result += ', então ';
                break;
            case '↔':
                result += ' se e somente se ';
                break;
            case '⊕':
                result += ' ou exclusivamente ';
                break;
            case '⊤':
                result += 'é sempre verdadeiro';
                break;
            case '⊥':
                result += 'é sempre falso';
                break;
            case 'NAND':
                result += ' não é verdade que ambos ';
                break;
            case 'NOR':
                result += ' nem ';
                break;
            case '(':
                parenDepth++;
                result += '(';
                break;
            case ')':
                parenDepth--;
                result += ')';
                break;
        }
    }

    // Pós-processamento para melhorar a legibilidade
    result = result.trim();
    
    // Adiciona "Se" no início para condicionais
    if (formula.includes('→')) {
        // Verifica se não começa com negação ou parêntese com negação
        if (!result.startsWith('não') && !result.startsWith('(não')) {
            result = 'Se ' + result.charAt(0).toLowerCase() + result.slice(1);
        }
    }
    
    // Capitaliza a primeira letra
    if (result.length > 0 && !result.startsWith('Se')) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    // Remove espaços extras
    result = result.replace(/\s+/g, ' ');
    
    // Adiciona ponto final
    if (!result.endsWith('.')) {
        result += '.';
    }

    return result;
}

function calculateFormula() {
    const formula = document.getElementById('formula').value;
    const resultDiv = document.getElementById('result');
    const resultTextDiv = document.getElementById('resultText');

    if (validateFormula(formula)) {
        resultDiv.className = 'result valid';
        resultDiv.textContent = 'Fórmula válida ✅';
        resultDiv.style.display = 'block';

        // Traduz a fórmula
        const translation = translateFormula(formula);
        resultTextDiv.innerHTML = '<strong>Tradução:</strong><br>' + translation;
        resultTextDiv.style.display = 'block';
    } else {
        resultDiv.className = 'result invalid';
        resultDiv.textContent = 'Fórmula inválida ❌';
        resultDiv.style.display = 'block';
        resultTextDiv.style.display = 'none';
    }
}
