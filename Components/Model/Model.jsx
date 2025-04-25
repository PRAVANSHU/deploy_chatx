import React, { useState, useContext } from 'react';
import Image from 'next/image';
import images from '../../assets';

import Style from './Model.module.css';
import { ChatAppContext } from '@/Context/ChatAppContext';
import { Loader } from '../index1';

const Model = ({ openBox, title, address, head, info, smallInfo, image, functionName }) => {
  // State to handle name and address
  const [name, setName] = useState('');
  const [accountAddress, setAccountAddress] = useState('');

  // Context API for loading state
  const { loading } = useContext(ChatAppContext);

  return (
    <div className={Style.Model}>
      <div className={Style.Model_box}>
        {/* Left Section with Image */}
        <div className={Style.Model_box_left}>
          <Image src={image} alt="buddy" width={700} height={700} />
        </div>

        {/* Right Section with Form and Buttons */}
        <div className={Style.Model_box_right}>
          <h1>
            {title} <span>{head}</span>
          </h1>
          <p>{info}</p>
          <small>{smallInfo}</small>

            {
              loading==true ? (
                <Loader/>
              ):(
                <div className={Style.Model_box_right_name}>
            {/* Input for Name */}
            <div className={Style.Model_box_right_name_info}>
              <Image src={images.username} alt="username" width={30} height={30} />
              <input
                type="text"
                placeholder="your name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Input for Address */}
            <div className={Style.Model_box_right_name_info}>
              <Image src={images.account} alt="user" width={30} height={30} />
              <input
                type="text"
                placeholder={address || 'Enter Address..'}
                onChange={(e) => setAccountAddress(e.target.value)}
              />
            </div>

            {/* Submit and Cancel Buttons */}
            <div className={Style.Model_box_right_name_btn}>
              <button onClick={() => {
                if(name.trim() === "") {
                  alert("Please enter your name");
                  return;
                }
                functionName({ name, accountAddress })
              }}>
                <Image src={images.send} alt="send" width={30} height={30} />
                Submit
              </button>
              <button onClick={() => openBox(false)}>
                <Image src={images.close} alt="cancel" width={30} height={30} />
                Cancel
              </button>
            </div>
          </div>

              )
            }

          
        </div>
      </div>
    </div>
  );
};

export default Model;
