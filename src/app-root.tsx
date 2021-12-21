import React, { useRef,useEffect,useState } from 'react';
import Webcam from "react-webcam";
import './App.css'

function AppRoot(){
  const videoRef=useRef<null | HTMLVideoElement>(null);
  const streamRef=useRef<null | MediaStream>(null);
  const streamRecorder=useRef<null| MediaRecorder>(null);  
  const [recording,setRecording]=useState(false);  
  const [download,setDownload]=useState("");
  const [audioSource,setAudioSource]=useState<string>(""); 
  const [videoSource,setVideoSource]=useState<string>("");  
  const [videoSourceOptions,setVideoSourceOptions]=useState<Record<string, string>[]>([]);
  const [audioSourceOptions,setAudioSourceOptions]=useState<Record<string, string>[]>([]);
  const chunks=useRef<any []>([]);

  function startRecording() {
    if(recording){
      return;
    }
    if(!streamRef.current){
      return;
    }
    streamRecorder.current=new MediaRecorder(streamRef.current);
    streamRecorder.current.start();
    streamRecorder.current.ondataavailable=function(event: BlobEvent){
      if(chunks.current){
        chunks.current.push(event.data);
      }
    }
    streamRecorder.current.pause();
    setRecording(true);
  }
  function pauseRecording() {
    if(recording){
      return;
    }
    streamRecorder.current.start();
    streamRecorder.current.ondataavailable=function(event: BlobEvent){
      if(chunks.current){
        chunks.current.push(event.data);
      }
    }
    streamRecorder.current.pause();
    setRecording(true);
  }
  
  useEffect(function() {
    if(recording){
      return;
    }
    if(chunks.current.length===0){
      return;
    }
    const blob=new Blob(chunks.current,{
      type: "video/x-matroska;codecs=avc1,opus",
    });
    setDownload(URL.createObjectURL(blob));

    chunks.current=[];
  },[recording])

  function stopRecording(){
    if(!streamRecorder.current){
      return;
    }
    streamRecorder.current.stop();
    setRecording(false);
  }
  useEffect(function(){
    //getVideo();
    async function prepareStream() {
      function gotStream(stream:MediaStream) {
        streamRef.current=stream;
        if(videoRef.current){
          videoRef.current.srcObject=stream;
        }
      }
      function gotDevices(devicesInfo:MediaDeviceInfo[]) {
        const videoSourceOption = [];
        const audioSourceOption = [];
        for(const deviceInfo of devicesInfo){
          if(deviceInfo.kind==='videoinput'){
            videoSourceOption.push({
              value:deviceInfo.deviceId,
              label:deviceInfo.label || `Camara ${deviceInfo.deviceId}`
            })
          }
          if(deviceInfo.kind==='audioinput'){
            audioSourceOption.push({
              value:deviceInfo.deviceId,
              label:deviceInfo.label || `Microfono ${deviceInfo.deviceId}`
            })
          }
        }
        setVideoSourceOptions(videoSourceOption);
        setAudioSourceOptions(audioSourceOption);
      }
      function getDevices() {
        return navigator.mediaDevices.enumerateDevices();
      }
      async function getStream(){
        if(streamRef.current){
          streamRef.current.getTracks().forEach(track=>{track.stop})
        }
        const constraints={
          audio:{
            deviceId:audioSource !==''?{exact:audioSource}:undefined,
          },
          video:{
            deviceId:videoSource !==''?{exact:videoSource}:undefined,
            width: 720,height:480
          },
        }
        try {
          const stream=await navigator.mediaDevices.getUserMedia(constraints);
          gotStream(stream);
        } catch (error) {
          console.error(error);
        }
      }
      await getStream();      
      const mediaDevices =await getDevices();
      gotDevices(mediaDevices);
    }
    prepareStream();
  },[])

  const [filtro,setFiltro]=useState("");
  const [foto,setFoto]=useState(false);

  const handleFiltroChange=(color:string)=>{
    setFiltro(color);
  }

  return(
    <div className="root">
    <div className="container">
      <div className="header">Webcam</div>
      <div className="row">
        <div className="col-8 d-flex justify-content-center p-2">
        <div className="btn-group" role="group" aria-label="Basic example">
          <button type="button" className="btn btn-dark" onClick={startRecording} disabled={recording}>Start</button>
          <button type="button" className="btn btn-danger" onClick={stopRecording} disabled={!recording}>Stop</button>
          <button type="button" className="btn btn-warning">Pause</button>
        </div>        
        </div>
        <div className="col d-flex justify-content-center p-2">
          <h2>Eliga un filtro a utilizar</h2>   
        </div>
      </div>
      <select id="videoSource" name="videoSource" value={videoSource}>
        {videoSourceOptions.map((option) =>(
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <select id="audioSource" name="audioSource" value={audioSource}>
        {audioSourceOptions.map((option) =>(
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="row d-flex align-items-center justify-content-center">
        <div className="col-8">
          <video ref={videoRef} autoPlay muted playsInline className={filtro}></video>
        </div>
        <div className="col">     
          <div className="btn-group-vertical d-flex justify-content-center" role="group" aria-label="Basic example">
            <button type="button" className="btn btn-dark" onClick={() => handleFiltroChange("gray")}>Gris</button>
            <button type="button" className="btn btn-dark"onClick={() => handleFiltroChange("sepia")}>Sepia</button>
            <button type="button" className="btn btn-dark"onClick={() => handleFiltroChange("invert")}>Invertir</button>
            <button type="button" className="btn btn-dark"onClick={() => handleFiltroChange("")}>original</button>
          </div>
        </div>
      </div>
      <div className="row d-flex align-items-center justify-content-center">
        <div className="col-8">
          {download && <video src={download} controls className="grabacion"></video>}
        </div>
        <div className="col">     
        {download && <a href={download} download="file.mp4">Descargar</a>}
        </div>
      </div>
    </div>
    </div>
  )
};

export default AppRoot;