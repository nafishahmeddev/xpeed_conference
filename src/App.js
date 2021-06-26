import {useEffect, useRef, useState} from 'react';
import Tools from "./utils/Tools";
import Peer from 'peerjs';
import './App.css';

function App() {
    const my_id = localStorage.getItem("my_id")!=null?localStorage.getItem("my_id"):Tools.makeid(5);
    localStorage.setItem("my_id", my_id);
    const peer = new Peer(my_id);
    var my_vdo_ref = useRef(null);
    var cl_vdo_ref = useRef(null);

    var my_stream = null;
    var cl_stream = null;


    const callClient = (id)=>{
        const call = peer.call(id, my_stream);
        call.on('stream', (remoteStream) => {
        });
    }
    peer.on('call', (call) => {
            call.answer(my_stream); // Answer the call with an A/V stream.
            call.on('stream', (remoteStream) => {
                // Show stream in some <video> element.
                cl_stream = remoteStream;
                cl_vdo_ref.current.srcObject = remoteStream;
                cl_vdo_ref.current.play();
            });

    });



    useEffect(function (){
        navigator.getUserMedia = (navigator.mediaDevices.getUserMedia|| navigator.getUserMedia);
        navigator.getUserMedia({video: true, audio: false})
            .then(stream => {
                my_stream = stream;
                my_vdo_ref.current.srcObject = stream;
                my_vdo_ref.current.play();
            })
            .catch(function (error) {
                console.log(error);
            });
    },[]);
    return (
        <div className="App">


            <video ref={cl_vdo_ref} className="uk-position-absolute uk-position-top-left uk-height-1-1 uk-width-1-1"/>
            <video ref={my_vdo_ref}  className="uk-position-absolute uk-position-small uk-position-top-left uk-border-rounded"
                   style={{objectFit:'cover',  width: 120, objectPosition:'center'}}/>
                   <span className="uk-position-absolute uk-position-bottom-right uk-padding-small uk-light uk-text-small">
                       Peer Id : {my_id}
                   </span>


        </div>
    );
}

export default App;
