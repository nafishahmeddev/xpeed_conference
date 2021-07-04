import {useEffect, useRef, useState} from 'react';

export default function ChatBubble({ob}){
    const my_id = localStorage.getItem("my_id");
    const time = new Date(ob.timestamp);
    return (
        <div className="uk-margin-small" style={{clear:'both', marginBottom:10, display:'flex', justifyContent:ob._peer===my_id?'flex-end':'flex-start'}}>
            <div className="uk-card uk-card-default uk-card-small  uk-text-left"
                 style={{
                     padding:'6px 15px',
                     borderRadius: 15,
                     maxWidth: 250,
                     backgroundColor:ob._peer===my_id?'#befdbe':'#ffffff'}}>
                <div className="uk-text-small">{ob.text}</div>
                <span style={{fontSize: 9}}>{time.getHours()}:{time.getMinutes()}:{time.getSeconds()} - {time.getDate()}/{time.getMonth()}/{time.getFullYear()}</span>

            </div>
        </div>
    )
}
