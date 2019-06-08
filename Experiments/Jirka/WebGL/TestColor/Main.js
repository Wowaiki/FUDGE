"use strict";
var TestColor;
(function (TestColor) {
    let gl;
    let renderInfos = [];
    let shaderInfos = [];
    window.addEventListener("load", init);
    function init(_event) {
        const canvas = utils.getCanvas("webgl-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl = utils.getGLContext(canvas);
        gl.clearColor(0, 0, 0, 1);
        addProgram(TestColor.shader.vertexSimple, TestColor.shader.fragmentYellow);
        addProgram(TestColor.shader.vertexSimple, TestColor.shader.fragmentRed);
        addProgram(TestColor.shader.vertexColor, TestColor.shader.fragmentColor);
        createRenderInfo(TestColor.square, shaderInfos[2], new TestColor.MaterialColor(1, 1, 0, 1));
        createRenderInfo(TestColor.triangle, shaderInfos[2], new TestColor.MaterialColor(1, 0, 0, 1));
        draw();
    }
    function addProgram(_vertex, _fragment) {
        const vertexShader = getShader(_vertex, gl.VERTEX_SHADER);
        const fragmentShader = getShader(_fragment, gl.FRAGMENT_SHADER);
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Could not initialize shaders");
        }
        let shaderInfo = {
            program: program,
            attributes: detectAttributes(program),
            uniforms: detectUniforms(program)
        };
        shaderInfos.push(shaderInfo);
    }
    function detectAttributes(_program) {
        let detectedAttributes = {};
        let attributeCount = gl.getProgramParameter(_program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attributeCount; i++) {
            let attributeInfo = gl.getActiveAttrib(_program, i);
            if (!attributeInfo) {
                break;
            }
            detectedAttributes[attributeInfo.name] = gl.getAttribLocation(_program, attributeInfo.name);
        }
        return detectedAttributes;
    }
    function detectUniforms(_program) {
        let detectedUniforms = {};
        let uniformCount = gl.getProgramParameter(_program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let info = gl.getActiveUniform(_program, i);
            if (!info) {
                break;
            }
            detectedUniforms[info.name] = gl.getUniformLocation(_program, info.name);
        }
        return detectedUniforms;
    }
    function getShader(_source, type) {
        let shader;
        shader = gl.createShader(type);
        gl.shaderSource(shader, _source);
        gl.compileShader(shader);
        // TODO: inculde validation in FUDGE
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    function createRenderInfo(_mesh, _shaderInfo, _material) {
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        // Setting up the VBO
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_mesh.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(_shaderInfo.attributes["aVertexPosition"]);
        gl.vertexAttribPointer(_shaderInfo.attributes["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);
        // Setting up the IBO
        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_mesh.indices), gl.STATIC_DRAW);
        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        let renderInfo = { shaderInfo: _shaderInfo, vao: vao, nIndices: _mesh.indices.length, material: _material };
        renderInfos.push(renderInfo);
    }
    // We call draw to render to our canvas
    function draw() {
        // Clear the scene
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        for (let renderInfo of renderInfos) {
            gl.useProgram(renderInfo.shaderInfo.program);
            renderInfo.material.setRenderData(gl, renderInfo.shaderInfo);
            gl.bindVertexArray(renderInfo.vao);
            gl.drawElements(gl.TRIANGLES, renderInfo.nIndices, gl.UNSIGNED_SHORT, 0);
        }
        // Clean
        gl.bindVertexArray(null);
    }
})(TestColor || (TestColor = {}));
//# sourceMappingURL=Main.js.map