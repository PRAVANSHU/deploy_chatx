import React, { useState } from 'react'
import Link from 'next/link'
import Style from './static.module.css'

const FAQs = () => {
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    if (openFAQ === index) {
      setOpenFAQ(null)
    } else {
      setOpenFAQ(index)
    }
  }

  const faqs = [
    {
      question: "What is ChatDapp?",
      answer: "ChatDapp is a decentralized messaging application built on blockchain technology. It allows users to communicate securely using their web3 wallet for authentication. All messages are stored on the blockchain, ensuring privacy and censorship resistance."
    },
    {
      question: "How do I create an account?",
      answer: "To use ChatDapp, you need to connect your Web3 wallet (such as MetaMask). Once connected, you can create a username that will be associated with your wallet address. There's no need for email or password as authentication is handled by your wallet."
    },
    {
      question: "Are my messages encrypted?",
      answer: "Yes, all messages on ChatDapp are encrypted using end-to-end encryption. This means only you and the intended recipient can read the messages, ensuring your conversations remain private and secure."
    },
    {
      question: "How do I add friends?",
      answer: "You can add friends by navigating to the 'All Users' section and searching for users by their username or wallet address. Once you find the user you want to connect with, simply click the 'Add Friend' button to send a friend request."
    },
    {
      question: "How do group chats work?",
      answer: "Group chats allow you to communicate with multiple friends at once. To create a group, go to the 'Group Chat' section and click 'Create Group'. You can then name your group and add friends from your friends list. All members of the group will be able to see and send messages."
    },
    {
      question: "Are there any fees for using ChatDapp?",
      answer: "Since ChatDapp operates on the blockchain, transactions (such as sending messages) may incur small gas fees depending on the network's congestion. However, we've optimized our smart contracts to minimize these costs as much as possible."
    },
    {
      question: "How can I change my profile information?",
      answer: "You can update your profile by going to the Settings page and selecting the Profile tab. From there, you can change your display name and profile picture. Note that your wallet address cannot be changed as it's the unique identifier for your account."
    },
    {
      question: "Is ChatDapp compatible with mobile devices?",
      answer: "Yes, ChatDapp is designed with a responsive interface that works on desktops, tablets, and mobile phones. For the best experience on mobile, we recommend using a mobile wallet like MetaMask Mobile or Coinbase Wallet."
    },
    {
      question: "Can I delete my messages?",
      answer: "Due to the immutable nature of blockchain technology, messages cannot be completely deleted once they are recorded on the chain. However, you can clear your chat history from your local device through the Privacy settings."
    },
    {
      question: "How do I report inappropriate content or users?",
      answer: "If you encounter inappropriate content or behavior, please contact our support team through the Contact page or email us at chatxcontactus@gmail.com. Provide as much detail as possible about the issue, including user information and message timestamps if available."
    }
  ]

  return (
    <div className={Style.container}>
      <div className={Style.header}>
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about using ChatDapp</p>
      </div>

      <div className={Style.faqContainer}>
        {faqs.map((faq, index) => (
          <div key={index} className={Style.faqItem}>
            <div 
              className={`${Style.faqQuestion} ${openFAQ === index ? Style.faqOpen : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <h3>{faq.question}</h3>
              <span className={Style.faqToggle}>
                {openFAQ === index ? '−' : '+'}
              </span>
            </div>
            
            {openFAQ === index && (
              <div className={Style.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={Style.faqHelp}>
        <h2>Still have questions?</h2>
        <p>If you couldn't find the answer to your question, feel free to reach out to our support team.</p>
        <Link href="/contact">
          <button className={Style.submitBtn}>Contact Support</button>
        </Link>
      </div>

      <div className={Style.footer}>
        <Link href="/">
          <button className={Style.backBtn}>Back to Chat</button>
        </Link>
      </div>
    </div>
  )
}

export default FAQs 