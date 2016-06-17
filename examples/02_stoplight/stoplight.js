//if we have no state, lets initialize
if(state==null){
    state = {
        color:"green",
        accumulativeTime:0,
        //make a request to changes material color to green
        requests:[
            {type:"materialColor",target:"Cube",material:"Material_001-material",color:"green"}
        ]
    }
}

//accumulate time to use as a timer
state.accumulativeTime+=deltaTime;

//every 1 seconds
if(state.accumulativeTime>1000){
    state.accumulativeTime = 0;

    //if green request material to be made red
    if(state.color=="green"){
        state.color="red";
        state.requests = [
            {type:"materialColor",target:"Cube",material:"Material_001-material",color:"red"}
        ]
    }
    //if red request material to be made green
    else if(state.color=="red"){
        state.color="green";
        state.requests = [
            {type:"materialColor",target:"Cube",material:"Material_001-material",color:"green"}
        ]
    }
}