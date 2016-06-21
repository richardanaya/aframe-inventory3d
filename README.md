# aframe-inventory3d

This project is to give all people an inventory of scripted 3D objects they can safely bring into their worlds from anywhere that is CORS accessable.

![description](http://i.imgur.com/1kkp8i0.jpg)

# Install

```bash
npm install aframe-inventory3d
```

#What is an Inventory3D object?
An inventory3D object is a scripted 3D object you can safely add to your aframe scene. The object is inserted into your scene by a simple reference to create the 3d entity:

```html
 <a-entity inventory-3d="https://www.inventory3d.com/cat.json"/>
```

By simply adding this file, you bring a 3d object into your scene, with complex materials, and scripted behavior which can modify the inventory 3D object in a safe manner.

#Example: StopLight

We will create a simple object definition for a stop light. This file will include an information file (stoplight.json) and a collada model file (stoplight.dae). By defining various materials in our collada 3D object these materials can be referenced by our information file for various effects.

```json
{
  "scenes": [
    {
      "url":"./stoplight.dae",
      "configuration":{
        "objects":[
          {
            "id":"StopLight",
            "materials": [
              {
                "id":"Material-StopLight-Body",
                "type":"color",
                "color":"gray"
              },{
                "id":"Material-StopLight-RedLight",
                "type":"color",
                "color":"red"
              },{
                "id":"Material-StopLight-YellowLight",
                "type":"color",
                "color":"yellow"
              },{
                "id":"Material-StopLight-GreenLight",
                "type":"color",
                "color":"green"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

These can all be created by hand, but it is easier to see what is possibly by trying out the editor at http://www.inventory3d.com

#Scripting

To script for inventory3D objects you will be writing a javascript file that represents your code that will be run every frame. Note: your script will have to be efficient enough to avoid being turned off for taking too long. Other circumstances such as too many requests, memory exceptions, etc. may also deactivate your script, so program mindfully.

Additionally, you will have a state available for your script to use, and a number of helper methods for managing that state or making requests to modify your inventory3D object (changing materials, resizing, moving, etc.)

Let's continue with our stop light example and add a script that will make it change lights. A script's sole duty is to takes in a state, and return a state. In order for your script to request changes to an inventory3d object, a reques must be placed on state.requests array. There's various helper functions to do this.  In addition there are helper variables for time.

Let's first modify our stoplight information json file to reference the script:

```json
{
     "script": "stoplight.js"
     ...
}
```

Now let's write the script itself

```javascript
function changeStopLightColor(color){
    vrChangeMaterialColor("StopLight","Material-StopLight-Green",(color=="green")?"green":"darkgreen")
    vrChangeMaterialColor("StopLight","Material-StopLight-Yellow",(color=="yellow")?"yellow":"darkyellow")
    vrChangeMaterialColor("StopLight","Material-StopLight-Red",(color=="red")?"red":"darkred")
}

//if we have no state, we must be starting up
if(state==null){
    state = {
        currentColor:"green",
        accumulativeTime:0,
    }
    changeStopLightColor(state.currentColor);
}

//accumulate time to use as a timer
state.accumulativeTime+=deltaTime;

//every 1 seconds cycle through colors
if(state.accumulativeTime>1000) {
    state.accumulativeTime %= 1000;
    
    if(state.currentColor=="green"){
        state.currentColor="red";
    } else if(state.currentColor=="red"){
        state.currentColor="yellow";
    } else if(state.currentColor=="yellow"){
        state.currentColor="green";
    }
    
    changeStopLightColor(state.currentColor);
}
```
