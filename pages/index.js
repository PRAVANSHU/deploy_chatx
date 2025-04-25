import React ,{useState,useEffect,useContext} from 'react'

//internal import
// import { ChatAppContext } from "../Context/ChatAppContext";
import { Filter,Friend } from '@/Components/index1';

const ChatApp = () => {
  // const { account, userName, error } = useContext(ChatAppContext);

  
  return (
   <div>
    <Filter/>
    <Friend/>
    </div>
  )
}

export default ChatApp;