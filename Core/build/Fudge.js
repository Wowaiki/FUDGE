"use strict";
var Fudge;
(function (Fudge) {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Nodes]].
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Component {
        constructor() {
            this.container = null;
            this.singleton = false;
        }
        /**
         * Retrieves the type of this components subclass as the name of the runtime class
         * @returns The type of the component
         */
        get type() {
            return this.constructor.name;
        }
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        get isSingleton() {
            return this.singleton;
        }
        /**
         * Retrieves the node, this component is currently attached to
         * @returns The container node or null, if the component is not attached to
         */
        getContainer() {
            return this.container;
        }
        /**
         * Tries to add the component to the given node, removing it from the previous container if applicable
         * @param _container The node to attach this component to
         * TODO: write tests to prove consistency and correct exception handling
         */
        setContainer(_container) {
            if (this.container == _container)
                return;
            let previousContainer = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                this.container.addComponent(this);
            }
            catch {
                this.container = previousContainer;
            }
        }
    }
    Fudge.Component = Component;
})(Fudge || (Fudge = {}));
/// <reference path="Component.ts"/>
var Fudge;
/// <reference path="Component.ts"/>
(function (Fudge) {
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     */
    class CameraComponent extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.enabled = true; // TODO: examine, why this is meaningful. Or shouldn't this be a property of the superclass?
            this.orthographic = false; // Determines whether the image will be rendered with perspective or orthographic projection.
            this.projectionMatrix = new Fudge.Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
            this.fieldOfView = 45; // The camera's sensorangle.
            this.backgroundColor = new Fudge.Vector3(0, 0, 0); // The color of the background the camera will render.
            this.backgroundEnabled = true; // Determines whether or not the background of this camera will be rendered.
        }
        // TODO: examine, if background should be an attribute of Camera or Viewport
        activate(_on) {
            this.enabled = _on;
        }
        get isActive() {
            return this.enabled;
        }
        get isOrthographic() {
            return this.orthographic;
        }
        getBackgoundColor() {
            return this.backgroundColor;
        }
        getBackgroundEnabled() {
            return this.backgroundEnabled;
        }
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        get ViewProjectionMatrix() {
            try {
                let transform = this.getContainer().getComponents(Fudge.TransformComponent)[0];
                let viewMatrix = Fudge.Matrix4x4.inverse(transform.Matrix); // TODO: examine, why Matrix is used and not WorldMatrix!
                return Fudge.Matrix4x4.multiply(this.projectionMatrix, viewMatrix);
            }
            catch {
                return this.projectionMatrix;
            }
        }
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        projectCentral(_aspect = Fudge.gl2.canvas.clientWidth / Fudge.gl2.canvas.clientHeight, _fieldOfView = 45) {
            this.fieldOfView = _fieldOfView;
            console.log(this.fieldOfView); // TODO: remove, this is just here to remove "never used"
            this.orthographic = false;
            this.projectionMatrix = Fudge.Matrix4x4.centralProjection(_aspect, _fieldOfView, 1, 2000);
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left = 0, _right = Fudge.gl2.canvas.clientWidth, _bottom = Fudge.gl2.canvas.clientHeight, _top = 0) {
            this.orthographic = true;
            this.projectionMatrix = Fudge.Matrix4x4.orthographicProjection(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
    }
    Fudge.CameraComponent = CameraComponent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    class MaterialComponent extends Fudge.Component {
        // TODO: clearify what a "material" actually is and its relation to the shader. Isn't it just shader parameters? Can then the material be independent of the shader?
        initialize(_material) {
            this.material = _material;
        }
        get Material() {
            return this.material;
        }
    }
    Fudge.MaterialComponent = MaterialComponent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     */
    class MeshComponent extends Fudge.Component {
        initialize(_positions, _size = 3, _dataType = Fudge.gl2.FLOAT, _normalize = false) {
            this.positions = _positions;
            this.bufferSpecification = {
                size: _size,
                dataType: _dataType,
                normalize: _normalize,
                stride: 0,
                offset: 0
            };
            this.vertexCount = this.positions.length / this.bufferSpecification.size;
            if ((this.vertexCount % this.bufferSpecification.size) != 0) {
                console.log(this.vertexCount);
                throw new Error("Number of entries in positions[] and size do not match.");
            }
            this.normals = this.computeNormals();
        }
        get Positions() {
            return this.positions;
        }
        get BufferSpecification() {
            return this.bufferSpecification;
        }
        get VertexCount() {
            return this.vertexCount;
        }
        get Normals() {
            return this.normals;
        }
        /**
         * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
         * @param _materialComponent The materialcomponent attached to the same node.
         */
        applyColor(_materialComponent) {
            let colorPerPosition = [];
            for (let i = 0; i < this.vertexCount; i++) {
                colorPerPosition.push(_materialComponent.Material.Color.X, _materialComponent.Material.Color.Y, _materialComponent.Material.Color.Z);
            }
            Fudge.gl2.bufferData(Fudge.gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), Fudge.gl2.STATIC_DRAW);
        }
        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture was added to.
         */
        setTextureCoordinates() {
            let textureCoordinates = [];
            let quadCount = this.vertexCount / 6;
            for (let i = 0; i < quadCount; i++) {
                textureCoordinates.push(0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0);
            }
            Fudge.gl2.bufferData(Fudge.gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), Fudge.gl2.STATIC_DRAW);
        }
        /**
         * Computes the normal for each triangle of this mesh and applies it to each of the triangles vertices.
         */
        computeNormals() {
            let normals = [];
            let normal = new Fudge.Vector3;
            let p = this.positions;
            for (let i = 0; i < p.length; i += 9) {
                let vector1 = new Fudge.Vector3(p[i + 3] - p[i], p[i + 4] - p[i + 1], p[i + 5] - p[i + 2]);
                let vector2 = new Fudge.Vector3(p[i + 6] - p[i], p[i + 7] - p[i + 1], p[i + 8] - p[i + 2]);
                normal = Fudge.Vector3.normalize(Fudge.Vector3.cross(vector1, vector2));
                normals.push(normal.X, normal.Y, normal.Z);
                normals.push(normal.X, normal.Y, normal.Z);
                normals.push(normal.X, normal.Y, normal.Z);
            }
            return new Float32Array(normals);
        }
    }
    Fudge.MeshComponent = MeshComponent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     */
    class PivotComponent extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.matrix = Fudge.Matrix4x4.identity(); // The matrix to transform the mesh by.
        }
        get Matrix() {
            return this.matrix;
        }
        get Position() {
            return new Fudge.Vector3(this.matrix.Data[12], this.matrix.Data[13], this.matrix.Data[14]);
        }
        /**
         * # Transformation methods
         */
        /**
         * Resets this.matrix to idenity Matrix.
         */
        reset() {
            this.matrix = Fudge.Matrix4x4.identity();
        }
        /**
         * # Translation methods
         */
        /**
         * Translate the transformation along the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        translate(_x, _y, _z) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, _x, _y, _z);
        }
        /**
         * Translate the transformation along the x-axis.
         * @param _x The value of the translation.
         */
        translateX(_x) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, _x, 0, 0);
        }
        /**
         * Translate the transformation along the y-axis.
         * @param _y The value of the translation.
         */
        translateY(_y) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, 0, _y, 0);
        }
        /**
         * Translate the transformation along the z-axis.
         * @param _z The value of the translation.
         */
        translateZ(_z) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, 0, 0, _z);
        }
        /**
         * # Rotation methods
         */
        /**
         * Rotate the transformation along the around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateX(_angle) {
            this.matrix = Fudge.Matrix4x4.rotateX(this.matrix, _angle);
        }
        /**
         * Rotate the transformation along the around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateY(_angle) {
            this.matrix = Fudge.Matrix4x4.rotateY(this.matrix, _angle);
        }
        /**
         * Rotate the transformation along the around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateZ(_zAngle) {
            this.matrix = Fudge.Matrix4x4.rotateZ(this.matrix, _zAngle);
        }
        /**
         * Wrapper function to rotate the transform so that its z-Axis is facing in the direction of the targets position.
         * TODO: This method does not work properly if the mesh that calls it and the target are ancestor/descendant of
         * one another, as it does not take into account the transformation that is passed from one to the other.
         * @param _target The target to look at.
         */
        lookAt(_target) {
            this.matrix = Fudge.Matrix4x4.lookAt(this.Position, _target); // TODO: Handle rotation around z-axis
        }
        /**
         * # Scaling methods
         */
        /**
         * Scale the transformation along the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        scale(_xScale, _yScale, _zScale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, _xScale, _yScale, _zScale);
        }
        /**
         * Scale the transformation along the x-axis.
         * @param _scale The value to scale by.
         */
        scaleX(_scale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, _scale, 1, 1);
        }
        /**
         * Scale the transformation along the y-axis.
         * @param _scale The value to scale by.
         */
        scaleY(_scale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, 1, _scale, 1);
        }
        /**
         * Scale the transformation along the z-axis.
         * @param _scale The value to scale by.
         */
        scaleZ(_scale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, 1, 1, _scale);
        }
    }
    Fudge.PivotComponent = PivotComponent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold the transformation-data of the node it is attached to. Extends PivotComponent for fewer redundancies.
     * Affects the origin of a node and its descendants. Use [[PivotComponent]] to transform only the mesh attached
     */
    class TransformComponent extends Fudge.PivotComponent {
        //* TODO: figure out why there is an extra matrix necessary. Implement initialize method if applicable
        constructor() {
            super();
            //this.worldMatrix = this.matrix; // TODO: worldMatrix and matrix both reference the same object. Nonsense
        }
        //*/
        // Get and Set methods.######################################################################################
        get WorldMatrix() {
            /* */ return this.worldMatrix;
            //* */return this.matrix;
        }
        set WorldMatrix(_matrix) {
            /* */ this.worldMatrix = _matrix;
            //* */this.matrix = _matrix; 
        }
        get WorldPosition() {
            /* */ return new Fudge.Vector3(this.worldMatrix.Data[12], this.worldMatrix.Data[13], this.worldMatrix.Data[14]);
            //* */return new Vec3(this.matrix.Data[12], this.matrix.Data[13], this.matrix.Data[14]);
        }
    }
    Fudge.TransformComponent = TransformComponent;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class handling all created fudgenodes, viewports and materials.
     */
    class AssetManager {
        /**
         * Identifies the passed asset's class and loads it into the fitting array
         * @param _asset
         */
        static addAsset(_asset) {
            if (_asset instanceof Fudge.Node) {
                if (this.nodes[_asset.Name] === undefined) {
                    this.nodes[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a fudgenode named '${_asset.Name}'.`);
                }
            }
            else if (_asset instanceof Fudge.Material) {
                if (this.materials[_asset.Name] === undefined) {
                    this.materials[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a material named '${_asset.Name}'.`);
                }
            }
            else if (_asset instanceof Fudge.Viewport) {
                if (this.viewports[_asset.Name] === undefined) {
                    this.viewports[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a viewport named '${_asset.Name}'.`);
                }
            }
        }
        /**
         * Looks up the fudgenode with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getNode(_name) {
            return this.nodes[_name];
        }
        /**
         * Returns an object containing all fudgenodes that are currently in the array.
         */
        static getNodes() {
            return this.nodes;
        }
        /**
         * Removes the fudgenode with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteFudgeNode(_name) {
            if (this.nodes[_name] === undefined) {
                throw new Error(`Cannot find fudgenode named '${_name}'.`);
            }
            else {
                delete this.nodes[_name];
            }
        }
        /**
         * Looks up the viewport with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getViewport(_name) {
            return this.viewports[_name];
        }
        /**
         * Returns an object containing all viewports that are currently in the array.
         */
        static getViewports() {
            return this.viewports;
        }
        /**
         * Removes the viewport with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteViewport(_name) {
            if (this.viewports[_name] === undefined) {
                throw new Error(`Cannot find viewport named '${_name}'.`);
            }
            else {
                delete this.viewports[_name];
            }
        }
        /**
         * Looks up the material with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getMaterial(_name) {
            return this.materials[_name];
        }
        /**
         * Returns an object containing all materials that are currently in the array.
         */
        static getMaterials() {
            return this.materials;
        }
        /**
         * Removes the material with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteMaterial(_name) {
            if (this.materials[_name] === undefined) {
                throw new Error(`Cannot find Material named '${_name}'.`);
            }
            else {
                delete this.materials[_name];
            }
        }
    }
    AssetManager.nodes = {}; // Associative array for created fudgenodes.
    AssetManager.viewports = {}; // Associative array for created viewports.
    AssetManager.materials = {};
    Fudge.AssetManager = AssetManager;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class Color {
    }
    Fudge.Color = Color;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Utility class to sore and/or wrap some functionality.
     */
    class GLUtil {
        /**
         * Sets up canvas and renderingcontext. If no canvasID is passed, a canvas will be created.
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        static initializeContext(_elementID) {
            let canvas;
            if (_elementID !== undefined) { // Check if ID was passed. 
                canvas = document.getElementById(_elementID);
                if (canvas === undefined) { // Check if element by passed ID exists. Otherwise throw Error.
                    throw new Error("Cannot find a canvas Element named: " + _elementID);
                }
            }
            else { // If no Canvas ID was passed, create new canvas with default width and height. 
                console.log("Creating new canvas...");
                canvas = document.createElement("canvas");
                canvas.id = "canvas";
                canvas.width = 800;
                canvas.height = 640;
                document.body.appendChild(canvas);
            }
            Fudge.gl2 = GLUtil.assert(canvas.getContext("webgl2"), "WebGL-context couldn't be created");
            return canvas;
        }
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        static attributePointer(_attributeLocation, _bufferSpecification) {
            Fudge.gl2.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
        /**
         * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
         * @param _value // value to check against null
         * @param _message // optional, additional message for the exception
         */
        static assert(_value, _message = "") {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${Fudge.gl2 ? Fudge.gl2.getError() : ""}`);
            return _value;
        }
        /**
         * Wrapperclass that binds and initializes a texture.
         * @param _textureSource A string containing the path to the texture.
         */
        static createTexture(_textureSource) {
            let texture = GLUtil.assert(Fudge.gl2.createTexture());
            Fudge.gl2.bindTexture(Fudge.gl2.TEXTURE_2D, texture);
            // Fill the texture with a 1x1 blue pixel.
            Fudge.gl2.texImage2D(Fudge.gl2.TEXTURE_2D, 0, Fudge.gl2.RGBA, 1, 1, 0, Fudge.gl2.RGBA, Fudge.gl2.UNSIGNED_BYTE, new Uint8Array([170, 170, 255, 255]));
            // Asynchronously load an image
            let image = new Image();
            image.crossOrigin = "anonymous";
            image.src = _textureSource;
            image.onload = function () {
                Fudge.gl2.bindTexture(Fudge.gl2.TEXTURE_2D, texture);
                Fudge.gl2.texImage2D(Fudge.gl2.TEXTURE_2D, 0, Fudge.gl2.RGBA, Fudge.gl2.RGBA, Fudge.gl2.UNSIGNED_BYTE, image);
                Fudge.gl2.generateMipmap(Fudge.gl2.TEXTURE_2D);
            };
        }
    }
    Fudge.GLUtil = GLUtil;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     */
    class Material {
        // TODO: verify the connection of shader and material. The shader actually defines the properties of the material
        constructor(_name, _color, _shader) {
            this.name = _name;
            this.shader = _shader;
            this.positionAttributeLocation = Fudge.GLUtil.assert(this.shader.getAttributeLocation("a_position"));
            this.colorAttributeLocation = Fudge.GLUtil.assert(this.shader.getAttributeLocation("a_color"));
            this.textureCoordinateAtributeLocation = Fudge.GLUtil.assert(this.shader.getAttributeLocation("a_textureCoordinate"));
            this.matrixLocation = Fudge.GLUtil.assert(this.shader.getUniformLocation("u_matrix"));
            this.color = _color;
            this.colorBufferSpecification = {
                size: 3,
                dataType: Fudge.gl2.UNSIGNED_BYTE,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureBufferSpecification = {
                size: 2,
                dataType: Fudge.gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureEnabled = false;
            this.textureSource = "";
            Fudge.AssetManager.addAsset(this);
        }
        // Get methods. ######################################################################################
        get Shader() {
            return this.shader;
        }
        get Name() {
            return this.name;
        }
        get Color() {
            return this.color;
        }
        set Color(_color) {
            this.color = _color;
        }
        get ColorBufferSpecification() {
            return this.colorBufferSpecification;
        }
        get TextureBufferSpecification() {
            return this.textureBufferSpecification;
        }
        get TextureEnabled() {
            return this.textureEnabled;
        }
        get TextureSource() {
            return this.textureSource;
        }
        get PositionAttributeLocation() {
            return this.positionAttributeLocation;
        }
        get ColorAttributeLocation() {
            return this.colorAttributeLocation;
        }
        get MatrixUniformLocation() {
            return this.matrixLocation;
        }
        get TextureCoordinateLocation() {
            return this.textureCoordinateAtributeLocation;
        }
        // Color and Texture methods.######################################################################################
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        addTexture(_textureSource) {
            this.textureEnabled = true;
            this.textureSource = _textureSource;
        }
        /**
         * Removes and disables a texture that was added to this material.
         */
        removeTexture() {
            this.textureEnabled = false;
            this.textureSource = "";
        }
    }
    Fudge.Material = Material;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Represents a node in the scenetree.
     */
    class Node {
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name) {
            this.name = _name;
            this.children = {};
            this.components = {};
            this.layers = [];
            this.tags = [];
            Fudge.AssetManager.addAsset(this);
        }
        // Get and set methods.######################################################################################
        set Name(_name) {
            this.name = _name;
        }
        get Name() {
            return this.name;
        }
        get Parent() {
            return this.parent;
        }
        get Layers() {
            return this.layers;
        }
        get Tags() {
            return this.tags;
        }
        // Layer methods.######################################################################################
        /**
         * Adds the name of a layer to this nodes layerarray.
         * @param _name The name of the layer to add.
         */
        addLayer(_name) {
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i] == _name) {
                    console.log(`Node "${this.name}" is already on the layer "${_name}".`);
                    return;
                }
            }
            this.layers.push(_name);
            console.log(`Layer "${_name}" added to node "${this.name}".`);
        }
        /**
         * Removes the name of a layer from this nodes layerarray.
         * @param _name The name of the layer to remove.
         */
        removeLayer(_name) {
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i] == _name) {
                    this.layers.splice(i, 1);
                    console.log(`Layer "${_name}" removed from node "${this.name}".`);
                    return;
                }
            }
            console.log(`Node "${this.name}" is not on the layer "${_name}".`);
        }
        // Tag methods.######################################################################################
        /**
         * Adds the name of a tag to this nodes tagarray.
         * @param _name The name of the tag to add.
         */
        addTag(_name) {
            for (let i = 0; i < this.tags.length; i++) {
                if (this.tags[i] == _name) {
                    console.log(`Node "${this.name}" already has the tag "${_name}".`);
                    return;
                }
            }
            this.tags.push(_name);
            console.log(`Tag "${_name}" added to node "${this.name}".`);
        }
        /**
         * Removes the name of a tag to this nodes tagarray.
         * @param _name The name of the tag to remove.
         */
        removeTag(_name) {
            for (let i = 0; i < this.tags.length; i++) {
                if (this.tags[i] == _name) {
                    this.tags.splice(i, 1);
                    console.log(`Tag "${_name}" removed from node "${this.name}".`);
                    return;
                }
            }
            console.log(`Tag "${_name}" is not attached to node "${this.name}".`);
        }
        // Children methods.######################################################################################
        /**
         * Returns the children array of this node.
         */
        getChildren() {
            return this.children;
        }
        /**
         * Looks through this Nodes children array and returns a child with the supplied name.
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the supplied name.
         * @param _name The name of the child to be found.
         */
        getChildByName(_name) {
            let child;
            if (this.children[_name] != undefined) {
                child = this.children[_name];
                return child;
            }
            else {
                throw new Error(`Unable to find component named  '${_name}'in node named '${this.Name}'`);
            }
        }
        /**
         * Adds the supplied child into this nodes children array.
         * Calls setParent method of supplied child with this Node as parameter.
         * @param _child The child to be pushed into the array
         */
        appendChild(_child) {
            let name = _child.Name;
            if (this.children[name] != undefined) {
                throw new Error(`There is already a Child by the name '${_child.name}' in node named '${this.Name}'`);
            }
            else {
                this.children[name] = _child;
                _child.setParent(this);
            }
        }
        /**
         * Looks through this nodes children array, removes a child with the supplied name and sets the child's parent to undefined.
         * If there are multiple children with the same name in the array, only the first that is found will be removed.
         * Throws error if no child can be found by the name.
         * @param _name The name of the child to be removed.
         */
        removeChild(_name) {
            if (this.children[_name] != undefined) {
                let child = this.children[_name];
                child.setParent(null);
                delete this.children[_name];
            }
            else {
                throw new Error(`Unable to find child named  '${_name}'in node named '${this.name}'`);
            }
        }
        /**
         * Returns all components of the given class.
         * @param _name The name of the component to be found.
         */
        getComponents(_class) {
            return this.components[_class.name] || [];
        }
        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component) {
            if (this.components[_component.type] === undefined)
                this.components[_component.type] = [_component];
            else if (_component.isSingleton)
                throw new Error("Component is marked singleton and can't be attached, no more than one allowed");
            else
                this.components[_component.type].push(_component);
            _component.setContainer(this);
        }
        /**
         * Looks through this nodes component array, removes a component with the supplied name and sets the components parent to null.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         * @throws Exception when component is not found
         */
        removeComponent(_component) {
            try {
                let componentsOfType = this.components[_component.type];
                let foundAt = componentsOfType.indexOf(_component);
                componentsOfType.splice(foundAt, 1);
                _component.setContainer(null);
            }
            catch {
                throw new Error(`Unable to find component '${_component}'in node named '${this.name}'`);
            }
        }
        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        setParent(_parent) {
            this.parent = _parent;
        }
    }
    Fudge.Node = Node;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     */
    class Viewport {
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode
         * @param _camera
         */
        constructor(_name, _rootNode, _camera) {
            this.vertexArrayObjects = {}; // Associative array that holds a vertexarrayobject for each node in the tree(branch)
            this.buffers = {}; // Associative array that holds a buffer for each node in the tree(branch)
            this.name = _name;
            this.rootNode = _rootNode;
            this.camera = _camera;
            Fudge.AssetManager.addAsset(this);
            this.initializeViewportNodes(this.rootNode);
        }
        get Name() {
            return this.name;
        }
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        drawScene() {
            if (this.camera.isActive) {
                this.updateCanvasDisplaySizeAndCamera(Fudge.gl2.canvas);
                let backgroundColor = this.camera.getBackgoundColor();
                Fudge.gl2.clearColor(backgroundColor.X, backgroundColor.Y, backgroundColor.Z, this.camera.getBackgroundEnabled() ? 1 : 0);
                Fudge.gl2.clear(Fudge.gl2.COLOR_BUFFER_BIT | Fudge.gl2.DEPTH_BUFFER_BIT);
                // Enable backface- and zBuffer-culling.
                Fudge.gl2.enable(Fudge.gl2.CULL_FACE);
                Fudge.gl2.enable(Fudge.gl2.DEPTH_TEST);
                // TODO: don't do this for each viewport, it needs to be done only once per frame
                this.updateNodeWorldMatrix(this.viewportNodeSceneGraphRoot());
                this.drawObjects(this.rootNode, this.camera.ViewProjectionMatrix);
            }
        }
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _node The node to initialize.
         */
        initializeViewportNodes(_node) {
            console.log(_node.Name);
            if (!_node.getComponents(Fudge.TransformComponent)) {
                let transform = new Fudge.TransformComponent();
                _node.addComponent(transform);
            }
            let mesh;
            if (_node.getComponents(Fudge.MeshComponent).length == 0) {
                console.log(`No Mesh attached to node named '${_node.Name}'.`);
            }
            else {
                this.initializeNodeBuffer(_node);
                mesh = _node.getComponents(Fudge.MeshComponent)[0];
                Fudge.gl2.bufferData(Fudge.gl2.ARRAY_BUFFER, new Float32Array(mesh.Positions), Fudge.gl2.STATIC_DRAW);
                let materialComponent;
                if (_node.getComponents(Fudge.MaterialComponent)[0] == undefined) {
                    console.log(`No Material attached to node named '${_node.Name}'.`);
                    console.log("Adding standardmaterial...");
                    materialComponent = new Fudge.MaterialComponent();
                    materialComponent.initialize(Fudge.AssetManager.getMaterial("standardMaterial"));
                    _node.addComponent(materialComponent);
                }
                materialComponent = _node.getComponents(Fudge.MaterialComponent)[0];
                let positionAttributeLocation = materialComponent.Material.PositionAttributeLocation;
                Fudge.GLUtil.attributePointer(positionAttributeLocation, mesh.BufferSpecification);
                this.initializeNodeMaterial(materialComponent, mesh);
                if (materialComponent.Material.TextureEnabled) {
                    this.initializeNodeTexture(materialComponent, mesh);
                }
            }
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.initializeViewportNodes(childNode);
            }
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph() {
            let output = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.rootNode.Name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.rootNode));
        }
        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _node The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        drawObjects(_node, _matrix) {
            if (_node.getComponents(Fudge.MeshComponent).length > 0) {
                let mesh = _node.getComponents(Fudge.MeshComponent)[0];
                let transform = _node.getComponents(Fudge.TransformComponent)[0];
                let materialComponent = _node.getComponents(Fudge.MaterialComponent)[0];
                materialComponent.Material.Shader.use();
                Fudge.gl2.bindVertexArray(this.vertexArrayObjects[_node.Name]);
                Fudge.gl2.enableVertexAttribArray(materialComponent.Material.PositionAttributeLocation);
                // Compute the matrices
                let transformMatrix = transform.WorldMatrix;
                if (_node.getComponents(Fudge.PivotComponent)) {
                    let pivot = _node.getComponents(Fudge.PivotComponent)[0];
                    if (pivot)
                        transformMatrix = Fudge.Matrix4x4.multiply(pivot.Matrix, transform.WorldMatrix);
                }
                let objectViewProjectionMatrix = Fudge.Matrix4x4.multiply(_matrix, transformMatrix);
                // Supply matrixdata to shader. 
                Fudge.gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.Data);
                // Draw call
                Fudge.gl2.drawArrays(Fudge.gl2.TRIANGLES, mesh.BufferSpecification.offset, mesh.VertexCount);
            }
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.drawObjects(childNode, _matrix);
            }
        }
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursive for all its children.
         * @param _node The node which's transform worldmatrix to update.
         */
        updateNodeWorldMatrix(_node) {
            let transform = _node.getComponents(Fudge.TransformComponent)[0];
            if (!_node.Parent) {
                transform.WorldMatrix = transform.Matrix;
            }
            else {
                let parentTransform = _node.Parent.getComponents(Fudge.TransformComponent)[0];
                transform.WorldMatrix = Fudge.Matrix4x4.multiply(parentTransform.WorldMatrix, transform.Matrix);
            }
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.updateNodeWorldMatrix(childNode);
            }
        }
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        viewportNodeSceneGraphRoot() {
            let sceneGraphRoot = this.rootNode;
            while (sceneGraphRoot.Parent) {
                sceneGraphRoot = sceneGraphRoot.Parent;
            }
            return sceneGraphRoot;
        }
        /**
         * Initializes the vertexbuffer for a passed node.
         * @param _node The node to initialize a buffer for.
         */
        initializeNodeBuffer(_node) {
            let bufferCreated = Fudge.gl2.createBuffer();
            if (bufferCreated === null)
                return;
            let buffer = bufferCreated;
            this.buffers[_node.Name] = buffer;
            let vertexArrayObjectCreated = Fudge.gl2.createVertexArray();
            if (vertexArrayObjectCreated === null)
                return;
            let vertexArrayObject = vertexArrayObjectCreated;
            this.vertexArrayObjects[_node.Name] = vertexArrayObject;
            Fudge.gl2.bindVertexArray(vertexArrayObject);
            Fudge.gl2.bindBuffer(Fudge.gl2.ARRAY_BUFFER, buffer);
        }
        /**
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        initializeNodeMaterial(_materialComponent, _meshComponent) {
            let colorBuffer = Fudge.GLUtil.assert(Fudge.gl2.createBuffer());
            Fudge.gl2.bindBuffer(Fudge.gl2.ARRAY_BUFFER, colorBuffer);
            _meshComponent.applyColor(_materialComponent);
            let colorAttributeLocation = _materialComponent.Material.ColorAttributeLocation;
            Fudge.gl2.enableVertexAttribArray(colorAttributeLocation);
            Fudge.GLUtil.attributePointer(colorAttributeLocation, _materialComponent.Material.ColorBufferSpecification);
        }
        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        initializeNodeTexture(_materialComponent, _meshComponent) {
            let textureCoordinateAttributeLocation = _materialComponent.Material.TextureCoordinateLocation;
            let textureCoordinateBuffer = Fudge.gl2.createBuffer();
            Fudge.gl2.bindBuffer(Fudge.gl2.ARRAY_BUFFER, textureCoordinateBuffer);
            _meshComponent.setTextureCoordinates();
            Fudge.gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
            Fudge.GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
            Fudge.GLUtil.createTexture(_materialComponent.Material.TextureSource);
        }
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        createSceneGraph(_fudgeNode) {
            let output = "";
            for (let name in _fudgeNode.getChildren()) {
                let child = _fudgeNode.getChildren()[name];
                output += "\n";
                let current = child;
                if (current.Parent && current.Parent.Parent)
                    output += "|";
                while (current.Parent && current.Parent.Parent) {
                    output += "   ";
                    current = current.Parent;
                }
                output += "'--";
                output += child.Name;
                output += this.createSceneGraph(child);
            }
            return output;
        }
        /**
         * Updates the displaysize of the passed canvas depending on the client's size and an optional multiplier.
         * Adjusts the viewports camera and the renderingcontexts viewport to fit the canvassize.
         * @param canvas The canvas to readjust.
         * @param multiplier A multiplier to adjust the displayzise dimensions by.
         */
        updateCanvasDisplaySizeAndCamera(canvas, multiplier) {
            multiplier = multiplier || 1;
            let width = canvas.clientWidth * multiplier | 0;
            let height = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            // TODO: camera should adjust itself to resized canvas by e.g. this.camera.resize(...)
            if (this.camera.isOrthographic)
                this.camera.projectOrthographic(0, width, height, 0);
            else
                this.camera.projectCentral(width / height); //, this.camera.FieldOfView);
            Fudge.gl2.viewport(0, 0, width, height);
        }
    }
    Fudge.Viewport = Viewport;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class to compute the vertexpositions for a box.
     */
    class BoxGeometry {
        constructor(_width, _height, _depth) {
            this.positions = new Float32Array([
                //front
                -_width / 2, -_height / 2, _depth / 2,
                _width / 2, -_height / 2, _depth / 2,
                -_width / 2, _height / 2, _depth / 2,
                -_width / 2, _height / 2, _depth / 2,
                _width / 2, -_height / 2, _depth / 2,
                _width / 2, _height / 2, _depth / 2,
                //back
                _width / 2, -_height / 2, -_depth / 2,
                -_width / 2, -_height / 2, -_depth / 2,
                _width / 2, _height / 2, -_depth / 2,
                _width / 2, _height / 2, -_depth / 2,
                -_width / 2, -_height / 2, -_depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                //left
                -_width / 2, -_height / 2, -_depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                -_width / 2, _height / 2, _depth / 2,
                //right
                _width / 2, -_height / 2, _depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                _width / 2, _height / 2, _depth / 2,
                _width / 2, _height / 2, _depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                _width / 2, _height / 2, -_depth / 2,
                //top
                -_width / 2, _height / 2, _depth / 2,
                _width / 2, _height / 2, _depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                _width / 2, _height / 2, _depth / 2,
                _width / 2, _height / 2, -_depth / 2,
                //bottom
                -_width / 2, -_height / 2, -_depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                _width / 2, -_height / 2, _depth / 2
            ]);
        }
        // Get method.######################################################################################
        get Positions() {
            return this.positions;
        }
    }
    Fudge.BoxGeometry = BoxGeometry;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     */
    class Mat3 {
        constructor() {
            this.data = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ];
        }
        static projection(_width, _height) {
            let matrix = new Mat3;
            matrix.data = [
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ];
            return matrix;
        }
        get Data() {
            return this.data;
        }
        identity() {
            return new Mat3;
        }
        translate(_matrix, _xTranslation, _yTranslation) {
            return this.multiply(_matrix, this.translation(_xTranslation, _yTranslation));
        }
        rotate(_matrix, _angleInDegrees) {
            return this.multiply(_matrix, this.rotation(_angleInDegrees));
        }
        scale(_matrix, _xScale, _yscale) {
            return this.multiply(_matrix, this.scaling(_xScale, _yscale));
        }
        multiply(_a, _b) {
            let a00 = _a.data[0 * 3 + 0];
            let a01 = _a.data[0 * 3 + 1];
            let a02 = _a.data[0 * 3 + 2];
            let a10 = _a.data[1 * 3 + 0];
            let a11 = _a.data[1 * 3 + 1];
            let a12 = _a.data[1 * 3 + 2];
            let a20 = _a.data[2 * 3 + 0];
            let a21 = _a.data[2 * 3 + 1];
            let a22 = _a.data[2 * 3 + 2];
            let b00 = _b.data[0 * 3 + 0];
            let b01 = _b.data[0 * 3 + 1];
            let b02 = _b.data[0 * 3 + 2];
            let b10 = _b.data[1 * 3 + 0];
            let b11 = _b.data[1 * 3 + 1];
            let b12 = _b.data[1 * 3 + 2];
            let b20 = _b.data[2 * 3 + 0];
            let b21 = _b.data[2 * 3 + 1];
            let b22 = _b.data[2 * 3 + 2];
            let matrix = new Mat3;
            matrix.data = [
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22
            ];
            return matrix;
        }
        translation(_xTranslation, _yTranslation) {
            let matrix = new Mat3;
            matrix.data = [
                1, 0, 0,
                0, 1, 0,
                _xTranslation, _yTranslation, 1
            ];
            return matrix;
        }
        scaling(_xScale, _yScale) {
            let matrix = new Mat3;
            matrix.data = [
                _xScale, 0, 0,
                0, _yScale, 0,
                0, 0, 1
            ];
            return matrix;
        }
        rotation(_angleInDegrees) {
            let angleInDegrees = 360 - _angleInDegrees;
            let angleInRadians = angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            let matrix = new Mat3;
            matrix.data = [
                cos, -sin, 0,
                sin, cos, 0,
                0, 0, 1
            ];
            return matrix;
        }
    }
    Fudge.Mat3 = Mat3;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class for 4x4 transformation matrix operations.
     */
    class Matrix4x4 {
        constructor() {
            this.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        // Get method.######################################################################################
        get Data() {
            return this.data;
        }
        // Transformation methods.######################################################################################
        static identity() {
            return new Matrix4x4;
        }
        static scale(_matrix, _x, _y, _z) {
            return Matrix4x4.multiply(_matrix, this.scaling(_x, _y, _z));
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static multiply(_a, _b) {
            let matrix = new Matrix4x4();
            let a00 = _a.Data[0 * 4 + 0];
            let a01 = _a.Data[0 * 4 + 1];
            let a02 = _a.Data[0 * 4 + 2];
            let a03 = _a.Data[0 * 4 + 3];
            let a10 = _a.Data[1 * 4 + 0];
            let a11 = _a.Data[1 * 4 + 1];
            let a12 = _a.Data[1 * 4 + 2];
            let a13 = _a.Data[1 * 4 + 3];
            let a20 = _a.Data[2 * 4 + 0];
            let a21 = _a.Data[2 * 4 + 1];
            let a22 = _a.Data[2 * 4 + 2];
            let a23 = _a.Data[2 * 4 + 3];
            let a30 = _a.Data[3 * 4 + 0];
            let a31 = _a.Data[3 * 4 + 1];
            let a32 = _a.Data[3 * 4 + 2];
            let a33 = _a.Data[3 * 4 + 3];
            let b00 = _b.Data[0 * 4 + 0];
            let b01 = _b.Data[0 * 4 + 1];
            let b02 = _b.Data[0 * 4 + 2];
            let b03 = _b.Data[0 * 4 + 3];
            let b10 = _b.Data[1 * 4 + 0];
            let b11 = _b.Data[1 * 4 + 1];
            let b12 = _b.Data[1 * 4 + 2];
            let b13 = _b.Data[1 * 4 + 3];
            let b20 = _b.Data[2 * 4 + 0];
            let b21 = _b.Data[2 * 4 + 1];
            let b22 = _b.Data[2 * 4 + 2];
            let b23 = _b.Data[2 * 4 + 3];
            let b30 = _b.Data[3 * 4 + 0];
            let b31 = _b.Data[3 * 4 + 1];
            let b32 = _b.Data[3 * 4 + 2];
            let b33 = _b.Data[3 * 4 + 3];
            matrix.data = new Float32Array([
                b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
                b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
                b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
                b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
                b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
                b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
                b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
                b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
                b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
                b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
                b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
                b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
                b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
                b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
                b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
                b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
            ]);
            return matrix;
        }
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix Tha matrix to compute the inverse of.
         */
        static inverse(_matrix) {
            let m00 = _matrix.Data[0 * 4 + 0];
            let m01 = _matrix.Data[0 * 4 + 1];
            let m02 = _matrix.Data[0 * 4 + 2];
            let m03 = _matrix.Data[0 * 4 + 3];
            let m10 = _matrix.Data[1 * 4 + 0];
            let m11 = _matrix.Data[1 * 4 + 1];
            let m12 = _matrix.Data[1 * 4 + 2];
            let m13 = _matrix.Data[1 * 4 + 3];
            let m20 = _matrix.Data[2 * 4 + 0];
            let m21 = _matrix.Data[2 * 4 + 1];
            let m22 = _matrix.Data[2 * 4 + 2];
            let m23 = _matrix.Data[2 * 4 + 3];
            let m30 = _matrix.Data[3 * 4 + 0];
            let m31 = _matrix.Data[3 * 4 + 1];
            let m32 = _matrix.Data[3 * 4 + 2];
            let m33 = _matrix.Data[3 * 4 + 3];
            let tmp0 = m22 * m33;
            let tmp1 = m32 * m23;
            let tmp2 = m12 * m33;
            let tmp3 = m32 * m13;
            let tmp4 = m12 * m23;
            let tmp5 = m22 * m13;
            let tmp6 = m02 * m33;
            let tmp7 = m32 * m03;
            let tmp8 = m02 * m23;
            let tmp9 = m22 * m03;
            let tmp10 = m02 * m13;
            let tmp11 = m12 * m03;
            let tmp12 = m20 * m31;
            let tmp13 = m30 * m21;
            let tmp14 = m10 * m31;
            let tmp15 = m30 * m11;
            let tmp16 = m10 * m21;
            let tmp17 = m20 * m11;
            let tmp18 = m00 * m31;
            let tmp19 = m30 * m01;
            let tmp20 = m00 * m21;
            let tmp21 = m20 * m01;
            let tmp22 = m00 * m11;
            let tmp23 = m10 * m01;
            let t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
                (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
            let t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
                (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
            let t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
                (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
            let t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
                (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
            let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                d * t0,
                d * t1,
                d * t2,
                d * t3,
                d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
                d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
                d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
                d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
                d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
                d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
                d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
                d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
                d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
                d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
                d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02)) // [15]
            ]);
            return matrix;
        }
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static lookAt(_transformPosition, _targetPosition) {
            let matrix = new Matrix4x4;
            let transformPosition = new Fudge.Vector3(_transformPosition.X, _transformPosition.Y, _transformPosition.Z);
            let targetPosition = new Fudge.Vector3(_targetPosition.X, _targetPosition.Y, _targetPosition.Z);
            let zAxis = Fudge.Vector3.subtract(transformPosition, targetPosition);
            zAxis = Fudge.Vector3.normalize(zAxis);
            let xAxis;
            let yAxis;
            if (zAxis.Data != Fudge.Vector3.Up.Data) {
                xAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(Fudge.Vector3.Up, zAxis));
                yAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(zAxis, xAxis));
            }
            else {
                xAxis = Fudge.Vector3.normalize(Fudge.Vector3.subtract(transformPosition, targetPosition));
                yAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(Fudge.Vector3.Forward, xAxis));
                zAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(xAxis, yAxis));
            }
            matrix.data = new Float32Array([
                xAxis.X, xAxis.Y, xAxis.Z, 0,
                yAxis.X, yAxis.Y, yAxis.Z, 0,
                zAxis.X, zAxis.Y, zAxis.Z, 0,
                transformPosition.X,
                transformPosition.Y,
                transformPosition.Z,
                1
            ]);
            return matrix;
        }
        // Projection methods.######################################################################################
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
         */
        static centralProjection(_aspect, _fieldOfViewInDegrees, _near, _far) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
            let rangeInv = 1.0 / (_near - _far);
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                f / _aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
            return matrix;
        }
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static orthographicProjection(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1
            ]);
            return matrix;
        }
        /**
        * Wrapper function that multiplies a passed matrix by a translationmatrix with passed x-, y- and z-values.
        * @param _matrix The matrix to multiply.
        * @param _xTranslation The x-value of the translation.
        * @param _yTranslation The y-value of the translation.
        * @param _zTranslation The z-value of the translation.
        */
        static translate(_matrix, _xTranslation, _yTranslation, _zTranslation) {
            return Matrix4x4.multiply(_matrix, this.translation(_xTranslation, _yTranslation, _zTranslation));
        }
        /**
        * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
        * @param _matrix The matrix to multiply.
        * @param _angleInDegrees The angle to rotate by.
        */
        static rotateX(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.xRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateY(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.yRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateZ(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.zRotation(_angleInDegrees));
        }
        // Translation methods.######################################################################################
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        static translation(_xTranslation, _yTranslation, _zTranslation) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _xTranslation, _yTranslation, _zTranslation, 1
            ]);
            return matrix;
        }
        // Rotation methods.######################################################################################
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static xRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static yRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static zRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        // Scaling methods.######################################################################################
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        static scaling(_x, _y, _z) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                _x, 0, 0, 0,
                0, _y, 0, 0,
                0, 0, _z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
    }
    Fudge.Matrix4x4 = Matrix4x4;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class Vector3 {
        constructor(_x = 0, _y = 0, _z = 0) {
            this.data = [_x, _y, _z];
        }
        // Vectormath methods.######################################################################################
        /**
         * Adds two vectors.
         * @param _a The vector to add to.
         * @param _b The vector to add
         */
        static add(_a, _b) {
            let vector = new Vector3;
            vector.data = [_a.X + _b.X, _a.Y + _b.Y, _a.Z + _b.Z];
            return vector;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         */
        static subtract(_a, _b) {
            let vector = new Vector3;
            vector.data = [_a.X - _b.X, _a.Y - _b.Y, _a.Z - _b.Z];
            return vector;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        static cross(_a, _b) {
            let vector = new Vector3;
            vector.data = [
                _a.Y * _b.Z - _a.Z * _b.Y,
                _a.Z * _b.X - _a.X * _b.Z,
                _a.X * _b.Y - _a.Y * _b.X
            ];
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        static dot(_a, _b) {
            let scalarProduct = _a.X * _b.X + _a.Y * _b.Y + _a.Z * _b.Z;
            return scalarProduct;
        }
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         */
        static normalize(_vector) {
            let length = Math.sqrt(_vector.X * _vector.X + _vector.Y * _vector.Y + _vector.Z * _vector.Z);
            let vector = new Vector3;
            // make sure we don't divide by 0.
            if (length > 0.00001) {
                vector.data = [_vector.X / length, _vector.Y / length, _vector.Z / length];
            }
            else {
                vector.data = [0, 0, 0];
            }
            return vector;
        }
        // Get methods.######################################################################################
        get Data() {
            return this.data;
        }
        get X() {
            return this.data[0];
        }
        get Y() {
            return this.data[1];
        }
        get Z() {
            return this.data[2];
        }
        static get Up() {
            let vector = new Vector3;
            vector.data = [0, 1, 0];
            return vector;
        }
        static get Down() {
            let vector = new Vector3;
            vector.data = [0, -1, 0];
            return vector;
        }
        static get Forward() {
            let vector = new Vector3;
            vector.data = [0, 0, 1];
            return vector;
        }
        static get Backward() {
            let vector = new Vector3;
            vector.data = [0, 0, -1];
            return vector;
        }
        static get Right() {
            let vector = new Vector3;
            vector.data = [1, 0, 0];
            return vector;
        }
        static get Left() {
            let vector = new Vector3;
            vector.data = [-1, 0, 0];
            return vector;
        }
    }
    Fudge.Vector3 = Vector3;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Abstract superclass for the representation of WebGl shaderprograms.
     * Adjusted version of a class taken from Travis Vromans WebGL 2D-GameEngine
     */
    class Shader {
        constructor() {
            this.attributes = {}; // Associative array of shader atrributes.
            this.uniforms = {}; // Associative array of shader uniforms.
        }
        // Get and set methods.######################################################################################
        /**
         * Get location of an attribute by its name.
         * @param _name Name of the attribute to locate.
         */
        getAttributeLocation(_name) {
            if (this.attributes[_name] === undefined) {
                return null;
            }
            return this.attributes[_name];
        }
        /**
          * Get location of uniform by its name.
          * @param _name Name of the attribute to locate.
          */
        getUniformLocation(_name) {
            if (this.uniforms[_name] === undefined) {
                return null;
            }
            return this.uniforms[_name];
        }
        /**
         * Use this shader in Rendercontext on callup.
         */
        use() {
            Fudge.gl2.useProgram(this.program);
        }
        load(_vertexShaderSource, _fragmentShaderSource) {
            let vertexShader = Fudge.GLUtil.assert(this.compileShader(_vertexShaderSource, Fudge.gl2.VERTEX_SHADER));
            let fragmentShader = Fudge.GLUtil.assert(this.compileShader(_fragmentShaderSource, Fudge.gl2.FRAGMENT_SHADER));
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
        }
        // Utility methods.######################################################################################
        /**
         * Compiles shader from sourcestring.
         * @param _source The sourcevariable holding a GLSL shaderstring.
         * @param _shaderType The type of the shader to be compiled. (vertex or fragment).
         */
        compileShader(_source, _shaderType) {
            let shader = Fudge.GLUtil.assert(Fudge.gl2.createShader(_shaderType));
            Fudge.gl2.shaderSource(shader, _source);
            Fudge.gl2.compileShader(shader);
            let error = Fudge.GLUtil.assert(Fudge.gl2.getShaderInfoLog(shader));
            if (error !== "") {
                throw new Error("Error compiling shader: " + error);
            }
            // Check for any compilation errors.
            if (!Fudge.gl2.getShaderParameter(shader, Fudge.gl2.COMPILE_STATUS)) {
                alert(Fudge.gl2.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        createProgram(vertexShader, fragmentShader) {
            this.program = Fudge.GLUtil.assert(Fudge.gl2.createProgram());
            Fudge.gl2.attachShader(this.program, vertexShader);
            Fudge.gl2.attachShader(this.program, fragmentShader);
            Fudge.gl2.linkProgram(this.program);
            let error = Fudge.gl2.getProgramInfoLog(this.program);
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
        }
        /**
         * Iterates through all active attributes on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
         */
        detectAttributes() {
            let attributeCount = Fudge.gl2.getProgramParameter(this.program, Fudge.gl2.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < attributeCount; i++) {
                let attributeInfo = Fudge.GLUtil.assert(Fudge.gl2.getActiveAttrib(this.program, i));
                if (!attributeInfo) {
                    break;
                }
                this.attributes[attributeInfo.name] = Fudge.gl2.getAttribLocation(this.program, attributeInfo.name);
            }
        }
        /**
        * Iterates through all active uniforms on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
        */
        detectUniforms() {
            let uniformCount = Fudge.gl2.getProgramParameter(this.program, Fudge.gl2.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let info = Fudge.GLUtil.assert(Fudge.gl2.getActiveUniform(this.program, i));
                if (!info) {
                    break;
                }
                this.uniforms[info.name] = Fudge.GLUtil.assert(Fudge.gl2.getUniformLocation(this.program, info.name));
            }
        }
    }
    Fudge.Shader = Shader;
})(Fudge || (Fudge = {}));
/// <reference path="Shader.ts"/>
var Fudge;
/// <reference path="Shader.ts"/>
(function (Fudge) {
    /**
     * Represents a WebGL shaderprogram
     */
    class BasicShader extends Fudge.Shader {
        constructor() {
            super();
            this.load(this.loadVertexShaderSource(), this.loadFragmentShaderSource());
        }
        loadVertexShaderSource() {
            return `#version 300 es
 
        // an attribute is an input (in) to a vertex shader.
        // It will receive data from a buffer
        in vec4 a_position;
        in vec4 a_color;
        in vec2 a_textureCoordinate;
    
        // The Matrix to transform the positions by.
        uniform mat4 u_matrix;
    
    
        // Varying color in the fragmentshader.
        out vec4 v_color;
        // Varying texture in the fragmentshader.
        out vec2 v_textureCoordinate;
    
    
        // all shaders have a main function.
        void main() {  
            // Multiply all positions by the matrix.   
            vec4 position = u_matrix * a_position;
    
    
            gl_Position = u_matrix * a_position;
    
            // Pass color to fragmentshader.
            v_color = a_color;
            v_textureCoordinate = a_textureCoordinate;
        }
        `;
        }
        loadFragmentShaderSource() {
            return `#version 300 es
     
            // fragment shaders don't have a default precision so we need
            // to pick one. mediump is a good default. It means "medium precision"
            precision mediump float;
            
            // Color passed from vertexshader.
            in vec4 v_color;
            // Texture passed from vertexshader.
            in vec2 v_textureCoordinate;
        
        
            uniform sampler2D u_texture;
            // we need to declare an output for the fragment shader
            out vec4 outColor;
            
            void main() {
            outColor = v_color;
            outColor = texture(u_texture, v_textureCoordinate) * v_color;
            }`;
        }
    }
    Fudge.BasicShader = BasicShader;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map