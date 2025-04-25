import React from 'react'
import Image from 'next/image'
import Style from "./Filter.module.css"
import images from "../../assets"

const Filter = () => {
  return (
    <div className={Style.Filter}>
      <div className={Style.Filter_box}>
        <div className={Style.Filter_box_left}>
          <div className={Style.Filter_box_left_search}>
            <Image src={images.search} alt='search' width={20} height={20}/>
            <input type='text' placeholder='search..' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filter