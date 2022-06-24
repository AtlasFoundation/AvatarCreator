import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { Buffer } from "buffer";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import html2canvas from "html2canvas";
import { VRM } from "@pixiv/three-vrm";
import VRMExporter from "../library/VRM/VRMExporter";
import TextureMerger from "../library/TextureMerger";
export const sceneService = {
  loadModel,
  updatePose,
  updateMorphValue,
  getMorphValue,
  download,
  getMesh,
  setMaterialColor,
  getObjectValue,
  saveScreenShotByElementId,
  getScreenShot,
  getScreenShotByElementId,
  getModelFromScene,
  getMergedMesh
};
var meshArray = [];
function getMergedMesh(asset : any){
    const geometryArray = [];
    let bones = [];
    var textureArray = [];
    var meshMaterial = [];  
    var mergedResult = [];
    const skinnedMeshes = {};
    var skeleton;
    asset.traverse(child => {
      if(child.isMesh)
      {
        textureArray.push(child.material[0].map)
        meshArray.push(child);
        const clonedGeometry = child.geometry.clone()
        clonedGeometry.morphTargetsRelative = true;
        geometryArray.push(clonedGeometry.applyMatrix4( child.matrixWorld ));
        meshMaterial.push(child.material[0]);
      }
      if(child instanceof THREE.Bone){
        let check = false;
        bones.map(bone =>{
          if(bone.name === child.name){
            check = true;
            return;
          }
        })
        if(!check) bones.push(child)
      }

      if (child.isSkinnedMesh) {
        skinnedMeshes[child.name] = child;
        skeleton = child.skeleton;
      }
      
    })

    const mergedMaterial = onMerging(textureArray, meshArray);
    // var mergedGemeometry = BufferGeometryUtils.mergeBufferGeometries(geometryArray, true);
    // var material = new THREE.MeshBasicMaterial({ map: mergedMaterial });

    // for(let i = 0; i < geometryArray.length; i++){
    //   mergedResult = mergeAttribute(geometryArray[i], mergedResult, mergedGemeometry)
    // }
    // const mergedMesh = new THREE.SkinnedMesh(mergedGemeometry, material);
    // var newSkeleton = new THREE.Skeleton( bones, skeleton.boneInverses );
    // mergedMesh.bind( newSkeleton );
    // return mergedMesh;
  }

  function modifyChildUV(mesh, range){
    var uvAttrAry = mesh.geometry.attributes.uv.array;
    for (var i = 0; i < uvAttrAry.length; i += 2){
      uvAttrAry[i] = (uvAttrAry[i] * (range.endU - range.startU) + range.startU);
      uvAttrAry[i + 1] = (uvAttrAry[i + 1] * (range.startV - range.endV) + range.endV);
    }
    // mesh.geometry.attributes.uv.needUpdates;
  }

  function onMerging(textureArray, meshArray){
    var pros = {}
    textureArray.map((item, index) => {
      pros['texture' + (index + 1)] = item ;
    })
    var textureMerger =  new TextureMerger(pros);
    textureMerger.mergedTexture.flipY = false;
    meshArray.map((mesh, index) => {
      modifyChildUV(mesh, textureMerger.ranges['texture' + (index+1)]);
      mesh.material[0].map = textureMerger.mergedTexture;
      
      mesh.material[0].alphaMode = 'AlphaBlend';
      mesh.material[0].side = THREE.DoubleSide;
      mesh.material[0].transparent = true
      mesh.material[0].alphaWrite  = false;
      mesh.material[0].alphaWrite = false;
      mesh.material[0].format = THREE.RGBAFormat;

      console.log(mesh)
    })
    return textureMerger.mergedTexture;
  };

 function mergeAttribute(geo1, geo2, res) {
    if(Object.keys(geo2).length === 0) return geo1;
    var attributes = ["normal", "position", "skinIndex", "skinWeight"];
    var dataLengths = [3, 3, 4, 4];
    var geometryArray = [];
    // var geo = new THREE.BufferGeometry();
    // geo = BufferGeometryUtils.mergeBufferGeometries(geometryArray)
    for (var attIndex = 0; attIndex < attributes.length; attIndex++) {
        var currentAttribute = attributes[attIndex];
        var geo1Att = geo1.getAttribute(currentAttribute);
        var geo2Att = geo2.getAttribute(currentAttribute);
        var currentArray = null;
        if (currentAttribute == "skinIndex") currentArray = new Uint16Array(geo1Att.array.length + geo2Att.array.length)
        else currentArray = new Float32Array(geo1Att.array.length + geo2Att.array.length)
        var innerCount = 0;
        geo1Att.array.map((item) => {
            currentArray[innerCount] = item;
            innerCount++;
        });
        geo2Att.array.map((item) => {
            currentArray[innerCount] = item;
            innerCount++;
        });
        geo1Att.array = currentArray;
        geo1Att.count = currentArray.length / dataLengths[attIndex];
        res.setAttribute(currentAttribute, geo1Att);
      }
    return res;
}

async function getModelFromScene(scene: any, format: any) {
  if (format && format === 'gltf/glb') {
    const exporter = new GLTFExporter()
    var options = {
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    }
    const glb: any = await new Promise((resolve) => exporter.parse(scene, resolve, options))
    return new Blob([glb], { type: 'model/gltf-binary' })
  }
}
async function getScreenShot() {
  return await getScreenShotByElementId("mint-screenshot-canvas-wrap")
}

