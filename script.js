class Calculator {
    constructor() {
        this.displayResult = document.getElementById('result');
        this.displayExpression = document.getElementById('expression');
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        
        this.init();
    }

    init() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => this.handleButtonClick(button));
        });

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleButtonClick(button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 150);

        const action = button.dataset.action;
        const value = button.textContent;

        if (button.classList.contains('btn-number')) {
            this.inputNumber(value);
        } else if (action) {
            this.inputAction(action, value);
        }
    }

    inputNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentOperand = num;
            this.shouldResetDisplay = false;
        } else {
            if (this.currentOperand === '0' && num !== '.') {
                this.currentOperand = num;
            } else if (num === '.' && !this.currentOperand.includes('.')) {
                this.currentOperand += '.';
            } else if (num !== '.') {
                this.currentOperand += num;
            }
        }
        this.updateDisplay();
    }

    inputAction(action, value) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'toggle-sign':
                this.toggleSign();
                break;
            case 'percent':
                this.percent();
                break;
            case 'operator':
                this.setOperation(value);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.inputNumber('.');
                break;
            case 'zero':
                this.inputNumber('0');
                break;
        }
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.updateDisplay();
        this.displayExpression.textContent = '';
        this.displayExpression.style.visibility = 'hidden';
    }

    toggleSign() {
        if (this.currentOperand !== '0') {
            this.currentOperand = this.currentOperand.startsWith('-') 
                ? this.currentOperand.slice(1) 
                : '-' + this.currentOperand;
            this.updateDisplay();
        }
    }

    percent() {
        const value = parseFloat(this.currentOperand);
        this.currentOperand = (value / 100).toString();
        this.updateDisplay();
    }

    setOperation(nextOperation) {
        if (this.operation && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.previousOperand = this.currentOperand;
        this.operation = nextOperation;
        this.shouldResetDisplay = true;
        this.updateExpression();
    }

    calculate() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = null;
                    this.previousOperand = '';
                    this.shouldResetDisplay = true;
                    this.updateDisplay();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Fix precision issues
        result = parseFloat(result.toPrecision(12));

        this.currentOperand = result.toString();
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.updateExpression();
    }

    formatResult(operand) {
        if (operand === 'Error' || operand === '') return operand;
        
        const stringNumber = operand.toString();
        const parts = stringNumber.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        
        const integerDigits = parseFloat(integerPart);
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = integerPart === '-' ? '-' : '0';
        } else {
            // Handle negative zero and large/small integers
            integerDisplay = integerDigits.toLocaleString('en', { 
                maximumFractionDigits: 0 
            });
            // If it was negative zero but toLocaleString showed "0"
            if (integerPart === '-0' || (integerDigits === 0 && integerPart.startsWith('-'))) {
                integerDisplay = '-' + integerDisplay;
            }
        }

        if (decimalPart !== undefined) {
            return `${integerDisplay}.${decimalPart}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.displayResult.textContent = this.formatResult(this.currentOperand);
        
        if (this.displayResult.textContent.length > 10) {
            this.displayResult.style.fontSize = '32px';
        } else {
            this.displayResult.style.fontSize = '48px';
        }
    }

    updateExpression() {
        let expression = '';
        
        if (this.previousOperand !== '') {
            expression += this.formatResult(this.previousOperand);
        }
        
        if (this.operation !== null) {
            expression += ` ${this.operation} `;
            // Show the second operand if we're mid-calculation
            if (!this.shouldResetDisplay) {
                expression += this.formatResult(this.currentOperand);
            }
        }
        
        this.displayExpression.textContent = expression;
        this.displayExpression.style.visibility = expression ? 'visible' : 'hidden';
    }

    handleKeyboard(e) {
        const key = e.key;
        let button = null;

        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
            if (key === '0') {
                button = document.querySelector('[data-action="zero"]');
            } else {
                button = Array.from(document.querySelectorAll('.btn-number')).find(b => b.textContent === key);
            }
        } else if (key === '.' || key === ',') {
            this.inputNumber('.');
            button = document.querySelector('[data-action="decimal"]');
        } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === 'x' || key === 'X') {
            const opMap = { '*': '×', 'x': '×', 'X': '×', '/': '÷', '+': '+', '-': '−' };
            const opValue = opMap[key];
            this.setOperation(opValue);
            button = Array.from(document.querySelectorAll('.btn-operator')).find(b => b.textContent === opValue);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
            button = document.querySelector('[data-action="equals"]');
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
            button = document.querySelector('[data-action="clear"]');
        } else if (key === '%') {
            this.percent();
            button = document.querySelector('[data-action="percent"]');
        } else if (key === 'Backspace') {
            if (this.currentOperand.length > 1) {
                this.currentOperand = this.currentOperand.slice(0, -1);
            } else {
                this.currentOperand = '0';
            }
            this.updateDisplay();
        }

        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
