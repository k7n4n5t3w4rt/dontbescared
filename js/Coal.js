// @flow
import { h, render } from "../web_modules/preact.js";
import { useState, useEffect } from "../web_modules/preact/hooks.js";
import { createStyles, rawStyles } from "../web_modules/simplestyle-js.js";
import screenfull from "../web_modules/screenfull.js";
import htm from "../web_modules/htm.js";
import * as THREE from "../web_modules/three.js";

const html = htm.bind(h);
rawStyles({
    body: {
        margin: "0px",
        overflow: "hidden",
    },
    canvas: {
        margin: "0px",
        overflow: "hidden",
    },
});

/*::
type Props = {
	params: string
};
*/
const Coal = (props /*: Props */) => {
    // State
    const [rotation, setRotation] = useState(0); // - Doesn't work with Flow
    const [then, setThen] = useState(null); // - Doesn't work with Flow
    const [trigger, setTrigger] = useState(0); // - Doesn't work with Flow

    // Defaults
    let p = new URL(document.location.toString()).searchParams;
    let lat /*: string */ = "";
    let lng /*: string */ = "";
    let elevation /*: string */ = "";
    let scale /*: string */ = "";
    // Browser only

    if (typeof process === "undefined" || process.release.name !== "node") {
        p = new URL(document.location.toString()).searchParams;
        lat = p.get("lat") || "-35.3082237";
        lng = p.get("lng") || "149.1222036";
        elevation = p.get("elevation") || "700";
        scale = p.get("scale") || "500";
    }

    useEffect(() => {
        // Rotation
        const coalElement /*:  Object  | null */ = document.getElementById(
            "coal",
        );
        const spinTheCoal = (timestamp /*: number */) /*: void */ => {
            if (then === null) {
                setThen(timestamp);
            } else {
                const fpsInterval = 1000 / 24;
                const elapsed = timestamp - then;
                if (elapsed > fpsInterval) {
                    // Get ready for next frame by setting then=now, but also adjust for your
                    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
                    setThen(timestamp - (elapsed % fpsInterval));

                    if (coalElement !== null) {
                        // console.log("Doing the rotation...");
                        coalElement.object3D.rotation.y += rotation;
                        // For next time....
                        setRotation(rotation + 0.000002);
                    } else {
                        //console.log("Didn't find the coal...");
                    }
                } else {
                    //console.log(elapsed + " !> " + fpsInterval);
                    setTrigger(trigger + 1);
                }
            }
        };
        window.requestAnimationFrame(spinTheCoal);

        // Events
        const mainContainer = document.getElementById("goodthing") || null;
        if (mainContainer !== null) {
            // Modernizr doesn't have an es module npm package so it's
            // imported with a <script> tag in `index.html`
            // $FlowFixMe
            if (Modernizr.hasEvent("touchend")) {
                mainContainer.addEventListener(
                    "touchend",
                    () => {
                        // Doesn't work on iPhone ~ https://caniuse.com/#feat=fullscreen
                        // Plus we only want fullscreen on touch devices
                        screenfull.request().then(() /*: void */ => {
                            // setTimeout(() /*: void */ => {}, 500);
                        });
                    },
                    { once: true },
                );
            }
        }
    });

    return html`
        <a-scene
            embedded
            vr-mode-ui="enabled: false"
            arjs="sourceType:webcam;debugUIEnabled:false;videoTexture:true;"
        >
            <a-assets timeout="30000">
                <a-asset-item
                    id="gltfmodel"
                    src="/img/coal/coal.glb"
                    response-type="arraybuffer"
                ></a-asset-item>
            </a-assets>
            <a-entity
                id="coal"
                position="0 ${elevation} 0"
                scale="${scale} ${scale} ${scale} "
                gps-entity-place="latitude: ${lat}; longitude: ${lng};"
            >
                <a-entity
                    position="0 0 0"
                    scale="0 0 0"
                    gltf-model="url(/img/coal/coal.glb)"
                >
                </a-entity>
            </a-entity>
            <a-camera
                near="1"
                far="70000"
                fov="76"
                rotation-reader
                gps-camera="
			positionMinAccuracy:10000;
			minDistance:0;
			maxDistance:0;"
            ></a-camera>
            <!-- LIGHTING-->
            <a-entity light="type: ambient; intensity: 2;"></a-entity>
        </a-scene>
    `;
};
// look-at="[gps-camera]"
// simulateAltitude:500;
// simulateLatitude:-35.30822;
// simulateLongitude:149.1239828;"
// Elevation: https://elvis2018-ga.fmecloud.com/fmedatastreaming/client_access/ELVIS_GetElevationAtPoint.fmw?pt_lat=-35.3082237&pt_long=149.1222036

export default Coal;
