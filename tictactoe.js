class GameCell extends HTMLElement {
    constructor() {
        super()
        var shadow = this.attachShadow({mode: 'open'})
        var style = document.createElement('style')
        style.textContent = 'div {' +
            'width: 100px;' + 
            'height: 80px;' +
            'border: 1px solid black;' +
            'font-size: 60px;' +
            'text-align: center;' + 
            'padding-top: 20px;' +
        '}'
        shadow.appendChild(style)
        
        var element = document.createElement('div')
        element.onclick = (evt) => this.onClick()
        shadow.appendChild(element)
    }
    
    connectedCallback() {
        this.xIndex = this.attributes['x-index'].nodeValue
        this.yIndex = this.attributes['y-index'].nodeValue
    }
    
    onClick() {
        if (this.controller) {
            this.controller.onClick(this.xIndex, this.yIndex)
        }
    }
    
    setText(value) {
        this.shadowRoot.childNodes[1].textContent = value
    }
};

customElements.define('game-cell', GameCell)

class GameFieldRow extends HTMLElement {
    constructor() {
        super()
        var shadow = this.attachShadow({mode: 'open'})        
        var style = document.createElement('style')
        style.textContent =
            'game-cell { margin: 10px; float: left; }' + 
            'div.wrapper { display:flex; flex-direction:row; }'
        shadow.appendChild(style)
        
        this.cells = []
        
        var wrapper = document.createElement('div')
        wrapper.setAttribute('class', 'wrapper')
        for (var ix=0; ix<3; ix++) {
            var cell = document.createElement('game-cell')
            this.cells.push(cell)
            wrapper.appendChild(cell)
        }
        shadow.appendChild(wrapper)        
    }
    
    connectedCallback() {
        this.yIndex = this.attributes['y-index'].nodeValue
        for (var ix=0; ix<this.cells.length; ix++) {
            this.cells[ix].setAttribute('x-index', ix)
            this.cells[ix].setAttribute('y-index', this.yIndex)
            this.cells[ix].controller = this.controller
        }
    }
    
    setText(xIndex, value) {
        this.cells[xIndex].setText(value)
    }
}

customElements.define('game-field-row', GameFieldRow)

class GameField extends HTMLElement {
    constructor() {
        super()
        var shadow = this.attachShadow({mode: 'open'})
        var style = document.createElement('style')
        style.textContent = 
            'game-field-row { width: 360px; height: 120px; }' + 
            'div.resolution { width: 360px; font-size: x-large; padding: 20px; text-align:center; }'
        shadow.appendChild(style)
        
        this.rows = []
        for (var ix=0; ix<3; ix++) {
            var element = document.createElement('game-field-row')
            this.rows.push(element)
            shadow.appendChild(element)
        }
        
        this.resolutionElement = document.createElement('div')
        this.resolutionElement.setAttribute('class', 'resolution')
        shadow.appendChild(this.resolutionElement)
    }
    
    connectedCallback() {
        var controller = new GameController(this)
        for (var ix=0; ix<this.rows.length; ix++) {
            this.rows[ix].setAttribute('y-index', ix)
            this.rows[ix].controller = controller
        }
    }
    
    setText(xIndex, yIndex, value) {
        this.rows[yIndex].setText(xIndex, value)
    }
    
    setResolution(text) {
        this.resolutionElement.textContent = text
    }
}

customElements.define('game-field', GameField)

class GameController {
    constructor(fieldComponent) {
        this.field = fieldComponent
        this.data = []
        for (var x=0; x<3; x++) {
            this.data.push([])
            for (var y=0; y<3; y++) {
                this.data[x].push(null)
            }
        }
        this.gameIsOver = false
    }
    
    onClick(xIndex, yIndex) {
        if (this.gameIsOver || (this.data[xIndex][yIndex] !== null)) {
            return
        }
        this.set(xIndex, yIndex, 'X')
        if (this.gameIsOver) {
            return
        }
        this.makeAIMove()
    }

    makeAIMove() {
        while (true) {
            var xIndex = Math.floor(Math.random() * 3)
            var yIndex = Math.floor(Math.random() * 3)
            if (this.data[xIndex][yIndex] === null) {
                this.set(xIndex, yIndex, 'O')
                return
            }
        }
    }
    
    set(xIndex, yIndex, value) {
        this.data[xIndex][yIndex] = value
        this.field.setText(xIndex, yIndex, value)
        this.checkGameOver()
    }
    
    checkGameOver() {
        for (var ix=0; ix<3; ix++) {
            if (this.checkWinLose(0, ix, 2, ix)) {
                return
            }
            if (this.checkWinLose(ix, 0, ix, 2)) {
                return
            }
        }
        if (this.checkWinLose(0, 0, 2, 2)) {
            return
        }
        if (this.checkWinLose(0, 2, 2, 0)) {
            return
        }
        for (var ix=0; ix<3; ix++) {
            for (var jx=0; jx<3; jx++) {
                if (this.data[ix][jx] === null) {
                    return
                }
            }
        }
        this.declare("It's a draw!")
    }
    
    checkWinLose(ax, ay, cx, cy) {
        var bx = (ax + cx) / 2, by = (ay + cy) / 2
        var a = this.data[ax][ay], b = this.data[bx][by], c = this.data[cx][cy]
        if ((a === null) || (b === null) || (c === null)) {
            return false
        }
        if ((a !== b) || (a !== c)) {
            return false
        }
        if (a == 'X') {
            this.declare("You won!")
        } else {
            this.declare("I won!")
        }
        return true
    }
    
    declare(text) {
        this.field.setResolution(text)
        this.gameIsOver = true
    }
}
