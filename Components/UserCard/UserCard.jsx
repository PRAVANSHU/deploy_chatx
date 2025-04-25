import React from 'react'
import Image from "next/image"
import Style from "./UserCard.module.css"
import images from "../../assets"

const UserCard = ({ el, i, addFriends }) => {
  return (
    <div className={Style.UserCard}>
      <Image
        src={images[`image${i+1}`]}
        className={Style.UserCard_box_img}
        alt="user"
        width={100}
        height={100}
      />
      <div className={Style.UserCard_box_info}>
        <h3>{el.name}</h3>
        <p>{el.accountAddress.slice(0, 20)}...</p>
        <button onClick={() => addFriends({ name: el.name, accountAddress: el.accountAddress })}>
          Add Friend
        </button>
      </div>
      <small className={Style.number}>{i + 1}</small>
    </div>
  );
}

export default UserCard;
