
let functions = [];
let globalFunctions = {};
let globalVars = {};
let disabledSpriteMoves = {};
const DEFAULT_FUNCTION_TEXT = "Select Function";

class DefFunction {
    constructor(name = "", params = 0, fun, global = false) {
        this.name = name;
        this.fun = fun ?? (()=>{ return 0; });
        this.listeners = [];
        if (global) globalFunctions[name] = this;
        
        // Parameters
        if (typeof params == "number") {
            this.paramCount = params;
            this.parameters = [];
        } else {
            this.paramCount = params.length;
            this.parameters = params;
        }

    }

    addListener(logicFun) {
        // print("added listener");
        this.listeners.push(logicFun);
    }

    removeListeners() {
        this.listeners.length = 0;
    }

    removeListener(logicFun) {
        let idx = this.listeners.findIndex(e=>e===logicFun);
        if (idx == -1) return;
        // print("removing listener");
        this.listeners.splice(idx, 1);
    }

    executeListeners(scope, data = {}) {
        for (let listener of this.listeners) {
            listener.execute(scope, data);
        }
    }
}

class LogicFunction {
    constructor(name = "", params = 0) {
        this.name = name;
        this.fun = null;
        this.parent = null;
        this.parentObject = null;
        this.elem = null;
        this.buttonElem;
        this.paramCount = params;
        this.parameters = [];
        this.variableScope = [];
        this.isParam = false;
        this.depth = 0;
        this.defaultText = DEFAULT_FUNCTION_TEXT;
    }

    execute(scope = null, data = {}) {
        // Execute only when the function exists
        if (this.name == "") return null;

        this.variableScope = scope;
        
        // Check if a standard function exists
        if (this.fun === null) {
            // Try to parse it as a number
            let value = parseFloat(this.name);
            if (!isNaN(value)) return value;

            // Check if boolean
            if (this.name == "true") return true;
            if (this.name == "false") return false;

            // Check if it is a string
            if (this.name.length > 1 && this.name[0] == "\"" && this.name[this.name.length - 1] == "\"") {
                return this.name.substring(1, this.name.length - 1);
            }

            // Try to find the variable value
            let variable = this.getVariableFromScope(this.name);
            if (variable !== null) return variable;

            // Return name of function (could be variable)
            return this.name;
        }

        // Execute function with parameters
        return this.fun.fun(this.parameters, this, data);
    }

    getVariableFromScope(varName) {
        if (this.variableScope !== null) {
            for (let variable of this.variableScope) {
                if (variable.name == varName) {
                    if (typeof variable.value == "function")
                        return variable.value();
                    else
                        return variable.value;
                }
            }
        }

        if (this.parent === null) return null;
        return this.parent.getVariableFromScope(varName);
    }

    removeParameter(fun) {
        if (!fun.isParam) {
            this.paramCount--;
            this.parameters.removeObj(fun);
        }
    }

    setFunction(name) {
        this.name = name;
        if (name) {
            this.buttonElem.classList.remove("default");
            this.buttonElem.innerText = name;
        } else {
            this.buttonElem.innerText = this.defaultText;
            this.buttonElem.classList.add("default");
        }

        // Remove old params
        for (let param of this.parameters) {
            param.elem.remove();
        }
        this.parameters.length = 0;
        this.paramCount = 0;

        let fun = functions.find(e => e.name == name);
        if (!fun) return; // Not found (create new function instead)
        this.fun = fun;
        fun.addListener(this);

        // Add param objects
        for (let i = 0; i < fun.paramCount; ++i) {
            let defaultText = fun.parameters[i] ?? DEFAULT_FUNCTION_TEXT;
            let param = addFunctionParameter(this, true, defaultText);
            param.defaultText = defaultText;
        }

        return true;
    }

    delete() {
        selectedFunction.reset();
        selectedFunction.elem.remove();
        this.parentObject.removeFunction(this);

        if (!this.isParam && this.parent !== null) {
            this.parent.removeParameter(this);
        }
    }

    reset() {
        this.name = "";
        this.buttonElem.innerText = this.defaultText;
        this.buttonElem.classList.add("default");

        // Remove params
        for (let i = 0; i < this.paramCount; ++i) {
            this.parameters[i].elem.remove();
        }
        this.parameters.length = 0;

        // Possible meory leak with not removing param reference from parent function
        if (this.fun !== null) {
            this.fun.removeListener(this);
            this.fun = null;
        }
    }

