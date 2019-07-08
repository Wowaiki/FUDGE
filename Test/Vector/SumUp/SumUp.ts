/// <reference path="../../../Core/build/Fudge.d.ts" />
//import * as ƒ from "../../../Core/build/Fudge";

namespace SumUp {
    import ƒ = Fudge;
    
    let v1: ƒ.Vector3 = new ƒ.Vector3(1, 0, 0);
    let v2: ƒ.Vector3 = new ƒ.Vector3(0, 1, 0);
    let v3: ƒ.Vector3 = new ƒ.Vector3(0, 0, 1);

    let sum: ƒ.Vector3 = ƒ.Vector3.SUM(v1, v2, v3);
    console.log(sum);  
}