import {useEffect, useRef, useState} from 'react';
import Tools from "./utils/Tools";
import Peer from 'peerjs';
import './App.css';
import ChatBubble from "./components/chat_bubble";

function App() {
    const my_id = localStorage.getItem("my_id")!=null?localStorage.getItem("my_id"):Tools.makeid(16);
    localStorage.setItem("my_id", my_id);
    var my_vdo_ref = useRef(null);
    var cl_vdo_ref = useRef(null);
    var msgs_ref = useRef(null);


    const [my_stream, setMyStream] = useState(null);
    const [cl_stream, setClStream] = useState(null);
    const [peer, setPeer] = useState(null);
    const [cl_id, set_cl_id] = useState("");
    const [isConnected, setConnected] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [client_peer, setClientPeer] = useState(null);

    const [send_call, setSendCall] = useState(null);
    const [recv_call, setRecvCall] = useState(null);

    const [messages, setMessages] = useState([]);


    const connectClient = () =>{
        setClientPeer(peer.connect(cl_id));
    }

    const callClient = ()=>{
        setSendCall(peer.call(cl_id, my_stream));
    }




    useEffect(()=>{
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

            navigator.mediaDevices.getUserMedia({video: true, audio: true})
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
        if(peer) {
            peer.on('connection', function (conn) {
                setConnected(true);
                set_cl_id(conn.peer);
                setClientPeer(conn);
                callClient();

            });

            peer.on('call', (call) => {
                setRecvCall(call);
            });
        }

    }, [peer])

    useEffect(()=>{
        if(client_peer) {
            client_peer.on('open', function () {
                setConnected(true);
                // Receive messages
                client_peer.on('data', function (data) {
                    if (typeof data == "object"){
                        updateMessages(data);
                    }
                });
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
        if(my_vdo_ref.current!=null && my_stream) {
            my_vdo_ref.current.srcObject = my_stream;
            my_vdo_ref.current.play();
        }
    },[my_stream])

    useEffect(()=>{
        if(cl_vdo_ref.current!=null && cl_stream) {
            cl_vdo_ref.current.srcObject = cl_stream;
            cl_vdo_ref.current.play();


            my_vdo_ref.current.srcObject = my_stream;
            my_vdo_ref.current.play();
            my_vdo_ref.current.volume = 0;
        }
    },[cl_stream])

    useEffect(()=>{
        if (msgs_ref.current!=null){
            msgs_ref.current.scrollTop = msgs_ref.current.scrollHeight;
        }
    }, [messages]);


    const updateMessages = (message)=>{
        setMessages(messages => [...messages, message]);
    }
    const sendMessage=(message)=>{
        const msg = {
            type : 'text',
            text : message,
            timestamp: Date.now(),
            _peer: my_id
        }
        updateMessages(msg);
        client_peer.send(msg);
    }
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
                    <div style={{height: '100%', display: 'flex'}}>
                        <div className="uk-position-relative" style={{flex:1}}>
                            <video ref={cl_vdo_ref} className="uk-position-absolute uk-position-top-left uk-height-1-1 uk-width-1-1"/>
                            <video ref={my_vdo_ref}  className="uk-position-absolute uk-position-small uk-position-top-left uk-border-rounded"
                                   style={{objectFit:'cover',  width: 120, objectPosition:'center'}}/>
                            <span className="uk-position-absolute uk-position-bottom-left uk-padding-small uk-light uk-text-small">Connected PEER : {cl_id}</span>

                        </div>
                        <div style={{backgroundColor:'white', minWidth:350, display:'flex', flexDirection:'column'}}>
                            <div ref={msgs_ref}  className="uk-padding-small uk-overflow-auto uk-background-muted" style={{flex:1, backgroundImage:'url(https://www.transparenttextures.com/patterns/bright-squares.png)'}}>
                                {
                                    messages.map(message=>{
                                        return(
                                            <ChatBubble key={message.timestamp} ob={message}/>
                                        )
                                    })
                                }
                            </div>
                            <form onSubmit={(event)=>{
                                event.preventDefault();
                                let message = event.target.querySelector("#message").value;
                                if (message===""){return}
                                sendMessage(message);
                                event.target.querySelector("#message").value = "";
                            }}
                                  className="uk-padding-small" style={{borderTop:'1px solid rgba(0,0,0,0.06)'}}>
                                <button onClick={()=>{callClient();}}>Call</button>
                                <input className="uk-input uk-border-pill uk-form-small uk-width-expand" id="message" placeholder="Message" />
                            </form>
                        </div>
                    </div>
                )
            }



        </div>
    );
}

export default App;

