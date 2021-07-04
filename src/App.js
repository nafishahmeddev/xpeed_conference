import {useEffect, useRef, useState} from 'react';
import Tools from "./utils/Tools";
import Peer from 'peerjs';
import './App.css';

function App() {
    const my_id = localStorage.getItem("my_id")!=null?localStorage.getItem("my_id"):Tools.makeid(16);
    localStorage.setItem("my_id", my_id);
    var my_vdo_ref = useRef(null);
    var cl_vdo_ref = useRef(null);


    const [my_stream, setMyStream] = useState(null);
    const [cl_stream, setClStream] = useState(null);
    const [peer, setPeer] = useState(null);
    const [cl_id, set_cl_id] = useState("");
    const [isConnected, setConnected] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [client_peer, setClientPeer] = useState(null);

    const [send_call, setSendCall] = useState(null);
    const [recv_call, setRecvCall] = useState(null);


    const connectClient = () =>{
        setClientPeer(peer.connect(cl_id));
    }

    const callClient = ()=>{
        setSendCall(peer.call(cl_id, my_stream));
    }




    useEffect(function (){
        if (isLoading) {
            setPeer(new Peer(my_id));
            // Older browsers might not implement mediaDevices at all, so we set an empty object first
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }


            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = function (constraints) {

                    // First get ahold of the legacy getUserMedia, if present
                    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                    console.log(getUserMedia);
                    // Some browsers just don't implement it - return a rejected promise with an error
                    // to keep a consistent interface
                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                    }

                    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                    return new Promise(function (resolve, reject) {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }

            navigator.mediaDevices.getUserMedia({video: true, audio: false})
                .then(stream => {
                    setMyStream(stream);
                })
                .catch(function (error) {
                    console.log(error.message);
                });

            setLoading(false);
        }

    },[isLoading]);

    useEffect(()=>{
        if (!peer){return}
        peer.on('connection', function(conn) {
            setConnected(true);
            set_cl_id(conn.peer);
            callClient();
            conn.on('data', function(data){
                // Will print 'hi!'
                console.log(data);
            });
        });

        peer.on('call', (call) => {
            setRecvCall(call);
        });

    }, [peer])

    useEffect(()=>{
        if(client_peer) {
            client_peer.on('open', function () {
                setConnected(true);
                // Receive messages
                client_peer.on('data', function (data) {
                    console.log('Received', data);
                });

                // Send messages
                client_peer.send('Hello!');
            });
        }
    }, [client_peer])

    useEffect(()=>{
        console.log(send_call);
        if (send_call) {
            send_call.on('stream', (remoteStream) => {
                setClStream(remoteStream);
            });
        }
    },[send_call])
    useEffect(()=>{
        console.log(send_call);
        if (recv_call) {
            recv_call.answer(my_stream);
            recv_call.on('stream', (remoteStream) => {
                setClStream(remoteStream);
            });

        }
    },[recv_call])

    useEffect(()=>{
        if(my_vdo_ref.current!=null && my_stream!=null) {
            my_vdo_ref.current.srcObject = my_stream;
            my_vdo_ref.current.play();
        }
    }, [my_stream])

    useEffect(()=>{
        if(cl_vdo_ref.current!=null && cl_stream!=null) {
            cl_vdo_ref.current.srcObject = cl_stream;
            cl_vdo_ref.current.play();


            my_vdo_ref.current.srcObject = my_stream;
            my_vdo_ref.current.play();
        }
    }, [cl_stream])


    return (
        <div className="App">



            {
                !isConnected?(
                    <div className="uk-position-absolute uk-position-small uk-position-center uk-card uk-card-default uk-border-rounded">
                        <div className="uk-card-header">
                            <h5>Connection Details</h5>
                        </div>

                        <div className="uk-card-body uk-text-center">
                            <input style={{letterSpacing:3, color:'black'}} className="uk-input uk-width-medium uk-text-center uk-border-rounded uk-input-muted uk-form-small" readOnly={true} disabled={true} value={my_id}/>
                            <p className="uk-margin-small">OR</p>
                            <table className="uk-table uk-table-small uk-table-justify uk-margin-remove">
                                <tr>
                                    <td>
                                        <input placeholder="Please enter pair" className="uk-input uk-form-small uk-border-rounded" type="text" value={cl_id} onChange={(event)=>{set_cl_id(event.target.value)}}/>
                                    </td>
                                    <td className="uk-table-shrink">
                                        <button className="uk-button uk-button-small uk-border-rounded uk-button-primary" onClick={()=>{if(cl_id.length<16||cl_id.length>16){alert("Please enter correct pair");return};connectClient()}}>Pair</button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                ):(
                    <div>
                        <div>
                            <video ref={cl_vdo_ref} className="uk-position-absolute uk-position-top-left uk-height-1-1 uk-width-1-1"/>
                            <video ref={my_vdo_ref}  className="uk-position-absolute uk-position-small uk-position-top-left uk-border-rounded"
                                   style={{objectFit:'cover',  width: 120, objectPosition:'center'}}/>
                            <span className="uk-position-absolute uk-position-bottom-right uk-padding-small uk-light uk-text-small">
                       Connected PEER : {cl_id}
                   </span>

                        </div>
                        <div>
                            <img/>
                        </div>
                    </div>
                )
            }



        </div>
    );
}

export default App;
