namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    import ƒ = FudgeCore;

    export enum NODEMENU {
        EMPTY = "Empty Node",
        BOX = "Box Mesh Node",
        PYRAMID = "Pyramid Mesh Node",
        PLANE = "Plane Mesh Node"
    }
    export enum COMPONENTMENU {
        MESHBOX = "Mesh Component.Box Mesh Component",
        MESHPLANE = "Mesh Component.Plane Mesh Component",
        MESHPYRAMID = "Mesh Component.Pyramid Mesh Component",
        AUDIOLISTENER = "Audio Listener Component",
        AUDIO = "Audio Component",
        ANIMATION = "Animation Component",
        CAMERA = "Camera Component",
        LIGHT = "Light Component",
        SCRIPT = "Script Component",
        TRANSFORM = "Transform Component"
    }

    export class MultiLevelMenuManager {

        public static buildFromSignature(_signature: string, _mutator?: ƒ.Mutator): ƒ.Mutator {
            let mutator: ƒ.Mutator = _mutator || {};
            let signatureLevels: string[] = _signature.split(".");
            if (signatureLevels.length > 1) {
                let subSignature: string = signatureLevels[1];
                for (let i: number = 2; i < signatureLevels.length; i++) {
                    subSignature = subSignature + "." + signatureLevels[i];

                }
                if (mutator[signatureLevels[0]] != null) {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature, <ƒ.Mutator>mutator[signatureLevels[0]]);
                }
                else {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature);
                }
            }
            else {
                mutator[signatureLevels[0]] = signatureLevels[0];
            }
            return mutator;
        }
    }
}