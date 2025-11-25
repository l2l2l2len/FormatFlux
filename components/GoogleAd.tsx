import React, { useEffect } from 'react';

export const GoogleAd: React.FC = () => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <div className="w-full my-8 flex justify-center items-center overflow-hidden min-h-[250px] bg-brand-black/5 rounded-2xl border border-brand-black/5">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-2135452345289406"
           data-ad-slot="1348999436"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};
