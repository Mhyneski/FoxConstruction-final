import React from 'react';
import styles from '../css/aboutUs.module.css';
import personImage from '../assets/contractor.jpg'; 

const AboutUs = () => {
  return (
    <div className={styles.aboutUsContainer}>
      <div className={styles.header}>
        <h2>About Us</h2>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.textContainer}>
          <h1>Welcome To Fox Construction Company</h1>
          <p>
          Charlie Puth - Attention [Official Video]
From Charlie's album Voicenotes!
Download/Stream: https://Atlantic.lnk.to/VoicenotesID

Light Switch out now!
Download/stream: https://charlieputh.lnk.to/LightSwitchID

Video Directed by Emil Nava

Written By: Charlie Puth and Jacob Kasher
Produced By: Charlie Puth
Vocal Production: Charlie Puth
Instruments: Korg Triton Studio, Juno 60, Omnisphere, Trillian for the Bass, Rhodes 77, Yamaha DX7, Pro Tools I2, Fender Stratocaster, Martin HD-28 Acoustic
Mixed By: Manny Marroquin & Charlie Puth at Larrabee Sound Studios
Recorded At: Home Studio of Charlie Puth & Tour Bus of Charlie Puth
Mastered By: Dave Kutch at the Mastering Palace

Store - http://smarturl.it/CPAttentionMerchYT

Subscribe for more official content from Charlie Puth:
https://Atlantic.lnk.to/CPsubscribeID

Follow Charlie
http://charlieputh.com 
  / charlieputh   
  / charlieputh   
  / charlieputh  
  / charlieputh  
  / charlieputh  

The official YouTube channel of Atlantic Records artist Charlie Puth. Subscribe for the latest music videos, performances, and more.

#CharliePuth #Attention #MusicVideo
          </p>
          <div className={styles.signature}>
            <p>Hector Manalo</p>
          </div>
        </div>
        <div className={styles.imageContainer}>
          <img src={personImage} alt="Hector Manalo" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
