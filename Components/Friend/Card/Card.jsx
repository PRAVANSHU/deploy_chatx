import React,{useEffect} from 'react'
import Image from 'next/image'
import Style from "./Card.module.css"
import Link from 'next/link'
import images from "../../../assets"

const Card = ({readMessage,el,i,readUser}) => {
  const handleCardClick = () => {
    console.log("Card clicked, reading messages for:", el.pubkey);
    readMessage(el.pubkey);
    readUser(el.pubkey);
  };
  
  return (
    <Link href={{pathname: '/', query: { name: `${el.name}`, address: `${el.pubkey}`}}}>
     <div className={Style.Card} onClick={handleCardClick}>
      <div className={Style.Card_box}>
        <div className={Style.Card_box_left}>
          <Image src={images.accountName}
          alt="username"
          width={50}
          height={50}
          className={Style.Card_box_left_img}/>
        </div>
        <div className={Style.Card_box_right}>
          <div className={Style.Card_box_right_middle}>
            <h4>{el.name}</h4>
            <div className={Style.Public}>
            <small>{el.pubkey.slice(21)}..</small>
            </div>
            
          </div>
          <div className={Style.Card_box_right_end}>
            <small>{i+1}</small>
          </div>
        </div>
      </div>
     </div>
    </Link>
  )
}

export default Card