    updateUI() {
        const funName = document.getElementById("function-name");
        if (this.name == this.defaultText) funName.value = "";
        else funName.value = this.name;
    }

    import(data) {
        // Add required params
        this.setFunction(data[0]);

        // Add additional params
        for (let i = this.paramCount; i < data.length - 1; ++i) {
            let param = addFunctionParameter(this, false);
        }

        // Import the parameters
        for (let i = 0; i < this.paramCount; ++i) {
            this.parameters[i].import(data[1 + i]);
        }
    }

    export() {
        let obj = [this.name];
        for (let param of this.parameters) {
            obj.push(param.export());
        }
        return obj;
    }
}
function initFunctions() {
    // Add variable param to gui
    functions.push(new DefFunction("If", ["condition", null], params => {
        let bool = params[0].execute();
        if (bool) {
            for (let i = 1; i < params.length; ++i) {
                params[i].execute();
            }
        }
        return bool;
    }));
    functions.push(new DefFunction("For Every Piece", 1, (params, fun) => {
        // Create unique name for the piece variable
        let instance = 0;
        let name = "piece_" + instance;
        while (fun.getVariableFromScope(name) !== null) {
            name = "piece_" + (++instance);
        }

        for (let r = 0; r < game.board.rows; ++r) {
            for (let c = 0; c < game.board.cols; ++c) {
                let tile = game.board.tiles[r][c];
                let piece = tile.piece;
                if (!piece) continue;
                // print(piece.name);
                for (let param of params) {
                    let result = param.execute([{name: name, value:piece}]);
                }
            }
        }
    }));
    functions.push(new DefFunction("Set Global Variable", ["name", "value"], params => {
        let name = params[0].execute();
        let value = params[1].execute();
        globalVars[name] = value;
    }));
    functions.push(new DefFunction("Set Local Variable", ["name", "value"], (params, fun) => {
        // Must be a piece object
        if (fun.parentObject.constructor.name != "PieceBlueprint") return;
        let name = params[0].execute();
        let value = params[1].execute();
        
        // Get reference to the piece
        let piece = fun.getVariableFromScope("this");
        piece.localVariables[name] = value;
    }));
    functions.push(new DefFunction("Set Piece Variable", ["piece", "variable", "value"], (params, fun) => {
        let piece = params[0].execute();
        let name = params[1].execute();
        let value = params[2].execute();
        if (!piece) return;
        return piece.localVariables[name] = value;
    }));
    functions.push(new DefFunction("Global Variable", ["name"], params => {
        let name = params[0].execute();
        return globalVars[name];
    }));
    functions.push(new DefFunction("Local Variable", ["name"], (params, fun) => {
        // Must be a piece object
        if (fun.parentObject.constructor.name != "PieceBlueprint") return;
        let name = params[0].execute();
        
        // Get reference to the piece
        let piece = fun.getVariableFromScope("this");
        return piece.localVariables[name];
    }));
    functions.push(new DefFunction("Piece Variable", ["piece", "variable"], (params, fun) => {
        let piece = params[0].execute();
        let name = params[1].execute();
        if (!piece) return;
        return piece.localVariables[name];
    }));
    functions.push(new DefFunction("While", ["condition", null], params => {
        let bool = params[0].execute();
        let iters = 0;
        while (bool) {
            params[1].execute();

            if (++iters >= 100000) {
                console.error("TOO MANY ITERATIONS!");
                break;
            }

            // Re-evaluate boolean
            bool = params[0].execute();
        }
    }));
    functions.push(new DefFunction("Execute", 1, (params, fun) => {
        for (let param of params) {
            param.execute();
        }
    }));
    
    // Arithmetic
    functions.push(new DefFunction("Equals", 2, params => {
        return params[0].execute() == params[1].execute();
    }));
    functions.push(new DefFunction("Does Not Equal", 2, params => {
        return params[0].execute() != params[1].execute();
    }));
    functions.push(new DefFunction("Not", 1, params => {
        let value = params[0].execute();
        return !value;
    }));
    functions.push(new DefFunction("And", 2, params => {
        return params[0].execute() && params[1].execute();
    }));
    functions.push(new DefFunction("Or", 2, params => {
        return params[0].execute() || params[1].execute();
    }));
    functions.push(new DefFunction("Greater Than", 2, params => {
        return params[0].execute() > params[1].execute();
    }));
    functions.push(new DefFunction("Less Than", 2, params => {
        return params[0].execute() < params[1].execute();
    }));
    functions.push(new DefFunction("Add", 2, params => {
        return params[0].execute() + params[1].execute();
    }));
    functions.push(new DefFunction("Add To Global Variable", ["variable", "value"], params => {
        let name = params[0].execute();
        let value = params[1].execute();
        return globalVars[name] += value;
    }));
    functions.push(new DefFunction("Add To Local Variable", ["variable", "value"], params => {
        // Must be a piece object
        if (fun.parentObject.constructor.name != "PieceBlueprint") return;
        let name = params[0].execute();
        let value = params[1].execute();
        
        // Get reference to the piece
        let piece = fun.getVariableFromScope("this");
        piece.localVariables[name] += value;
    }));
    functions.push(new DefFunction("Add To Piece Variable", ["piece", "variable", "value"], params => {
        let piece = params[0].execute();
        let name = params[1].execute();
        let value = params[2].execute();
        if (!piece) return;
        piece.localVariables[name] += value;
    }));
    functions.push(new DefFunction("Substract", 2, params => {
        return params[0].execute() - params[1].execute();
    }));
    functions.push(new DefFunction("Multiply", 2, params => {
        return params[0].execute() * params[1].execute();
    }));
    functions.push(new DefFunction("Divide", 2, params => {
        return params[0].execute() / params[1].execute();
    }));
    functions.push(new DefFunction("Remainder", 2, params => {
        return params[0].execute() % params[1].execute();
    }));
    functions.push(new DefFunction("Power", 2, params => {
        return params[0].execute() ** params[1].execute();
    }));
    functions.push(new DefFunction("Absolute Value of", 1, params => {
        return Math.abs(params[0].execute());
    }));

    // Events
    functions.push(new DefFunction("Every Tick", 1, params => {
        for (let param of params) {
            param.execute();
        }
    }, true));
    functions.push(new DefFunction("On Start", 1, (params, fun) => {
        if (fun.parentObject.constructor.name == "PieceBlueprint") {
            // If we are in a piece scope this should be executed for
            // every piece with a variable added to the scope (this)
            // to reference the piece

            for (let r = 0; r < game.board.rows; ++r) {
                for (let c = 0; c < game.board.cols; ++c) {
                    let tile = game.board.tiles[r][c];
                    let piece = tile.piece;
                    if (!piece) continue;
                    if (piece.name != fun.parentObject.name) continue;
                    for (let param of params) {
                        let result = param.execute([
                            {name: "this", value:piece},
                            {name: "this.row", value:piece.tile.row},
                            {name: "this.col", value:piece.tile.col},
                            {name: "this.sprite", value:piece.team},
                        ]);
                    }
                }
            }
        } else {
            // Rule blueprint
            for (let param of params) {
                param.execute();
            }
        }
    }, true));
    functions.push(new DefFunction("Piece Moved", 1, (params, fun, data) => {

        // Only execute if the pieces match (first one should be "this")
        if (fun.parentObject.constructor.name == "PieceBlueprint") {
            if (data.piece.name != fun.parentObject.name) return;
            fun.variableScope.push(
                {name: "this", value: data.piece},
                {name: "this.row", value: data.piece.tile.row},
                {name: "this.col", value: data.piece.tile.col},
                {name: "this.sprite", value: data.piece.team},
                {name: "this.vector", value: data.vector},
                {name: "this.vector.rows", value: data.vector.rows},
                {name: "this.vector.cols", value: data.vector.cols},
            );
        } else {
            // Create unique name for the piece variable
            let instance = 0;
            let name = "piece_" + instance;
            while (fun.getVariableFromScope(name) !== null) {
                name = "piece_" + (++instance);
            }
            fun.variableScope.push(
                {name: name, value: data.piece},
                {name: name + ".row", value: data.piece.tile.row},
                {name: name + ".col", value: data.piece.tile.col},
                {name: name + ".sprite", value: data.piece.team},
                {name: name + ".vector", value: data.vector},
                {name: name + ".vector.rows", value: data.vector.rows},
                {name: name + ".vector.cols", value: data.vector.cols},
            );
        }

        for (let param of params) {
            param.execute();
        }
    }, true));
    
    // Output
    functions.push(new DefFunction("Log to Console", 1, params => {
        for (let param of params) {
            let value = param.execute();
            print(value);
        }
    }));
    functions.push(new DefFunction("Alert", 1, params => {
        let value = params[0].execute();
        alert(value);
    }));

    // Pieces
    functions.push(new DefFunction("Piece Name", ["piece"], params => {
        let piece = params[0].execute();
        
        // Error catching (not piece)
        try {
            if (piece.constructor.name != "Piece") return null;
        } catch (exception) {
            return null;
        }

        return piece.name;
    }));
    functions.push(new DefFunction("Set Piece Sprite", ["piece", "sprite"], (params, fun) => {
        let piece = params[0].execute();
        let sprite = params[1].execute();
        piece.team = sprite;
    }));
    functions.push(new DefFunction("Move Piece", ["piece", "row", "col"], (params, fun) => {
        let piece = params[0].execute();
        let row = params[1].execute();
        let col = params[2].execute();
        movePiece(piece.tile, getTile(game.board, row, col), true);
    }));
    functions.push(new DefFunction("Remove Piece", ["row", "col"], (params, fun) => {
        let row = params[0].execute();
        let col = params[1].execute();
        removePiece(game.board, row, col);
    }));
    functions.push(new DefFunction("Remove Piece At", ["location"], (params, fun) => {
        let tile = params[0].execute();
        removePiece(game.board, tile.row, tile.col);
    }));
    functions.push(new DefFunction("Place Piece", ["row", "col", "piece", "sprite"], (params, fun) => {
        let row = params[0].execute();
        let col = params[1].execute();
        let piece = params[2].execute();
        let sprite = params[3].execute();
        if (!piece) return;
        setPiece(game.board, row, col, piece, sprite);
    }));
    functions.push(new DefFunction("Get Piece", ["row", "col"], (params, fun) => {
        let row = params[0].execute();
        let col = params[1].execute();
        let tile = getTile(game.board, row, col);
        return tile.piece;
    }));
    functions.push(new DefFunction("Get Piece At", ["location"], (params, fun) => {
        let tile = params[0].execute();
        if (!tile.constructor || tile.constructor.name != "Tile") return null;
        return tile.piece;
    }));
    functions.push(new DefFunction("Allow Motion", ["piece", "row step", "col step", "range"], (params, fun) => {
        let piece = params[0].execute();
        let colStep = params[1].execute();
        let rowStep = params[2].execute();
        let range = params[3].execute();
        piece.allowMotion(colStep, rowStep, range);
    }));
    functions.push(new DefFunction("Allow Motion On Condition", ["piece", "row step", "col step", "range", "condition"], (params, fun) => {
        let piece = params[0].execute();
        let colStep = params[1].execute();
        let rowStep = params[2].execute();
        let range = params[3].execute();
        
        // The "this" reference to piece has been broke by now
        // have to fix this so each piece has their own instance
        // of all these functions...
        let condition = (toTile, vector)=>{
            let bool = params[4].execute([
                {name:"piece", value:piece},
                {name:"piece.row", value:()=>piece.tile.row},
                {name:"piece.col", value:()=>piece.tile.col},
                {name:"piece.sprite", value:()=>piece.team},
                {name:"location", value:toTile},
                {name:"location.row", value:()=>toTile.row},
                {name:"location.col", value:()=>toTile.col},
                {name:"vector", value:toTile.col},
                {name:"vector.rows", value:()=>vector.rows},
                {name:"vector.cols", value:()=>vector.cols},
            ]);
            return bool;
        }
        piece.allowMotion(colStep, rowStep, range, condition);
    }));
    functions.push(new DefFunction("Reset Restricted Motion", ["piece"], (params, fun) => {
        let piece = params[0].execute();
        piece.resetMotionVectors();
    }));
    functions.push(new DefFunction("Remove Motion Vector", ["piece", "index"], (params, fun) => {
        let piece = params[0].execute();
        let index = params[1].execute();
        piece.removeMotionVector(index);
    }));
    functions.push(new DefFunction("Toggle Pass-Through", ["piece", "true/false"], (params, fun) => {
        let piece = params[0].execute();
        let bool = params[1].execute();
        piece.passThrough = bool;
    }));
    functions.push(new DefFunction("Toggle Equal Sprite Capture", ["piece", "true/false"], (params, fun) => {
        let piece = params[0].execute();
        let bool = params[1].execute();
        piece.selfCapture = bool;
    }));
    functions.push(new DefFunction("Toggle Moves For Sprite", ["index", "true/false"], (params, fun) => {
        let index = params[0].execute();
        let bool = params[1].execute();
        disabledSpriteMoves[index] = bool;
    }));
}