async function getScreenShotByElementId(id) {
  let snapShotElement = document.getElementById(id);
  return await html2canvas(snapShotElement).then(async function (canvas) {
    var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    const base64Data = Buffer.from(
      dataURL.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const blob = new Blob([base64Data], { type: "image/jpeg" });
    console.log("BLOB: ", blob);
    return blob;
  });
}

async function saveScreenShotByElementId(id: string) {
  setTimeout(() => {
    setTimeout(() => {
      getScreenShotByElementId(id).then((screenshot) => {
        const link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);
        function save(blob, filename) {
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
        }
        function saveArrayBuffer(buffer) {
          save(new Blob([buffer], { type: "image/json" }), "screenshot.jpg");
        }
        saveArrayBuffer(screenshot);
      });
    }, 600);
  }, 600);
}

async function getObjectValue(target: any, scene: any, value: any) {
  if (target && scene) {
    const object = scene.getObjectByName(target);
    return object.material.color;
  }
}

function createTextCanvas(text) {
  var canvas = document.createElement("canvas");
  var context: any = canvas.getContext("2d");

  context.font = 11 + "px Arial";

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#a22813";
  context.font = 18 + "px  Arial";
  context.miterLimit = 5;
  context.lineWidth = 3;
  context.strokeStyle = "white";
  context.strokeText(text, 45, 130);
  context.fillStyle = "red";
  context.fillText(text, 45, 130);
  context.clientWidth = 560;
  context.clientHeight = 560;
  context.background = "#FFFFFF";

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
}

async function getMesh(name: any, scene: any) {
  const object = scene.getObjectByName(name);
  return object;
}

async function setMaterialColor(scene: any, value: any, target: any) {
  if (scene && value) {
    const object = scene.getObjectByName(target);
    const randColor = value;
    const skinShade = new THREE.Color(
      `rgb(${randColor},${randColor},${randColor})`
    );
    object.material[0].color.set(skinShade);
  }
}

async function loadModel(file: any, type: any) {
  if (type && type === "gltf/glb" && file) {
    const loader = new GLTFLoader();
    return loader.loadAsync(file, (e) => {
      console.log(e.loaded)
    }).then((gltf) => {
      VRM.from( gltf ).then( ( model ) => {
      return model;
      });
    });
  }

  if (type && type === "vrm" && file) {
    const loader = new GLTFLoader();
    return loader.loadAsync(file).then((model) => {
      VRM.from(model).then((vrm) => {
        console.log("VRM Model: ", vrm);
      });
      return model;
    });
  }
}

async function getMorphValue(key: any, scene: any, target: any) {
  if (key && scene) {
    var mesh = scene.getObjectByName(target);
    const index = mesh.morphTargetDictionary[key];
    if (index !== undefined) {
      return mesh.morphTargetInfluences[index];
    }
  }
}

async function updateMorphValue(
  key: any,
  value: any,
  scene: any,
  targets: any
) {
  if (key && targets && value) {
    targets.map((target: any) => {
      var mesh = scene.getObjectByName(target);
      const index = mesh.morphTargetDictionary[key];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = value;
      }
    });
  }
}

async function updatePose(name: any, value: any, axis: any, scene: any) {
  var bone = scene.getObjectByName(name);
  if (bone instanceof THREE.Bone) {
    switch (axis) {
      case "x":
        bone.rotation.x = value;
        break;
      case "y":
        bone.rotation.y = value;
        break;
      case "z":
        bone.rotation.z = value;
        break;
      default:
    }
    return value;
  }
}

async function download(
  model: any,
  fileName: any,
  format: any,
  screenshot: any
) {
  // We can use the SaveAs() from file-saver, but as I reviewed a few solutions for saving files,
  // this approach is more cross browser/version tested then the other solutions and doesn't require a plugin.
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);
  function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  function saveString(text, filename) {
    save(new Blob([text], { type: "text/plain" }), filename);
  }

  function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], { type: "application/octet-stream" }), filename);
  }
  function saveArrayBufferVRM(vrm, filename) {
    save(new Blob([vrm], { type: "octet/stream" }), filename);
  }

  // Specifying the name of the downloadable model
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`;

  if (format && format === "gltf/glb") {
    const exporter = new GLTFExporter();
    var options = {
      trs: false,
      onlyVisible: false,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity,
    };
    exporter.parse(
      model.scene,
      function (result) {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, `${downloadFileName}.glb`);
        } else {
          var output = JSON.stringify(result, null, 2);
          saveString(output, `${downloadFileName}.gltf`);
        }
      },
      options
    );
  } else if (format && format === "obj") {
    const exporter = new OBJExporter();
    saveArrayBuffer(exporter.parse(model.scene), `${downloadFileName}.obj`);
  } else if (format && format === "vrm") {
    const exporter = new VRMExporter();
    // const merged = getMergedMesh(model.scene);
    getMergedMesh(model.scene);
   
    // meshArray.forEach(mesh => {
    //   model.scene.remove(mesh)
    // });

    // model.scene.add(merged);
    exporter.parse(model, (vrm : ArrayBuffer) => {
      saveArrayBufferVRM(vrm, `${downloadFileName}.vrm`);
    });
  }
}
