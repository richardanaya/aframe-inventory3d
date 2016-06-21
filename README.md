# aframe-inventory3d

![description](http://i.imgur.com/1kkp8i0.jpg)

# install

```bash
npm install aframe-inventory3d
```

#what is an inventory3D object?

#a simple object: StopLight

We will create a simple object definition for a stop light. This file will include an information file (stoplight.json) and a collada model file (stoplight.dae). By defining various materials in our collada 3D object these materials can be referenced by our information file for various effects.

```json
{

}
```

#scripting

To script for inventory3D objects you will be writing a javascript file that represents your code that will be run every frame. Note: your script will have to be efficient enough to avoid being turned off for taking too long. Other circumstances such as too many requests, memory exceptions, etc. may also deactivate your script, so program mindfully.

Additionally, you will have a state available for your script to use, and a number of helper methods for managing that state or making requests to modify your inventory3D object (changing materials, resizing, moving, etc.)

Let's continue with our stop light example and add a script that will make it change lights:

```json
{

}
```
