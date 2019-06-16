/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
namespace Fudge {
    // interface ShaderParameters {
    //     [key: string]: number | Color;
    // }

    export class Coat extends Mutable {
        public name: string = "Coat";
        protected renderData: {[key: string]: unknown};

        public mutate(_mutator: Mutator): void {
            super.mutate(_mutator);
        }

        public useRenderData(_renderShader: RenderShader): void {/* injected by RenderExtender*/ }
        protected reduceMutator(): void { /**/ }
    }


    @RenderInjector.decorateCoat
    export class CoatColored extends Coat {
        public color: Color;

        constructor(_color?: Color) {
            super();
            this.color = _color || new Color(0.5, 0.5, 0.5, 1);
        }
    }

    @RenderInjector.decorateCoat
    export class CoatTextured extends Coat {
        public texture: TextureImage = null;
        // just ideas so far
        public tilingX: number;
        public tilingY: number;
        public repetition: boolean;
        // private textureSource: string;
        //     this.textureSource = _textureSource;
    }



    /**
     * Adds and enables a Texture passed to this material.
     * @param _textureSource A string holding the path to the location of the texture.
     */
    // public addTexture(_textureSource: string): void {
    //     this.textureEnabled = true;
    // }
    /**
     * Removes and disables a texture that was added to this material.
     */
    // public removeTexture(): void {
    //     this.textureEnabled = false;
    //     this.textureSource = "";
    // }




    /*/*
     * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
     * @param _material The node's materialcomponent.
     * @param _mesh The node's meshcomponent.
     */
    // private initializeNodeTexture(_materialComponent: ComponentMaterial, _meshComponent: ComponentMesh): void {
    //     let textureCoordinateAttributeLocation: number = _materialComponent.Material.TextureCoordinateLocation;
    //     let textureCoordinateBuffer: WebGLBuffer = gl2.createBuffer();
    //     gl2.bindBuffer(gl2.ARRAY_BUFFER, textureCoordinateBuffer);
    //     _meshComponent.setTextureCoordinates();
    //     gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
    //     GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
    //     GLUtil.createTexture(_materialComponent.Material.TextureSource);
    // }
}