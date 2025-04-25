import React, { useContext, useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

// Internal imports
import Style from './NavBar.module.css';
import { ChatAppContext } from '../../Context/ChatAppContext';
import { Model, Error } from "../index1";
import images from "../../assets";

const NavBar = () => {
   const menuItems = [
      { menu: "ALL USERS", link: "/alluser" },
      { menu: "CHAT", link: "/" },
      { menu: "GROUP CHAT", link: "/groupchat" },
      { menu: "CONTACT", link: "/contact" },
      { menu: "FAQS", link: "/faqs" },
      { menu: "TERMS OF USE", link: "/terms" },
   ];

   // State
   const [active, setActive] = useState(2);
   const [open, setOpen] = useState(false);
   const [openModel, setOpenModel] = useState(false);

   const { account, userName, connectWallet, createAccount, error } = useContext(ChatAppContext);

   // Listen for account creation events
   useEffect(() => {
      const handleAccountCreated = () => {
         setOpenModel(false);
      };

      window.addEventListener('accountCreated', handleAccountCreated);
      
      return () => {
         window.removeEventListener('accountCreated', handleAccountCreated);
      };
   }, []);

   return (
      <div className={Style.NavBar}>
         <div className={Style.NavBar_box}>
            <div className={Style.NavBar_box_left}>
               <Image src={images.logo} alt="logo" width={50} height={50} />
            </div>
            <div className={Style.NavBar_box_right}>
              {/*//desktop */}
               <div className={Style.NavBar_box_right_menu}>
                  {menuItems.map((el, i) => (
                     <div
                        onClick={() => setActive(i + 1)}
                        key = {i}
                        className={`${Style.NavBar_box_right_menu_item} ${active === i + 1 ? Style.active_btn : ""}`}
                     >
                        <Link className={Style.NavBar_box_right_menu_item_link} href={el.link}>
                           {el.menu}
                        </Link>
                     </div>
                  ))}
               </div>
                {/*//mobile */}
                {open && ( <div className={Style.mobile_menu}>
                  {menuItems.map((el, i) => (
                     <div
                        onClick={() => setActive(i + 1)}
                        key={i+1}

                        className={`${Style.mobile_menu_item} ${active === i + 1 ? Style.active_btn : ""}`}
                     >
                        <Link className={Style.mobile_menu_item_link} href={el.link}>
                           {el.menu}
                        </Link>
                     </div>
                  ))}
                  <p className={Style.mobile_menu_btn}>
                    <Image src={images.close} alt="close" width={50} height={50}
                    onClick={()=>setOpen(false)}/>
                  </p>
               </div>     
                )}

                {/*//connect wallet */}
                <div className={Style.NavBar_box_right_connect}>
                  {account == ""?(<button onClick={()=> connectWallet()}>
                   <span>Connect Wallet</span>
                  </button>):(
                    <button onClick={()=>setOpenModel(true)}>
                      {""}
                      <Image src={userName?images.accountName:images.create2}
                      alt="Account image"
                      width={20}
                      height={20}/>
                      {""}
                      <small>{userName || "Create Account"}</small>
                    </button>
                  )}
                </div>
              <div className={Style.NavBar_box_right_open}
              onClick={()=>setOpen(true)}>
                <Image src={images.open} alt="open"
                width={30}
                height={30}/>
              </div>
            </div>
         </div>

         {/* model component */}
         {openModel && (
            <div className={Style.modelBox}>
                <Model openBox={setOpenModel}
                  title="Welcome To"
                  head="CHATX"
                  info="ChatX is a blockchain-powered messaging app that puts privacy back in your hands. No central servers. No tracking. Just end-to-end encrypted, peer-to-peer chats secured by Web3."
                  smallInfo="Kindly select you name..."
                  image={images.hero}
                  functionName={createAccount}
                  address={account}
                />
            </div>
         )}
         {error && error !== "Please Install and Connect Your Wallet" ? <Error error={error} /> : null}

      </div>
   );
};

export default NavBar;
