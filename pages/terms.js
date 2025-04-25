import React from 'react'
import Link from 'next/link'
import Style from './static.module.css'

const Terms = () => {
  return (
    <div className={Style.container}>
      <div className={Style.header}>
        <h1>Terms of Use</h1>
        <p>Last updated: May 1, 2023</p>
      </div>

      <div className={Style.termsContent}>
        <div className={Style.termsSection}>
          <h2>1. Agreement to Terms</h2>
          <p>
            Welcome to ChatDapp. By accessing or using our decentralized messaging application, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>2. Blockchain-Based Services</h2>
          <p>
            ChatDapp is a decentralized application built on blockchain technology. By using our services, you acknowledge and accept the inherent risks associated with blockchain technology, including but not limited to:
          </p>
          <ul>
            <li>Transaction finality and irreversibility</li>
            <li>Potential network congestion and fluctuating transaction fees</li>
            <li>Wallet security responsibilities</li>
            <li>Smart contract limitations</li>
          </ul>
          <p>
            We are not responsible for any losses or damages that may result from these inherent blockchain technology risks.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>3. User Responsibilities</h2>
          <p>
            As a user of ChatDapp, you are responsible for:
          </p>
          <ul>
            <li>Maintaining the security of your private keys and wallet</li>
            <li>Ensuring that your use of the platform complies with all applicable laws and regulations</li>
            <li>Using the platform in a manner that does not harm, disrupt, or interfere with other users</li>
            <li>Not using the service for illegal, harmful, or fraudulent activities</li>
          </ul>
        </div>

        <div className={Style.termsSection}>
          <h2>4. User Content</h2>
          <p>
            You retain ownership of all content you create, share, or transmit through ChatDapp. However, due to the nature of blockchain technology, messages sent through our platform are stored on the blockchain and may not be able to be completely deleted. By using our service, you grant us the right to transmit, store, and display your content as necessary to provide the service.
          </p>
          <p>
            You agree not to share content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>5. Privacy</h2>
          <p>
            Your privacy is important to us. While ChatDapp provides end-to-end encryption for messages, please understand that blockchain technology is inherently public and transparent. Your wallet address, transaction history, and other blockchain-related information may be visible to others. For more information on how we handle your data, please refer to our Privacy Policy.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>6. Intellectual Property</h2>
          <p>
            The ChatDapp platform, including all software, design, and content (excluding user-generated content), is owned by us and protected by intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any part of the platform without our explicit permission.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            CHATDAPP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>8. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL CHATDAPP OR ITS DEVELOPERS, AFFILIATES, OR PARTNERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>9. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the platform. Your continued use of ChatDapp after any changes indicates your acceptance of the revised terms.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ChatDapp operates, without regard to its conflict of law provisions.
          </p>
        </div>

        <div className={Style.termsSection}>
          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className={Style.contactInfo}>
            chatxcontactus@gmail.com
          </p>
        </div>
      </div>

      <div className={Style.footer}>
        <Link href="/">
          <button className={Style.backBtn}>Back to Chat</button>
        </Link>
      </div>
    </div>
  )
}

export default Terms 