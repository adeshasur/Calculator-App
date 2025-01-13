const screen = document.querySelector('.screen');
const buttons = document.querySelectorAll('.calc-btn');

let currentInput = '0';
let previousInput = '';
let operation = null;

function updateScreen(value) {
    screen.textContent = value;
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent.trim();

        if (!isNaN(value)) {
            if (currentInput === '0') {
                currentInput = value;
            } else {
                currentInput += value;
            }
        } else if (value === 'C') {
            currentInput = '0';
            previousInput = '';
            operation = null;
        } else if (value === '←') {
            currentInput = currentInput.slice(0, -1) || '0';
        } else if (value === '=') {
            if (operation && previousInput) {
                currentInput = evaluateExpression(previousInput, currentInput, operation);
                previousInput = '';
                operation = null;
            }
        } else {
            if (operation && previousInput) {
                currentInput = evaluateExpression(previousInput, currentInput, operation);
            }
            previousInput = currentInput;
            currentInput = '0';
            operation = value;
        }

        updateScreen(currentInput);
    });
});

function evaluateExpression(num1, num2, operator) {
    const a = parseFloat(num1);
    const b = parseFloat(num2);

    switch (operator) {
        case '+':
            return (a + b).toString();
        case '−':
            return (a - b).toString();
        case '×':
            return (a * b).toString();
        case '÷':
            return b !== 0 ? (a / b).toString() : 'Error';
        default:
            return '0';
    }
}

updateScreen(currentInput);
