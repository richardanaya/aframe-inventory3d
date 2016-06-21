# aframe-inventory3d

![description](http://i.imgur.com/1kkp8i0.jpg)

# install

```bash
npm install aframe-inventory3d
```

#scripting

To script for inventory3D objects you will be writing a javascript file that represents your code that will be run every frame. Note: your script will have to be efficient enough to avoid being turned off for taking too long. Other circumstances such as too many requests, memory exceptions, etc. may also deactivate your script, so program mindfully.

Additionally, you will have a state available for your script to use, and a number of helper methods for managing that state or making requests to modify your inventory3D object (changing materials, resizing, moving, etc.)
