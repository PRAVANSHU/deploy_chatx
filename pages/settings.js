import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Style from './static.module.css'
import images from '../assets'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className={Style.container}>
      <div className={Style.header}>
        <h1>Settings</h1>
        <p>Configure your account and application preferences</p>
      </div>

      <div className={Style.settingsContainer}>
        <div className={Style.settingsTabs}>
          <button 
            className={`${Style.tabButton} ${activeTab === 'profile' ? Style.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`${Style.tabButton} ${activeTab === 'privacy' ? Style.activeTab : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
          <button 
            className={`${Style.tabButton} ${activeTab === 'appearance' ? Style.activeTab : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button 
            className={`${Style.tabButton} ${activeTab === 'notifications' ? Style.activeTab : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`${Style.tabButton} ${activeTab === 'advanced' ? Style.activeTab : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>

        <div className={Style.settingsContent}>
          {activeTab === 'profile' && (
            <div className={Style.tabContent}>
              <h2>Profile Settings</h2>

              <div className={Style.profileSettings}>
                <div className={Style.profilePicture}>
                  <Image src={images.accountName} alt="Profile" width={80} height={80} />
                  <button className={Style.changeImageBtn}>Change Image</button>
                </div>

                <div className={Style.profileForm}>
                  <div className={Style.formGroup}>
                    <label>Display Name</label>
                    <input type="text" placeholder="Your display name" defaultValue="pravanshu" />
                  </div>

                  <div className={Style.formGroup}>
                    <label>Bio</label>
                    <textarea placeholder="Tell us about yourself..." rows={3}></textarea>
                  </div>

                  <div className={Style.formGroup}>
                    <label>Wallet Address</label>
                    <input type="text" disabled value="0xa0EbFe5FC32AA580B89A5cCda1E185d3cF820708" />
                  </div>
                </div>
              </div>

              <button className={Style.submitBtn}>Save Changes</button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className={Style.tabContent}>
              <h2>Privacy Settings</h2>

              <div className={Style.settingOption}>
                <div>
                  <h3>Message Encryption</h3>
                  <p>Enable end-to-end encryption for all messages</p>
                </div>
                <div className={Style.toggle}>
                  <input type="checkbox" id="encryption" defaultChecked />
                  <label htmlFor="encryption"></label>
                </div>
              </div>

              <div className={Style.settingOption}>
                <div>
                  <h3>Online Status</h3>
                  <p>Show when you're active to others</p>
                </div>
                <div className={Style.toggle}>
                  <input type="checkbox" id="onlineStatus" defaultChecked />
                  <label htmlFor="onlineStatus"></label>
                </div>
              </div>

              <div className={Style.settingOption}>
                <div>
                  <h3>Read Receipts</h3>
                  <p>Show others when you've read their messages</p>
                </div>
                <div className={Style.toggle}>
                  <input type="checkbox" id="readReceipts" defaultChecked />
                  <label htmlFor="readReceipts"></label>
                </div>
              </div>

              <button className={Style.dangerBtn}>Clear Chat History</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className={Style.tabContent}>
              <h2>Appearance Settings</h2>
              
              <div className={Style.themeSelection}>
                <h3>Theme</h3>
                <div className={Style.themeOptions}>
                  <div className={`${Style.themeOption} ${Style.activeTheme}`}>
                    <div className={Style.themeSwatch} style={{ backgroundColor: '#1e1e1e' }}></div>
                    <span>Dark</span>
                  </div>
                  <div className={Style.themeOption}>
                    <div className={Style.themeSwatch} style={{ backgroundColor: '#f5f5f5' }}></div>
                    <span>Light</span>
                  </div>
                  <div className={Style.themeOption}>
                    <div className={Style.themeSwatch} style={{ backgroundColor: '#252d3a' }}></div>
                    <span>Midnight</span>
                  </div>
                </div>
              </div>

              <div className={Style.formGroup}>
                <label>Accent Color</label>
                <div className={Style.colorOptions}>
                  <div className={`${Style.colorOption} ${Style.activeColor}`} style={{ backgroundColor: '#f18203' }}></div>
                  <div className={Style.colorOption} style={{ backgroundColor: '#3d5afe' }}></div>
                  <div className={Style.colorOption} style={{ backgroundColor: '#00c853' }}></div>
                  <div className={Style.colorOption} style={{ backgroundColor: '#ff5252' }}></div>
                  <div className={Style.colorOption} style={{ backgroundColor: '#aa00ff' }}></div>
                </div>
              </div>

              <div className={Style.formGroup}>
                <label>Font Size</label>
                <select defaultValue="medium">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <button className={Style.submitBtn}>Apply Changes</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={Style.tabContent}>
              <h2>Notification Settings</h2>
              
              <div className={Style.settingOption}>
                <div>
                  <h3>Enable Notifications</h3>
                  <p>Receive notifications for new messages</p>
                </div>
                <div className={Style.toggle}>
                  <input type="checkbox" id="enableNotifications" defaultChecked />
                  <label htmlFor="enableNotifications"></label>
                </div>
              </div>

              <div className={Style.settingOption}>
                <div>
                  <h3>Sound</h3>
                  <p>Play sound for new messages</p>
                </div>
                <div className={Style.toggle}>
                  <input type="checkbox" id="soundNotifications" defaultChecked />
                  <label htmlFor="soundNotifications"></label>
                </div>
              </div>
              
              <div className={Style.formGroup}>
                <label>Notification Preview</label>
                <select defaultValue="nameAndMessage">
                  <option value="nameAndMessage">Name and message</option>
                  <option value="nameOnly">Name only</option>
                  <option value="noPreview">No preview</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className={Style.tabContent}>
              <h2>Advanced Settings</h2>
              
              <div className={Style.formGroup}>
                <label>Gas Price (Gwei)</label>
                <input type="number" min="1" defaultValue="20" />
                <p className={Style.helpText}>Higher gas price means faster transactions but higher fees</p>
              </div>

              <div className={Style.formGroup}>
                <label>Network</label>
                <select defaultValue="ethereum">
                  <option value="ethereum">Ethereum Mainnet</option>
                  <option value="polygon">Polygon</option>
                  <option value="optimism">Optimism</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>
              </div>

              <div className={Style.formGroup}>
                <label>Web3 Provider</label>
                <select defaultValue="metamask">
                  <option value="metamask">MetaMask</option>
                  <option value="walletconnect">WalletConnect</option>
                  <option value="coinbase">Coinbase Wallet</option>
                </select>
              </div>

              <div className={Style.dangerZone}>
                <h3>Danger Zone</h3>
                <button className={Style.dangerBtn}>Export All Data</button>
                <button className={Style.dangerBtn}>Delete Account</button>
              </div>
            </div>
          )}
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

export default Settings 